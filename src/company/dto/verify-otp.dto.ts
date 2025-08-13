import { OtpType } from '@/otp/entity/otp.entity';
import { IsEnum, IsNumber, IsString } from 'class-validator';

export class VerifyOtpDto {
  @IsNumber()
  userId: number;

  @IsString()
  code: string;

  @IsEnum(OtpType)
  type: OtpType; 
}
