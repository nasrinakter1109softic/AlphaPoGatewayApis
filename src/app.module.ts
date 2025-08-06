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
import { TransactionsModule } from './transactions/transactions.module';
import { CommonModule } from './common/common.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { MenuModule } from './menu/menu.module';
import { ResponseHelper } from './common/helpers/response.helper';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { GenericQueryService } from './common/services/generic-query.service';
import { UserModule } from './user/user.module';
import { CompanyModule } from './company/company.module';
import { PermissionModule } from './permission/permission.module';
import { AuthModule } from './auth/auth.module';
import { RedisModule } from './redis/redis.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './auth/strategies/jwt.strategy';
import { RefreshTokenStrategy } from './auth/strategies/refresh.strategy';
import { EmailService } from './common/services/email.service';
import { AppController } from './app.controller';
import { CurrencyModule } from './currency/currency.module';
import { BalanceController } from './balance/balance.controller';
import { BalanceModule } from './balance/balance.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [appConfig] }),
    PassportModule.register({
      defaultStrategy: 'jwt',
      strategy: 'jwt-refresh',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getTypeOrmConfig,
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('app.jwt.secret'),
        signOptions: {
          expiresIn: configService.get('app.jwt.expiresIn'),
        },
      }),
    }),

    InvoiceModule,
    UploadModule,
    HttpModule,
    RoleModule,
    TransactionsModule,
    CommonModule,
    MenuModule,
    UserModule,
    CompanyModule,
    PermissionModule,
    AuthModule,
    RedisModule,
    CurrencyModule,
    BalanceModule,
  ],
  controllers: [AlphapoController, AppController, BalanceController],
  providers: [
    AlphapoService,
    HmacUtil,
    ResponseInterceptor,
    ResponseHelper,
    AllExceptionsFilter,
    GenericQueryService,
    JwtStrategy,
    RefreshTokenStrategy,
    EmailService,
  ],
  exports: [AlphapoService, ResponseInterceptor, CommonModule, EmailService],
})
export class AppModule {}
