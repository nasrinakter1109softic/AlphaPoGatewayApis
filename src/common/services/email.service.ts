import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private mailConfig: any;

  constructor(private readonly configService: ConfigService) {
    this.mailConfig = this.configService.get('app.mail', { infer: true });
    if (!this.mailConfig) {
      throw new Error('Mail config not found in app.config.ts');
    }

    this.transporter = nodemailer.createTransport({
      host: this.mailConfig.host,
      port: +this.mailConfig.port,
      secure: this.mailConfig.encryption === 'ssl',
      auth: {
        user: this.mailConfig.username,
        pass: this.mailConfig.password,
      },
    });
  }

  async sendMail(
    to: string,
    subject: string,
    html: string,
    from?: string
  ): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: from || `${this.mailConfig.fromName} <${this.mailConfig.from}>`,
        to,
        subject,
        html,
      });
    } catch (error) {
      console.error('Error sending email:', error);
      throw new InternalServerErrorException('Failed to send email');
    }
  }
}
