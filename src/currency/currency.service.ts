import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CurrencyEntity } from './entities/currency.entity';
import { AlphapoService } from 'src/alphapo.service';

@Injectable()
export class CurrencyService {
  constructor(
    @InjectRepository(CurrencyEntity)
    private readonly currencyRepo: Repository<CurrencyEntity>,
    private readonly alphapoService: AlphapoService,
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
          visible: true,
        },
        ['currency'],
      );
    }
  }

  async getAll(): Promise<CurrencyEntity[]> {
    const currencies = await this.currencyRepo.find({
      where: { visible: true },
    });
    if (!currencies.length) {
      await this.syncFromAlphaPo();
      return this.currencyRepo.find({ where: { visible: true } });
    }
    return currencies;
  }
}
