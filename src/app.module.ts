import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AlphapoController } from './alphapo.controller';
import { AlphapoService } from './alphapo.service';
import { InvoiceModule } from './invoice/invoice.module';
import { UploadModule } from './upload/upload.module';
import { HttpModule } from '@nestjs/axios';
import { HmacUtil } from './common/utils/hmac.util';
import { getTypeOrmConfig } from './config/typeorm.config';
import { RoleModule } from './role/role.module';
import appConfig from './config/app.config';
// import { Roles } from './role/role';
import { TransactionsModule } from './transactions/transactions.module';
// import { CryptoAddress } from './transactions/deposit/entities/crypto-address.entity';
// import { Deposit } from './transactions/deposit/entities/deposit.entity';
// import { DepositTransaction } from './transactions/deposit/entities/deposit-transaction.entity';
// import { DepositFee } from './transactions/deposit/entities/deposit-fee.entity';
// import { CallbackLog } from './transactions/transaction-callback/entities/callback-log.entity';
// import { Withdrawal } from './transactions/withdraw/entities/withdrawal.entity';
// import { WithdrawalTransaction } from './transactions/withdraw/entities/withdrawal-transaction.entity';
// import { WithdrawalFee } from './transactions/withdraw/entities/withdrawal-fee.entity';
import { CommonModule } from './common/common.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { MenuModule } from './menu/menu.module';
import { ResponseHelper } from './common/helpers/response.helper';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { GenericQueryService } from './common/services/generic-query.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [appConfig] }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getTypeOrmConfig,
    }),
    // TypeOrmModule.forFeature([
    //   Roles,
    //   CryptoAddress,
    //   Deposit,
    //   DepositTransaction,
    //   DepositFee,
    //   CallbackLog,
    //   Withdrawal,
    //   WithdrawalTransaction,
    //   WithdrawalFee,
    // ]),

    InvoiceModule,
    UploadModule,
    HttpModule,
    RoleModule,
    TransactionsModule,
    CommonModule,
    MenuModule,
  ],
  controllers: [AlphapoController],
  providers: [
    AlphapoService,
    HmacUtil,
    ResponseInterceptor,
    ResponseHelper,
    AllExceptionsFilter,
    GenericQueryService,
  ],
  exports: [AlphapoService, ResponseInterceptor, CommonModule],
})
export class AppModule {}
