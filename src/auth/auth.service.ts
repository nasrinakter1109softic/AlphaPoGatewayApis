import { JwtService } from '@nestjs/jwt';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Redis } from 'ioredis';
import { LoginDto } from './dto/login.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entity/user.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { RefreshTokenService } from './refreshToken/refresh-token.service';
import { parseExpiresIn } from 'src/common/utils/time.util';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @Inject('REDIS_CLIENT') private readonly redisService: Redis,
    @InjectRepository(User) private userRepo: Repository<User>,
    private readonly configService: ConfigService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  async validateUser(identifier: string, password: string) {
    const user = await this.userRepo.findOne({
      where: [{ email: identifier }, { phone: identifier }],
      relations: ['role', 'company'],
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException(
        'Invalid credentials or inactive account',
      );
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new UnauthorizedException('Wrong password');

    return user;
  }
  async login(dto: LoginDto, client: { ip: string; userAgent: string }) {
    const { ip, userAgent: ua } = client;
    const user = await this.validateUser(dto.identifier, dto.password);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const payload = {
      userId: user.userId,
      email: user.email,
      userType: user.userType,
      phone: user?.phone,
      role: user.role,
      companyId: user.company?.companyId,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('app.jwt.expiresIn') || '15m',
      secret: this.configService.get<string>('app.jwt.secret'),
    });
    const refreshPayload = {
      userId: user.userId,
      companyId: user.company?.companyId,
    };
    const refreshToken = this.jwtService.sign(refreshPayload, {
      expiresIn:
        this.configService.get<string>('app.jwtRefresh.expiresIn') || '7d',
      secret: this.configService.get<string>('app.jwtRefresh.secret'),
    });
    const refreshTokenExpiryDate = new Date(
      Date.now() +
        parseExpiresIn(
          this.configService.get<string>('app.jwtRefresh.expiresIn') || '7d',
        ),
    );
    await this.refreshTokenService.create(
      user.userId,
      refreshToken,
      refreshTokenExpiryDate,
      ua,
      ip,
    );

    return { accessToken, refreshToken };
  }

  async logout(accessToken: string, exp: number, refreshToken?: string) {
    await this.blacklistToken(accessToken, exp);

    if (refreshToken) {
      const payload = this.jwtService.decode(refreshToken);
      if (payload?.userId) {
        const validToken = await this.refreshTokenService.findValid(
          payload.userId,
          refreshToken,
        );
        console.log('validToken', validToken);
        if (validToken) {
          await this.refreshTokenService.revokeById(validToken.id);
        }
      }
    }

    return { message: 'Logged out successfully' };
  }

  async blacklistToken(token: string, expiresInSeconds: number) {
    await this.redisService.set(
      `blacklist:${token}`,
      'true',
      'EX',
      expiresInSeconds,
    );
  }

  async isBlacklisted(token: string): Promise<boolean> {
    return !!(await this.redisService.get(`blacklist:${token}`));
  }
  async refresh(
    oldRefreshToken: string,
    client: { ip: string; userAgent: string },
  ) {
    try {
      const { ip, userAgent } = client;
      const refreshSecret = this.configService.get<string>(
        'app.jwtRefresh.secret',
      );
      if (!refreshSecret) {
        throw new InternalServerErrorException('Refresh secret not configured');
      }
      const payload = this.jwtService.verify(oldRefreshToken, {
        secret: refreshSecret,
      });
      const validToken = await this.refreshTokenService.findValid(
        payload.userId,
        oldRefreshToken,
      );
      if (!validToken) throw new UnauthorizedException();
      const user = await this.userRepo.findOne({
        where: { userId: payload.userId },
        relations: ['role'],
      });

      if (!user || !user.isActive) throw new UnauthorizedException();
      await this.refreshTokenService.revokeById(validToken.id);
      const newPayload = {
        userId: user.userId,
        userType: user.userType,
        email: user.email,
        phone: user?.phone,
        role: user.role,
        companyId: user.company?.companyId,
      };

      const accessSecret = this.configService.get<string>('app.jwt.secret');
      const expiresIn =
        this.configService.get<string>('app.jwt.expiresIn') || '15m';

      const accessToken = this.jwtService.sign(newPayload, {
        secret: accessSecret,
        expiresIn,
      });
      const refreshPayload = {
        userId: user.userId,
        companyId: user.company?.companyId,
      };

      const newRefreshToken = this.jwtService.sign(refreshPayload, {
        secret: refreshSecret,
        expiresIn:
          this.configService.get<string>('app.jwtRefresh.expiresIn') || '7d',
      });
      const refreshTokenExpiryDate = new Date(
        Date.now() +
          parseExpiresIn(
            this.configService.get<string>('app.jwtRefresh.expiresIn') || '7d',
          ),
      );
      await this.refreshTokenService.create(
        user.userId,
        newRefreshToken,
        refreshTokenExpiryDate,
        userAgent,
        ip,
      );

      return { accessToken, refreshToken: newRefreshToken };
    } catch (err) {
      throw new UnauthorizedException(err.message || 'Invalid refresh token');
    }
  }
}
