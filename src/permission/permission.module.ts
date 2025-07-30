import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionService } from './permission.service';
import { PermissionController } from './permission.controller';
import { Permission } from './entity/permission.entity';
import { GenericQueryService } from 'src/common/services/generic-query.service';

@Module({
  imports: [TypeOrmModule.forFeature([Permission])],
  controllers: [PermissionController],
  providers: [PermissionService, GenericQueryService],
  exports: [PermissionService],
})
export class PermissionModule {}
