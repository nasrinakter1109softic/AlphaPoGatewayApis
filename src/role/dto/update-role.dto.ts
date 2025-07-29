import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';

export class UpdateRoleDto {
  @IsOptional()
  @IsString()
  @Length(1, 100)
  roleName?: string;

  @IsOptional()
  @IsBoolean()
  isPredefined?: boolean;
}
