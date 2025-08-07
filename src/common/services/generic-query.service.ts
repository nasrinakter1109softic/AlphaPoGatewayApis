import { Injectable } from '@nestjs/common';
import { Repository, SelectQueryBuilder } from 'typeorm';

export type OrderDir = 'ASC' | 'DESC';

export interface JsonSearchKey {
  /** The jsonb column name on the table (e.g., `payload`) */
  column: string;
  /** JSON path pieces. Example: ['crypto_address', 'currency'] */
  path: string[];
}

export interface GenericQueryConfig {
  /** Columns allowed for filtering in `filters` */
  allowedFilterColumns?: string[];
  /** Columns searchable with the `search` text (ILIKE) */
  searchableColumns?: string[];
  /** JSONB paths searchable with the `search` text */
  jsonSearchKeys?: JsonSearchKey[];
  /** Hard-coded filters to always apply (e.g., multi-tenant companyId) */
  enforcedFilters?: Record<string, any>;
  /** Default ordering if orderBy/orderDir is not provided */
  defaultOrder?: { column: string; direction: OrderDir };
  /** Relations to include in the query (e.g., ['company', 'company as c']) */
  relations?: string[];
  /** Fields to exclude from the main table and relations (supports dot notation, e.g., 'fees.amount') */
  excludedFields?: string[];
}

export interface GenericQueryOptions {
  page?: number;
  limit?: number;
  /** Free-text search term */
  search?: string;
  /** Dynamic filters on flat columns (must be in allowedFilterColumns) */
  filters?: Record<string, any>;
  /** Column to order by (ideally in allowedFilterColumns or searchableColumns) */
  orderBy?: string;
  /** Order direction (ASC or DESC) */
  orderDir?: OrderDir;
  /** Date range filtering on a timestamp column */
  dateFrom?: string | Date;
  dateTo?: string | Date;
  dateColumn?: string; // defaults to createdAt
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
  /**
   * Executes a paginated query with support for flat or nested responses and excludes specified fields.
   * @param repo The TypeORM repository for the entity
   * @param alias The table alias (e.g., 'd' for deposits)
   * @param opts Query options (pagination, filters, search, etc.)
   * @param cfg Query configuration (allowed columns, relations, excluded fields, etc.)
   * @param selectFields Specific fields to select for flat response (e.g., ['d.id AS id', 'company.name AS company_name'])
   * @returns A paginated result with flat or nested items, total count, and pagination metadata
   */
  async query<T extends object>(
    repo: Repository<T>,
    alias: string,
    opts: GenericQueryOptions = {},
    cfg: GenericQueryConfig = {},
    selectFields: string[] = [],
  ): Promise<PagedResult<any>> {
    const page = Number(opts.page ?? 1);
    const limit = Math.min(Number(opts.limit ?? 20), 100);
    const qb = repo.createQueryBuilder(alias);

    // Handle relations (with and without aliases)
    const relationAliases: Record<string, string> = {};
    (cfg.relations ?? []).forEach((relation) => {
      const [relationName, relationAlias] = relation.includes(' as ')
        ? relation.split(' as ').map((s) => s.trim())
        : [relation, relation];
      qb.leftJoinAndSelect(`${alias}.${relationName}`, relationAlias);
      relationAliases[relationName] = relationAlias;
    });

    // Apply selectFields for flat response
    if (selectFields.length > 0) {
      qb.select(selectFields.map((field) => `${field}`));
    }

    // Apply enforced filters (e.g., multi-tenant companyId)
    if (cfg.enforcedFilters) {
      this.applyFlatFilters(qb, alias, cfg.enforcedFilters);
    }

    // Apply user-provided filters (only allowed columns)
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

    // Apply date range filter
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

    // Apply search (flat columns and JSONB paths)
    if (opts.search) {
      const params: Record<string, any> = { s: `%${opts.search}%` };
      const parts: string[] = [];

      // Search flat columns
      (cfg.searchableColumns ?? []).forEach((col) => {
        parts.push(`${alias}."${col}"::text ILIKE :s`);
      });

      // Search JSONB paths
      (cfg.jsonSearchKeys ?? []).forEach((j) => {
        const jsonExpr = `${alias}.${j.column} #>> '{${j.path.join(',')}}' ILIKE :s`;
        parts.push(jsonExpr);
      });

      if (parts.length) {
        qb.andWhere(`(${parts.join(' OR ')})`, params);
      }
    }

    // Apply ordering
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

    // Apply pagination
    qb.skip((page - 1) * limit).take(limit);

    // Execute query and fetch results
    console.log('Generated SQL:', qb.getSql()); // Debug: Log generated SQL
    try {
      if (selectFields.length > 0) {
        // Use getRawMany for flat response when selectFields is provided
        const [rawItems, total] = await Promise.all([
          qb.getRawMany(),
          qb.getCount(),
        ]);
        return {
          items: rawItems,
          total,
          page,
          pageSize: limit,
          totalPages: Math.ceil(total / limit),
        };
      } else {
        // Use getMany for nested response when selectFields is not provided
        const [items, total] = await Promise.all([qb.getMany(), qb.getCount()]);

        // Filter out excludedFields from main entity and relations, supporting dot notation
        const filteredItems = items.map((item) => {
          const filteredItem = { ...item };

          // Handle excluded fields for main entity
          (cfg.excludedFields ?? []).forEach((field) => {
            // Check if field is for main entity (no dot notation)
            if (!field.includes('.')) {
              delete filteredItem[field];
            }
          });

          // Handle excluded fields for relations
          (cfg.relations ?? []).forEach((relation) => {
            const [relationName] = relation.includes(' as ')
              ? relation.split(' as ').map((s) => s.trim())
              : [relation];
            if (filteredItem[relationName]) {
              // Handle dot notation for relation fields (e.g., 'fees.amount')
              const relationExcludedFields = (cfg.excludedFields ?? [])
                .filter((field) => field.startsWith(`${relationName}.`))
                .map((field) => field.split('.')[1]);

              if (Array.isArray(filteredItem[relationName])) {
                // Handle one-to-many relations (e.g., fees)
                filteredItem[relationName] = filteredItem[relationName].map(
                  (relItem: any) => {
                    const filteredRelItem = { ...relItem };
                    relationExcludedFields.forEach((field) => {
                      delete filteredRelItem[field];
                    });
                    return filteredRelItem;
                  },
                );
              } else {
                // Handle many-to-one relations (e.g., company, cryptoAddress)
                const filteredRelItem = { ...filteredItem[relationName] };
                relationExcludedFields.forEach((field) => {
                  delete filteredRelItem[field];
                });
                filteredItem[relationName] = filteredRelItem;
              }
            }
          });

          return filteredItem;
        });

        return {
          items: filteredItems,
          total,
          page,
          pageSize: limit,
          totalPages: Math.ceil(total / limit),
        };
      }
    } catch (error) {
      throw new Error(`Query failed: ${error.message}`);
    }
  }

  /**
   * Applies flat filters to the query builder.
   * @param qb The TypeORM query builder
   * @param alias The table alias
   * @param filters The filters to apply (key-value pairs)
   */
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
