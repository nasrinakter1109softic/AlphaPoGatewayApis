import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class HmacUtil {
  generateSignature(
    requestBody: Record<string, any>,
    apiSecret: string,
  ): string {
    const dataString = JSON.stringify(requestBody);
    const signature = crypto
      .createHmac('sha512', apiSecret)
      .update(dataString)
      .digest('hex');

    return signature;
  }
}
