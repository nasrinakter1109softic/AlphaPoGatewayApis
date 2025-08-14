import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrencyService } from './currency.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { Permissions } from '@/auth/decorators/permissions.decorator';
import { GenericQueryDto } from '@/common/dtos/GenericQueryDto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('currencies')
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  @Permissions('currency_list')
  @Get()
  async list(@Query() query: GenericQueryDto) {
    return await this.currencyService.getAllCurrencies(query);
  }

  @Permissions('currency_view')
  @Get(':id')
  async getCurrencyById(@Param('id') id: number) {
    return await this.currencyService.getCurrencyById(id);
  }

  @Patch(':id/status')
  @Permissions('currency_update')
  async updateCurrencyStatus(
    @Param('id') id: number,
    @Body('isActive') isActive: boolean,
  ) {
    return await this.currencyService.updateCurrencyStatus(id, isActive);
  }
}
