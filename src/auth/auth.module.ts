import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entity/user.entity';
import { PermissionCacheService } from 'src/common/services/permission-cache.service';
import { RefreshToken } from './refreshToken/refresh-token.entity';
import { RefreshTokenService } from './refreshToken/refresh-token.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, RefreshToken])],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtService,
    PermissionCacheService,
    RefreshTokenService,
  ],
})
export class AuthModule {}
