import { IsEmail, IsPhoneNumber, IsOptional } from 'class-validator';

export class ForgotPasswordDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsPhoneNumber()
  phone?: string;
}
