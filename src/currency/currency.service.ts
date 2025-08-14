import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CurrencyEntity } from './entities/currency.entity';
import { AlphapoService } from 'src/alphapo.service';
import { GenericQueryDto } from '@/common/dtos/GenericQueryDto';
import { GenericQueryService } from '@/common/services/generic-query.service';

@Injectable()
export class CurrencyService {
  constructor(
    @InjectRepository(CurrencyEntity)
    private readonly currencyRepo: Repository<CurrencyEntity>,
    private readonly alphapoService: AlphapoService,
    private readonly genericQueryService: GenericQueryService,
  ) {}

  async syncFromAlphaPo(): Promise<void> {
    const currencies = await this.alphapoService.getCurrenciesList();
    const data = currencies.data || [];
    for (const c of data) {
      await this.currencyRepo.upsert(
        {
          currency: c.currency,
          type: c.type,
          minimum_amount: c.minimum_amount,
          deposit_fee_percent: c.deposit_fee_percent,
          withdrawal_fee_percent: c.withdrawal_fee_percent,
          precision: c.precision,
          // visible: true,
        },
        ['currency'],
      );
    }
  }

  async getAllCurrencies(options?: GenericQueryDto) {
    const currencies = await this.genericQueryService.query<CurrencyEntity>(
      this.currencyRepo,
      'currency',
      options || {},
      {
        searchableColumns: ['currency'],
        enforcedFilters: { visible: true },
      },
    );
    if (!currencies.items.length) {
      await this.syncFromAlphaPo();
      return this.genericQueryService.query<CurrencyEntity>(
        this.currencyRepo,
        'currency',
        options || {},
        {
          searchableColumns: ['currency'],
          enforcedFilters: { visible: true },
        },
      );
    }
    return currencies;
  }
  async getCurrencyById(id: number): Promise<CurrencyEntity> {
    const currency = await this.currencyRepo.findOne({
      where: { id },
      relations: ['cryptoAddresses'],
    });
    if (!currency) {
      throw new NotFoundException('Currency not found');
    }
    return currency;
  }

  async updateCurrencyStatus(id: number, visible: boolean): Promise<string> {
    const currencyInfo = await this.currencyRepo.findOne({
      where: { id },
    });
    if (!currencyInfo) {
      throw new NotFoundException('Currency not found');
    }
    currencyInfo.visible = visible;
    try {
      const updatedCurrency = await this.currencyRepo.save(currencyInfo);
      return updatedCurrency
        ? 'Crypto address status updated successfully'
        : 'Failed to update address status';
    } catch (error) {
      throw new InternalServerErrorException('Failed to update address status');
    }
  }
}
