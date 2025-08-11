import { Module } from '@nestjs/common';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Roles } from './entity/role.entity';
import { GenericQueryService } from 'src/common/services/generic-query.service';
import { Menu } from 'src/menu/entity/menu.entity';
import { Permission } from 'src/permission/entity/permission.entity';
import { PermissionCacheService } from 'src/common/services/permission-cache.service';

@Module({
  imports: [TypeOrmModule.forFeature([Roles, Menu, Permission])],
  controllers: [RoleController],
  providers: [GenericQueryService, RoleService, PermissionCacheService],
  exports: [RoleService],
})
export class RoleModule {}
