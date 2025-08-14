import { Module } from '@nestjs/common';
import { GenericQueryService } from './services/generic-query.service';
import { ResponseHelper } from './helpers/response.helper';
import { RoleService } from 'src/role/role.service';
import { Roles } from 'src/role/entity/role.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionCacheService } from './services/permission-cache.service';
import { HttpModule } from '@nestjs/axios';
import { SmsService } from './services/sms.service';
import { EmailService } from './services/email.service';
import { HmacUtil } from './utils/hmac.util';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([Roles])],
  providers: [
    GenericQueryService,
    ResponseHelper,
    PermissionCacheService,
    SmsService,
    EmailService,
    HmacUtil,
  ],
  exports: [
    GenericQueryService,
    ResponseHelper,
    PermissionCacheService,
    SmsService,
    EmailService,
    HmacUtil,
  ],
})
export class CommonModule {}
