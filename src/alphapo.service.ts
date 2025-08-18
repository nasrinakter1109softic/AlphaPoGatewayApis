/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { HmacUtil } from './common/utils/hmac.util';
import { AxiosRequestConfig } from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AlphapoService {
  private readonly apiKey: string;
  private readonly apiSecret: string;
  private readonly apiUrl: string;
  private readonly logger = console; // Replace with a proper logger in production
  constructor(
    private readonly httpService: HttpService,
    private readonly hmacUtil: HmacUtil,
    private readonly configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('app.alphapo.apiKey') || '';
    this.apiSecret =
      this.configService.get<string>('app.alphapo.secretKey') || '';
    this.apiUrl =
      this.configService.get<string>('app.alphapo.baseUrl') ||
      'https://app.sandbox.cryptoprocessing.com';
  }

  private async postToAlphaPo(endpoint: string, data: any): Promise<any> {
    try {
      const signature = this.hmacUtil.generateSignature(data, this.apiSecret);
      console.log('Generated Signature:', signature);
      console.log('Request Data:', data);

      const config: AxiosRequestConfig = {
        headers: {
          'Content-Type': 'application/json',
          'X-Processing-Key': this.apiKey,
          'X-Processing-Signature': signature,
        },
      };
      let url = `${this.apiUrl}${endpoint}`;
      if (
        endpoint.startsWith('/api/v2/addresses/take') &&
        process.env.NODE_ENV === 'development'
      ) {
        url = `https://testnet-faucet.com/ltc-testnet${endpoint}`; // Example for testnet, adjust as needed
      }
      //const url = `${this.apiUrl}${endpoint}`;
      console.log('Sending Request to:', url);
      const response = await this.httpService
        .post(url, data, config)
        .toPromise();

      console.log('API Response:', response?.data);
      return response?.data;
    } catch (error) {
      console.error(
        'Error calling AlphaPo API:',
        error.response?.data || error.message,
      );
      throw new Error('AlphaPo API failed');
    }
  }
  async createDepositAddress(
    foreignId: string,
    currency: string,
    convertTo?: string,
  ): Promise<any> {
    try {
      if (convertTo) {
        return this.postToAlphaPo('/api/v2/addresses/take', {
          foreign_id: foreignId,
          currency,
          convert_to: convertTo,
        });
      }
      return this.postToAlphaPo('/api/v2/addresses/take', {
        foreign_id: foreignId,
        currency,
      });
    } catch (error) {
      console.error('Error in createDepositAddress:', error.message);
      throw new Error('Failed to create crypto address');
    }
  }
  async getFuturesRates(body: any) {
    return this.postToAlphaPo('/api/v2/futures/rates', body);
  }

  async confirmFutures(body: any) {
    return this.postToAlphaPo('/api/v2/futures/confirm', body);
  }
  async createInvoice(body: any) {
    return this.postToAlphaPo('/api/v2/invoices/create', body);
  }

  async createWithdrawal(body: any) {
    return this.postToAlphaPo('/api/v2/withdrawal/crypto', body);
  }

  async getInvoiceStatus(invoice_id: string) {
    return this.postToAlphaPo('/api/v2/invoices/status', { invoice_id });
  }

  async getBalance(currency: string) {
    return this.postToAlphaPo('/api/v2/balance', { currency });
  }

  async validateAddress(body: any) {
    return this.postToAlphaPo('/api/v2/addresses/validate', body);
  }

  async reissueInvoice(body: any) {
    return this.postToAlphaPo('/api/v2/invoices/reissue', body);
  }

  async cancelInvoice(body: any) {
    return this.postToAlphaPo('/api/v2/invoices/cancel', body);
  }

  async listInvoices(body: any) {
    return this.postToAlphaPo('/api/v2/invoices/list', body);
  }

  async listWithdrawals(body: any) {
    return this.postToAlphaPo('/api/v2/withdrawal/list', body);
  }

  async walletActivity(body: any) {
    return this.postToAlphaPo('/api/v2/wallet/activity', body);
  }

  async getRates(body: any) {
    return this.postToAlphaPo('/api/v2/exchange/rates', body);
  }

  async exchange(body: any) {
    return this.postToAlphaPo('/api/v2/exchange/request', body);
  }

  async exchangeStatus(body: any) {
    return this.postToAlphaPo('/api/v2/exchange/status', body);
  }

  async createReserve(body: any) {
    return this.postToAlphaPo('/api/v2/reserve/create', body);
  }

  async releaseReserve(body: any) {
    return this.postToAlphaPo('/api/v2/reserve/release', body);
  }

  verifyCallbackSignature(data: any, signature: string): boolean {
    const generated = this.hmacUtil.generateSignature(data, this.apiSecret);
    return generated === signature;
  }
  async getCurrenciesList() {
    return this.postToAlphaPo('/api/v2/currencies/list', {});
  }
  async calculateExchange(body: any) {
    return this.postToAlphaPo('/api/v2/exchange/calculate', body);
  }
  async fixedExchange(body: any) {
    return this.postToAlphaPo('/api/v2/exchange/fixed', body);
  }
  async getCurrencyPairs(body: any) {
    return this.postToAlphaPo('/api/v2/currencies/pairs', body);
  }
  async getCurrencyRates(body: any) {
    return this.postToAlphaPo('/api/v2/currencies/rates', body);
  }
  async listAccounts(body: any) {
    return this.postToAlphaPo('/api/v2/accounts/list', body);
  }
}
