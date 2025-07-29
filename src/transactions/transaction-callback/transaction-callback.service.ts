import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CryptoAddress } from '../deposit/entities/crypto-address.entity';
import {
  CallbackLog,
  TransactionLogKind,
  TransactionLogStatus,
} from './entities/callback-log.entity';
import { DepositFee } from '../deposit/entities/deposit-fee.entity';
import { DepositTransaction } from '../deposit/entities/deposit-transaction.entity';
import { Repository } from 'typeorm';
import { Deposit } from '../deposit/entities/deposit.entity';
import { DepositStatus } from '../deposit/enums/deposit-status.enum';
import { Withdrawal } from '../withdraw/entities/withdrawal.entity';
import { WithdrawalTransaction } from '../withdraw/entities/withdrawal-transaction.entity';
import { WithdrawalFee } from '../withdraw/entities/withdrawal-fee.entity';
import { WithdrawalStatus } from '../withdraw/enums/withdrawal-status.enum';
import { GenericQueryService } from 'src/common/services/generic-query.service';

@Injectable()
export class TransactionCallbackService {
  constructor(
    @InjectRepository(Deposit)
    private readonly depositRepo: Repository<Deposit>,
    @InjectRepository(CryptoAddress)
    private readonly addressRepo: Repository<CryptoAddress>,
    @InjectRepository(DepositTransaction)
    private readonly txRepo: Repository<DepositTransaction>,
    @InjectRepository(DepositFee)
    private readonly feeRepo: Repository<DepositFee>,
    @InjectRepository(CallbackLog)
    private readonly callbackRepo: Repository<CallbackLog>,
    @InjectRepository(Withdrawal)
    private readonly withdrawalRepo: Repository<Withdrawal>,
    @InjectRepository(WithdrawalTransaction)
    private readonly wTxRepo: Repository<WithdrawalTransaction>,
    @InjectRepository(WithdrawalFee)
    private readonly wFeeRepo: Repository<WithdrawalFee>,
    private readonly genericQueryService: GenericQueryService,
  ) {}

  async handleAlphapoCallback(dto: any, signature?: string) {
    if (dto.type === 'deposit') {
      // 1) Keep raw log

      // 2) Upsert crypto address
      let address = await this.addressRepo.findOne({
        where: { address: dto.crypto_address.address },
      });
      if (!address) {
        address = this.addressRepo.create({
          address: dto.crypto_address.address,
          currency: dto.crypto_address.currency,
          foreignId: dto.crypto_address.foreign_id,
          tag: dto.crypto_address.tag,
          companyId: 1,
        });
        address = await this.addressRepo.save(address);
      }
      const log = this.callbackRepo.create({
        companyId: address.companyId,
        provider: 'alphapo',
        eventType: 'deposit',
        kind: TransactionLogKind.CALLBACK,
        payload: dto,
        signature,
        verified: true,
      });
      await this.callbackRepo.save(log);
      // 3) Create deposit
      const deposit = this.depositRepo.create({
        companyId: address.companyId,
        type: dto.type,
        cryptoAddress: address,
        cryptoAddressId: address.id,
        currencySent: dto.currency_sent.currency,
        amountSent: dto.currency_sent.amount,
        currencyReceived: dto.currency_received.currency,
        amountReceived: dto.currency_received.amount,
        amountMinusFee: dto.currency_received.amount_minus_fee,
        status: dto.status as DepositStatus,
        raw: dto,
        transactions: dto.transactions.map((t) =>
          this.txRepo.create({
            companyId: address.companyId,
            currency: t.currency,
            transactionType: t.transaction_type,
            type: t.type,
            address: t.address,
            tag: t.tag,
            amount: t.amount,
            txid: t.txid,
            riskscore: t.riskscore,
            confirmations: t.confirmations,
          }),
        ),
        fees: dto.fees.map((f) =>
          this.feeRepo.create({
            companyId: address.companyId,
            type: f.type,
            currency: f.currency,
            amount: f.amount,
          }),
        ),
      });

      return this.depositRepo.save(deposit);
    } else {
      const log = this.callbackRepo.create({
        provider: 'alphapo',
        eventType: 'withdrawal',
        kind: TransactionLogKind.CALLBACK,
        payload: dto,
        signature,
        verified: true,
      });
      await this.callbackRepo.save(log);

      // find by request_id or other linkage
      let withdrawal = await this.withdrawalRepo.findOne({
        where: { requestId: dto.request_id },
      });
      if (!withdrawal) {
        // fallback: try by address+amount maybe, or create partial
        withdrawal = this.withdrawalRepo.create({
          requestId: dto.request_id ?? `cb-${dto.id}`,
          foreignId: null,
          currency: dto.currency,
          amountFrom: dto.amount_from,
          amountTo: dto.amount_to ?? null,
          toAddress: dto.address,
          toTag: dto.tag ?? null,
          status: WithdrawalStatus.PROCESSING,
          raw: dto,
        });
      }

      // map status
      const statusMap: Record<string, WithdrawalStatus> = {
        processing: WithdrawalStatus.PROCESSING,
        confirmed: WithdrawalStatus.CONFIRMED,
        failed: WithdrawalStatus.FAILED,
      };
      withdrawal.status = statusMap[dto.status] ?? withdrawal.status;
      withdrawal.amountTo = dto.amount_to ?? withdrawal.amountTo;
      withdrawal.raw = dto;

      // attach tx & fees
      if (dto.transactions?.length) {
        withdrawal.transactions = dto.transactions.map((t) =>
          this.wTxRepo.create({
            currency: t.currency,
            transactionType: t.transaction_type,
            type: t.type,
            address: t.address,
            tag: t.tag,
            amount: t.amount,
            txid: t.txid,
            confirmations: t.confirmations,
          }),
        );
      }
      if (dto.fees?.length) {
        withdrawal.fees = dto.fees.map((f) =>
          this.wFeeRepo.create({
            type: f.type,
            currency: f.currency,
            amount: f.amount,
          }),
        );
      }

      const saved = await this.withdrawalRepo.save(withdrawal);
      await this.callbackRepo.update(log.id, {
        status: TransactionLogStatus.PROCESSED,
        sourceType: 'withdrawal',
        sourceId: saved.id,
        processedAt: new Date(),
      });

      return saved;
    }
  }

  async callbacklogs(options: {
    page?: number;
    limit?: number;
    search?: string;
    filters?: Record<string, string>; // e.g. { provider: 'alphapo', status: 'received' }
    dateFrom?: string | Date;
    dateTo?: string | Date;
    orderBy?: Record<string, 'ASC' | 'DESC'>; // e.g. { createdAt: 'DESC' }
    // sort?: string; // e.g. 'createdAt'
  }) {
    const callbackResult = await this.genericQueryService.query<CallbackLog>(
      this.callbackRepo,
      'log',
      {
        page: options.page ?? 1,
        limit: options.limit ?? 20,
        search: options.search ?? '',
        filters: options.filters ?? {},
        dateFrom: options.dateFrom,
        dateTo: options.dateTo,
        orderBy: options.orderBy
          ? JSON.stringify(options.orderBy)
          : 'createdAt DESC',
      },
      {
        searchableColumns: ['provider', 'eventType', 'payload'], // searchable fields
        jsonSearchKeys: [
          { column: 'payload', path: ['type'] }, // e.g. payload.type for deposit/withdrawal type
          { column: 'payload', path: ['status'] }, // e.g. payload.status for status
          { column: 'payload', path: ['txid'] }, // e.g. payload.txid for txid
        ],
      },
    );
    return callbackResult;
  }
}
