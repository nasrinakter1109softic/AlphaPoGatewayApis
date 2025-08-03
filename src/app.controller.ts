import { Body, Controller, Post } from '@nestjs/common';
import { EmailService } from './common/services/email.service';
import { SendMailDto } from './common/dtos/send-mail.dto';

@Controller('app')
export class AppController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send-test-email')
  async sendTestEmail(@Body() dto: SendMailDto) {
    await this.emailService.sendMail(dto.to, dto.subject, dto.html, dto.from);
    return { message: 'Test email sent successfully' };
  }
}
