import { Module } from '@nestjs/common';
import { Balance } from './entity/balance.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Balance])],
})
export class BalanceModule {}
