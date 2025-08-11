import { IsNotEmpty, IsPhoneNumber, IsString } from 'class-validator';

export class SendSmsDto {
  @IsPhoneNumber('BD', { message: 'Invalid Bangladeshi phone number' })
  to: string;

  @IsString()
  @IsNotEmpty()
  message: string;
}
