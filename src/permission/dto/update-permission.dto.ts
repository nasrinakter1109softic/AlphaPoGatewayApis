import { IsOptional, IsString } from 'class-validator';

export class UpdatePermissionDto {
  @IsString()
  @IsOptional()
  title: string;

  @IsString()
  @IsOptional()
  slug: string;
}
