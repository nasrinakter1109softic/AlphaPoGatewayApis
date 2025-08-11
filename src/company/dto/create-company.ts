import { Transform } from 'class-transformer';
import {
  IsString,
  IsEmail,
  IsOptional,
  IsUrl,
  IsPhoneNumber,
  IsIn,
  ValidateIf,
  IsNotEmpty,
  IsEnum,
} from 'class-validator';
import { SendOtpType } from 'src/common/enums/send-otp-type.enum';

export class CreateCompanyDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @Transform(({ value }) =>
    value === '' || value === null ? undefined : value,
  )
  @ValidateIf((o) => o.sendOtpType === SendOtpType.PHONE)
  @IsNotEmpty()
  @IsPhoneNumber('BD', { message: 'phone must be a valid phone number' })
  phone?: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsString()
  @IsNotEmpty()
  businessName: string;

  @IsEnum(SendOtpType, { message: 'sendOtpType must be PHONE or EMAIL' })
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
