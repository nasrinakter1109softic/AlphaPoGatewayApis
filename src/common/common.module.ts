import { Module } from '@nestjs/common';
import { GenericQueryService } from './services/generic-query.service';
import { ResponseHelper } from './helpers/response.helper';
import { RoleService } from 'src/role/role.service';
import { Roles } from 'src/role/entity/role.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Menu } from 'src/menu/entity/menu.entity';
import { Permission } from 'src/permission/entity/permission.entity';
import { PermissionCacheService } from './services/permission-cache.service';

@Module({
  imports: [TypeOrmModule.forFeature([Roles, Menu, Permission])],
  providers: [
    GenericQueryService,
    ResponseHelper,
    RoleService,
    PermissionCacheService,
  ],
  exports: [GenericQueryService, ResponseHelper, PermissionCacheService],
})
export class CommonModule {}
