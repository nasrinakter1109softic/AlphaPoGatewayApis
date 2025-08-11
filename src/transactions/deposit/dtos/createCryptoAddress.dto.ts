import { IsOptional, IsString, Length } from 'class-validator';

export class CreateCryptoAddressDto {
  @IsString()
  @Length(1, 100)
  currency: string;

  @IsOptional()
  @IsString()
  convertTo?: string;
}
