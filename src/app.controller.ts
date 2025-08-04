import { Body, Controller, Post } from '@nestjs/common';
import { EmailService } from './common/services/email.service';
import { SendMailDto } from './common/dtos/send-mail.dto';
import { SmsService } from './common/services/sms.service';
import { SendSmsDto } from './common/dtos/sms.dto';

@Controller('app')
export class AppController {
  constructor(
    private readonly emailService: EmailService,
    private readonly smsService: SmsService,
  ) {}

  @Post('send-test-email')
  async sendTestEmail(@Body() dto: SendMailDto) {
    await this.emailService.sendMail(dto.to, dto.subject, dto.html, dto.from);
    return { message: 'Test email sent successfully' };
  }

  @Post('test-sms')
  async testSms(@Body() dto: SendSmsDto) {
    await this.smsService.sendSms(dto.to, dto.message);
    return { success: true };
  }
}
