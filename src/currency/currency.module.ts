import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CurrencyService } from './currency.service';
import { CurrencyController } from './currency.controller';
import { HttpModule } from '@nestjs/axios';
import { CurrencyEntity } from './entities/currency.entity';
import { AlphapoService } from 'src/alphapo.service';
import { CommonModule } from 'src/common/common.module';
import { RoleService } from 'src/role/role.service';
import { Roles } from 'src/role/entity/role.entity';
import { Menu } from 'src/menu/entity/menu.entity';
import { Permission } from 'src/permission/entity/permission.entity';
import { CurrencyScheduler } from './currency.scheduler';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([CurrencyEntity, Roles, Menu, Permission]),
    HttpModule,
    CommonModule,
  ],
  providers: [CurrencyService, CurrencyScheduler, AlphapoService, RoleService],
  controllers: [CurrencyController],
})
export class CurrencyModule {}
