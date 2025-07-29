import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @Length(1, 100)
  roleName: string;

  @IsOptional()
  @IsBoolean()
  isPredefined?: boolean;
}
