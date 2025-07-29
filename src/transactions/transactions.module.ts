import { Module } from '@nestjs/common';
import { TransactionCallbackService } from './transaction-callback/transaction-callback.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CryptoAddress } from './deposit/entities/crypto-address.entity';
import { Deposit } from './deposit/entities/deposit.entity';
import { DepositFee } from './deposit/entities/deposit-fee.entity';
import { CallbackLog } from './transaction-callback/entities/callback-log.entity';
import { Withdrawal } from './withdraw/entities/withdrawal.entity';
import { WithdrawalTransaction } from './withdraw/entities/withdrawal-transaction.entity';
import { WithdrawalFee } from './withdraw/entities/withdrawal-fee.entity';
import { DepositTransaction } from './deposit/entities/deposit-transaction.entity';
import { TransactionCallbackController } from './transaction-callback/transaction-callback.controller';
import { HmacUtil } from 'src/common/utils/hmac.util';
import { CommonModule } from 'src/common/common.module';
import { GenericQueryService } from 'src/common/services/generic-query.service';

@Module({
  imports: [
    CommonModule,
    TypeOrmModule.forFeature([
      CryptoAddress,
      Deposit,
      DepositTransaction,
      DepositFee,
      CallbackLog,
      Withdrawal,
      WithdrawalTransaction,
      WithdrawalFee,
    ]),
  ],
  providers: [TransactionCallbackService, HmacUtil, GenericQueryService],
  exports: [TransactionCallbackService],
  controllers: [TransactionCallbackController],
})
export class TransactionsModule {}
