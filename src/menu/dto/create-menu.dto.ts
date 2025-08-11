import { IsString, IsOptional } from 'class-validator';

export class CreateMenuDto {
  @IsString({ message: 'Title must be Required' })
  title: string;

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
