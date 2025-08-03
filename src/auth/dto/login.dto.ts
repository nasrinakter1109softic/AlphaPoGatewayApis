// src/auth/dto/login.dto.ts
import { IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  identifier: string; // email or phone

  @IsString()
  password: string;
}
