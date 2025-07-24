import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AlphapoController } from './alphapo.controller';
import { AlphapoService } from './alphapo.service';
import { InvoiceModule } from './invoice/invoice.module';
import { UploadModule } from './upload/upload.module';
import { HttpModule } from '@nestjs/axios';
import { HmacUtil } from './utils/hmac.util';
import { getTypeOrmConfig } from './config/typeorm.config';
import appConfig from './config/app.config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [appConfig] }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getTypeOrmConfig,
    }),
    InvoiceModule,
    UploadModule,
    HttpModule,
  ],
  controllers: [AlphapoController],
  providers: [AlphapoService, HmacUtil],
})
export class AppModule {}
