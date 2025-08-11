import { Body, Controller, Post, Headers, UseGuards } from '@nestjs/common';
import { AlphapoService } from './alphapo.service';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/role.guard';
import { Roles } from './auth/decorators/role.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller()
export class AlphapoController {
  constructor(private readonly alphapoService: AlphapoService) {}

  @Post('create-address')
  async createAddress(
    @Body('foreign_id') foreignId: string,
    @Body('currency') currency: string,
  ) {
    return this.alphapoService.createDepositAddress(foreignId, currency);
  }
  @Post('futures/rates')
  async getFuturesRates(@Body() body: any) {
    return this.alphapoService.getFuturesRates(body);
  }

  @Post('futures/confirm')
  async confirmFutures(@Body() body: any) {
    return this.alphapoService.confirmFutures(body);
  }
  @Post('currencies/list')
  async getCurrenciesList() {
    return this.alphapoService.getCurrenciesList();
  }

  @Post('create-invoice')
  async createInvoice(@Body() body: any) {
    return this.alphapoService.createInvoice(body);
  }
  @Post('create-invoice-with-partial-pay')
  async createInvoiceWithPartialPay(@Body() body: any) {
    return this.alphapoService.createInvoice(body);
  }
  @Post('exchange/calculate')
  async calculateExchange(@Body() body: any) {
    return this.alphapoService.calculateExchange(body);
  }
  @Post('exchange/fixed')
  async fixedExchange(@Body() body: any) {
    return this.alphapoService.fixedExchange(body);
  }

  @Post('create-withdrawal')
  async createWithdrawal(@Body() body: any) {
    return this.alphapoService.createWithdrawal(body);
  }
  // ✅ ADDITIONAL MOCK ENDPOINTS for full 17 API integration

  @Post('currencies/pairs')
  async getCurrencyPairs(@Body() body: any) {
    return this.alphapoService.getCurrencyPairs(body);
  }
  @Post('currencies/rates')
  async getCurrencyRates(@Body() body: any) {
    return this.alphapoService.getCurrencyRates(body);
  }
  @Post('accounts/list')
  async listAccounts(@Body() body: any) {
    return this.alphapoService.listAccounts(body);
  }

  /////////////////////////

  @Post('invoice-status')
  async getInvoiceStatus(@Body('invoice_id') invoiceId: string) {
    return this.alphapoService.getInvoiceStatus(invoiceId);
  }
  @Post('balance')
  async getBalance(@Body('currency') currency: string) {
    return this.alphapoService.getBalance(currency);
  }

  @Post('verify-signature')
  verifySignature(
    @Body() body: any,
    @Headers('x-processing-signature') signature: string,
  ) {
    const valid = this.alphapoService.verifyCallbackSignature(body, signature);
    return { valid };
  }
  @Post('validate-address')
  async validateAddress(@Body() body: any) {
    return this.alphapoService.validateAddress(body);
  }

  @Post('reissue-invoice')
  async reissueInvoice(@Body() body: any) {
    return this.alphapoService.reissueInvoice(body);
  }

  @Post('cancel-invoice')
  async cancelInvoice(@Body() body: any) {
    return this.alphapoService.cancelInvoice(body);
  }

  @Post('list-invoices')
  async listInvoices(@Body() body: any) {
    return this.alphapoService.listInvoices(body);
  }

  @Post('list-withdrawals')
  async listWithdrawals(@Body() body: any) {
    return this.alphapoService.listWithdrawals(body);
  }

  @Post('wallet-activity')
  async walletActivity(@Body() body: any) {
    return this.alphapoService.walletActivity(body);
  }

  @Post('get-rates')
  async getRates(@Body() body: any) {
    return this.alphapoService.getRates(body);
  }

  @Post('exchange')
  async exchange(@Body() body: any) {
    return this.alphapoService.exchange(body);
  }

  @Post('exchange-status')
  async exchangeStatus(@Body() body: any) {
    return this.alphapoService.exchangeStatus(body);
  }

  @Post('create-reserve')
  async createReserve(@Body() body: any) {
    return this.alphapoService.createReserve(body);
  }

  @Post('release-reserve')
  async releaseReserve(@Body() body: any) {
    return this.alphapoService.releaseReserve(body);
  }
}
