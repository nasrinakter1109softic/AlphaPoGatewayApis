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
import { AlphapoService } from 'src/alphapo.service';
import { Company } from 'src/company/entity/company.entity';
import { Balance } from 'src/balance/entity/balance.entity';

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
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,
    @InjectRepository(Balance)
    private readonly balanceRepo: Repository<Balance>,
    private readonly genericQueryService: GenericQueryService,
    private readonly alphapoService: AlphapoService,
  ) {}

  async handleAlphapoCallback(body: any, signature?: string) {
    const type = body.type;
    if (type === 'deposit') {
      return this.handleDepositCallback(body, signature);
    } else if (type === 'withdrawal') {
      return this.handleWithdrawalCallback(body, signature);
    }
  }
  private async handleDepositCallback(body: any, signature?: string) {
    let address = await this.addressRepo.findOne({
      where: { address: body.crypto_address.address },
    });

    if (!address) {
      address = this.addressRepo.create({
        address: body.crypto_address.address,
        currency: body.crypto_address.currency,
        foreignId: body.crypto_address.foreign_id,
        tag: body.crypto_address.tag,
        companyId: 1, // Adjust as per your logic for companyId assignment
      });
      address = await this.addressRepo.save(address);
    }

    const log = this.callbackRepo.create({
      companyId: address.companyId,
      provider: 'alphapo',
      eventType: 'deposit',
      kind: TransactionLogKind.CALLBACK,
      payload: body,
      signature,
      verified: true,
    });
    await this.callbackRepo.save(log);

    // Only process the deposit and update balance if confirmed
    if (body.status === 'confirmed') {
      const existingTransaction = await this.txRepo.findOne({
        where: { txid: body.currency_received.txid }, // Query DepositTransaction for txid
      });
      if (existingTransaction) {
        console.log('Transaction already exists:', existingTransaction);
      } else {
        const deposit = this.depositRepo.create({
          companyId: address.companyId,
          type: body.type,
          cryptoAddress: address,
          cryptoAddressId: address.id,
          currencySent: body.currency_sent.currency,
          amountSent: body.currency_sent.amount,
          currencyReceived: body.currency_received.currency,
          amountReceived: body.currency_received.amount,
          amountMinusFee: body.currency_received.amount_minus_fee,
          status: DepositStatus.CONFIRMED,
          raw: body,
          transactions: body.transactions.map((t) =>
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
          fees: body.fees.map((f) =>
            this.feeRepo.create({
              companyId: address.companyId,
              type: f.type,
              currency: f.currency,
              amount: f.amount,
            }),
          ),
        });

        // Save deposit
        await this.depositRepo.save(deposit);
      }

      // Update balance
      await this.increaseBalance(
        address.companyId,
        body.currency_received.currency,
        body.currency_received.amount,
      );
    }
  }
  // Update balance for confirmed deposit

  private async handleWithdrawalCallback(body: any, signature?: string) {
    const log = this.callbackRepo.create({
      provider: 'alphapo',
      eventType: 'withdrawal',
      kind: TransactionLogKind.CALLBACK,
      payload: body,
      signature,
      verified: true,
    });
    await this.callbackRepo.save(log);

    // Find by request_id or other linkage
    let withdrawal = await this.withdrawalRepo.findOne({
      where: { requestId: body.request_id },
    });

    if (!withdrawal) {
      withdrawal = this.withdrawalRepo.create({
        requestId: body.request_id ?? `cb-${body.id}`,
        foreignId: null,
        currency: body.currency,
        amountFrom: body.amount_from,
        amountTo: body.amount_to ?? null,
        toAddress: body.address,
        toTag: body.tag ?? null,
        status: WithdrawalStatus.PROCESSING,
        raw: body,
      });
    }

    // Map status
    const statusMap: Record<string, WithdrawalStatus> = {
      processing: WithdrawalStatus.PROCESSING,
      confirmed: WithdrawalStatus.CONFIRMED,
      failed: WithdrawalStatus.FAILED,
    };
    withdrawal.status = statusMap[body.status] ?? withdrawal.status;
    withdrawal.amountTo = body.amount_to ?? withdrawal.amountTo;
    withdrawal.raw = body;

    // Attach tx & fees
    if (body.transactions?.length) {
      withdrawal.transactions = body.transactions.map((t) =>
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
    if (body.fees?.length) {
      withdrawal.fees = body.fees.map((f) =>
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

    if (body.status === 'confirmed') {
      await this.decreaseBalance(
        withdrawal.companyId, // Using companyId from withdrawal
        body.currency,
        body.amount_to ?? body.amount_from,
      );
    }

    return saved;
  }

  private async increaseBalance(
    companyId: number,
    currency: string,
    amount: string,
  ) {
    let balance = await this.balanceRepo.findOne({
      where: { companyId, currency },
    });

    if (!balance) {
      balance = this.balanceRepo.create({ companyId, currency, balance: 0 });
    }

    balance.balance = Number(balance.balance) + Number(amount);
    await this.balanceRepo.save(balance);
  }
  private async decreaseBalance(
    companyId: number,
    currency: string,
    amount: string,
  ) {
    const balance = await this.balanceRepo.findOne({
      where: { companyId, currency },
    });

    if (!balance) {
      console.warn(
        `Balance record not found for company ${companyId} and currency ${currency}`,
      );
      return;
    }

    balance.balance = Math.max(0, Number(balance.balance) - Number(amount));
    await this.balanceRepo.save(balance);
  }
  async callbacklogs(options: {
    page?: number;
    limit?: number;
    search?: string;
    filters?: Record<string, string>; // e.g. { provider: 'alphapo', status: 'received' }
    dateFrom?: string | Date;
    dateTo?: string | Date;
    orderBy?: string; // e.g. { createdAt: 'DESC' }
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
