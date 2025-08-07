import { IsNumber, IsString } from 'class-validator';

export class VerifyOtpDto {
  @IsNumber()
  userId: number;

  @IsString()
  code: string;
}
