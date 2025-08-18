import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class HmacUtil {
  generateSignature(
    requestBody: Record<string, any>,
    apiSecret: string,
  ): string {
    const dataString = JSON.stringify(requestBody);
    console.log('Data String for HMAC:', dataString);
    console.log('API Secret for HMAC:', apiSecret);
    const signature = crypto
      .createHmac('sha512', apiSecret)
      .update(dataString)
      .digest('hex');

    return signature;
  }
}
