// src/common/services/sms.service.ts

import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class SmsService {
  private smsConfig: { url: string; apiKey: string };

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    const appConfig = this.configService.get('app');
    this.smsConfig = appConfig?.sms;

    if (!this.smsConfig) {
      throw new Error('SMS config is missing in app config');
    }
  }

  async sendSms(to: string, message: string): Promise<void> {
    const payload = {
      api_key: this.smsConfig.apiKey,
      msg: message,
      to: to,
    };

    try {
      const { data } = await firstValueFrom(
        this.httpService.post(this.smsConfig.url, payload),
      );
      console.log('SMS sent:', data);
    } catch (error) {
      console.error('Error sending SMS:', error?.response?.data || error);
      throw new InternalServerErrorException('Failed to send SMS');
    }
  }
}
