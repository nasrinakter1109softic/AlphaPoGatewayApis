import { IsString, IsOptional } from 'class-validator';

export class UpdateMenuDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  path?: string;

  @IsOptional()
  @IsString()
  iconUrl?: string;
}
