import { Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from './entity/company.entity';
import { User } from 'src/user/entity/user.entity';
import { Balance } from 'src/balance/entity/balance.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Company, User, Balance])],
  controllers: [CompanyController],
  providers: [CompanyService],
})
export class CompanyModule {}
