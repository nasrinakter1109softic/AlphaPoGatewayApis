import { Injectable } from '@nestjs/common';
import { Repository, SelectQueryBuilder } from 'typeorm';

/**
 * Generic, entity-agnostic pagination + filter + (column/jsonb) search service.
 * You can reuse it for ANY table by passing the repository + a small config.
 */

export type OrderDir = 'ASC' | 'DESC';

export interface JsonSearchKey {
  /** The jsonb column name on the table (e.g. `payload`) */
  column: string;
  /** JSON path pieces. Example: ['crypto_address', 'currency'] */
  path: string[];
}

export interface GenericQueryConfig {
  /** Which direct columns are allowed to be filtered by `filters` */
  allowedFilterColumns?: string[];
  /** Which direct columns are searched with the `search` text (ILIKE) */
  searchableColumns?: string[];
  /** Which jsonb paths are searchable with the `search` text */
  jsonSearchKeys?: JsonSearchKey[];
  /** Optional hard filters you always want to inject (e.g., multi-tenant companyId) */
  enforcedFilters?: Record<string, any>;
  /** Default order map if caller doesn't pass orderBy/orderDir */
  defaultOrder?: { column: string; direction: OrderDir };
  relations?: string[];
}

export interface GenericQueryOptions {
  page?: number;
  limit?: number;
  /** Free-text search */
  search?: string;
  /** Dynamic filters on flat columns (must be whitelisted in config.allowedFilterColumns) */
  filters?: Record<string, any>;
  /** Order by a flat column (must be in allowedFilterColumns or searchableColumns ideally) */
  orderBy?: string;
  orderDir?: OrderDir;
  /** Optional date range filtering on a timestamp column */
  dateFrom?: string | Date;
  dateTo?: string | Date;
  dateColumn?: string; // default createdAt
}

export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

@Injectable()
export class GenericQueryService {
  async query<T extends object>(
    repo: Repository<T>,
    alias: string,
    opts: GenericQueryOptions = {},
    cfg: GenericQueryConfig = {},
  ): Promise<PagedResult<T>> {
    const page = Number(opts.page ?? 1);
    const limit = Math.min(Number(opts.limit ?? 20), 100);
    const qb = repo.createQueryBuilder(alias);
    (cfg.relations ?? []).forEach((relation) => {
      qb.leftJoinAndSelect(`${alias}.${relation}`, relation);
    });

    // Inject enforced filters first (e.g., companyId)
    if (cfg.enforcedFilters) {
      this.applyFlatFilters(qb, alias, cfg.enforcedFilters);
    }

    // User supplied filters (only allowed ones)
    if (opts.filters) {
      const allowed = new Set(cfg.allowedFilterColumns ?? []);
      const safeFilters: Record<string, any> = {};
      for (const [k, v] of Object.entries(opts.filters)) {
        if (!cfg.allowedFilterColumns || allowed.has(k)) {
          safeFilters[k] = v;
        }
      }
      this.applyFlatFilters(qb, alias, safeFilters);
    }

    // Date range filter (common use-case)
    if (opts.dateFrom || opts.dateTo) {
      const col = opts.dateColumn ?? 'createdAt';
      if (opts.dateFrom) {
        qb.andWhere(`${alias}.${col} >= :dateFrom`, {
          dateFrom: opts.dateFrom,
        });
      }
      if (opts.dateTo) {
        qb.andWhere(`${alias}.${col} <= :dateTo`, { dateTo: opts.dateTo });
      }
    }

    // Search (both flat & json)
    if (opts.search) {
      const params: Record<string, any> = { s: `%${opts.search}%` };
      const parts: string[] = [];

      // flat columns
      (cfg.searchableColumns ?? []).forEach((col) => {
        parts.push(`${alias}."${col}"::text ILIKE :s`);
      });

      // json paths
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (cfg.jsonSearchKeys ?? []).forEach((j, i) => {
        const jsonExpr = `${alias}.${j.column} #>> '{${j.path.join(',')}}' ILIKE :s`;
        parts.push(jsonExpr);
      });

      if (parts.length) {
        qb.andWhere(`(${parts.join(' OR ')})`, params);
      }
    }

    // Ordering
    if (opts.orderBy) {
      qb.orderBy(`${alias}.${opts.orderBy}`, opts.orderDir ?? 'DESC');
    } else if (cfg.defaultOrder) {
      qb.orderBy(
        `${alias}.${cfg.defaultOrder.column}`,
        cfg.defaultOrder.direction,
      );
    } else {
      qb.orderBy(`${alias}.createdAt`, 'DESC');
    }

    qb.skip((page - 1) * limit).take(limit);

    const [items, total] = await qb.getManyAndCount();
    return {
      items,
      total,
      page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ---------------- private helpers ----------------
  private applyFlatFilters<T extends object>(
    qb: SelectQueryBuilder<T>,
    alias: string,
    filters: Record<string, any>,
  ) {
    for (const [key, value] of Object.entries(filters)) {
      const paramKey = `f_${key}`;
      if (value === null) {
        qb.andWhere(`${alias}.${key} IS NULL`);
      } else {
        qb.andWhere(`${alias}.${key} = :${paramKey}`, { [paramKey]: value });
      }
    }
  }
}

/* ---------------------------
 * Usage Examples
 * ---------------------------

// 1) CallbackLog (with json payload search) -----------------
const result = await genericQueryService.query(
  callbackLogRepo,
  'log',
  {
    page: 1,
    limit: 20,
    search: 'btc',
    filters: { provider: 'alphapo', companyId: 10 },
    orderBy: 'createdAt',
    orderDir: 'DESC',
  },
  {
    allowedFilterColumns: ['provider', 'status', 'companyId', 'eventType'],
    searchableColumns: ['provider', 'eventType', 'status'],
    jsonSearchKeys: [
      { column: 'payload', path: ['txid'] },
      { column: 'payload', path: ['crypto_address', 'address'] },
      { column: 'payload', path: ['currency_sent', 'currency'] },
    ],
    enforcedFilters: { companyId: 10 }, // pulled from auth context
    defaultOrder: { column: 'createdAt', direction: 'DESC' },
  },
);

// 2) Deposits (no json search) -------------------------------
const deposits = await genericQueryService.query(
  depositRepo,
  'd',
  {
    page: 1,
    search: 'BTC',
    filters: { status: 'confirmed', companyId: 10 },
    dateFrom: '2025-07-01',
    dateTo: '2025-07-28',
  },
  {
    allowedFilterColumns: ['status', 'companyId', 'currencyReceived'],
    searchableColumns: ['currencySent', 'currencyReceived'],
    defaultOrder: { column: 'createdAt', direction: 'DESC' },
  },
);

// 3) Withdrawals (search on flat columns only) ---------------
const withdrawals = await genericQueryService.query(
  withdrawalRepo,
  'w',
  {
    page: 2,
    limit: 50,
    search: 'failed',
    filters: { companyId: 10 },
    orderBy: 'status',
  },
  {
    allowedFilterColumns: ['companyId', 'status'],
    searchableColumns: ['status', 'currency'],
  },
);

*/
