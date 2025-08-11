import {
  IsString,
  IsEmail,
  IsOptional,
  IsUrl,
  IsPhoneNumber,
  IsIn,
} from 'class-validator';
import { SendOtpType } from 'src/common/enums/send-otp-type.enum';

export class CreateCompanyDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsPhoneNumber()
  phone: string;

  @IsString()
  country: string;

  @IsString()
  businessName: string;

  @IsOptional()
  @IsString()
  @IsIn(['PHONE', 'EMAIL'], {
    message: 'SendOtpType must be either Phone or email',
  })
  sendOtpType?: SendOtpType;

  @IsOptional()
  @IsUrl()
  website?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  kycDocument?: string;
}
