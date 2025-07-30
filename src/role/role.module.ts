import { Module } from '@nestjs/common';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Roles } from './entity/role.entity';
import { GenericQueryService } from 'src/common/services/generic-query.service';

@Module({
  imports: [TypeOrmModule.forFeature([Roles])],
  controllers: [RoleController],
  providers: [GenericQueryService, RoleService],
})
export class RoleModule {}
