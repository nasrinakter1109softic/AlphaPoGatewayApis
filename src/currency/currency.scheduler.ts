import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CurrencyService } from './currency.service';

@Injectable()
export class CurrencyScheduler {
  constructor(private readonly currencyService: CurrencyService) {}

  @Cron('0 */6 * * *') // every 6 hours
  async handleCron() {
    await this.currencyService.syncFromAlphaPo();
  }
}
