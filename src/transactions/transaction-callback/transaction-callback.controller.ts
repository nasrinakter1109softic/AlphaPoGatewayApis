import {
  Body,
  Controller,
  HttpCode,
  Post,
  Headers,
  Get,
  Query,
  UnauthorizedException,
  //   UnauthorizedException,
} from '@nestjs/common';
import { TransactionCallbackService } from './transaction-callback.service';
import { HmacUtil } from '../../common/utils/hmac.util';
import { GenericQueryDto } from 'src/common/dtos/GenericQueryDto';

@Controller('callback')
export class TransactionCallbackController {
  constructor(
    private readonly callbackService: TransactionCallbackService,
    private readonly hmacUtil: HmacUtil,
  ) {}

  /**
   * AlphaPo will call this endpoint for deposit & withdrawal callbacks
   */
  @Post()
  @HttpCode(200) // respond 200 OK even if async process fails
  async handleAlphapoCallback(
    @Body() body: any,
    @Headers('x-processing-signature') signature?: string,
  ) {
    const computedSig = this.hmacUtil.generateSignature(
      body,
      process.env.ALPHAPO_SECRET ?? '',
    );
    console.log('Generated Signature:', computedSig, signature);
    const isValid = computedSig === signature;
    if (!isValid) {
      throw new UnauthorizedException('Invalid signature');
    }

    try {
      await this.callbackService.handleAlphapoCallback(body, signature);
      //   this.logger.log(`Callback processed for type: ${body.type}`);
    } catch (error) {
      console.error(error);
      //   this.logger.error('Callback processing failed', error);
    }

    return { status: 'ok' }; // Always return 200 OK for webhook
  }

  @Get()
  async queryCallbackLogs(@Query() query: GenericQueryDto) {
    const {
      page,
      limit,
      search,
      orderBy,
      dateFrom,
      dateTo,
      filters = {},
    } = query;
    return this.callbackService.callbacklogs({
      page,
      limit,
      filters,
      search,
      dateFrom,
      dateTo,
      //   sort,
      orderBy,
    });
  }
}
