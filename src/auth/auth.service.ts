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

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @Inject('REDIS_CLIENT') private readonly redisService: Redis,
    @InjectRepository(User) private userRepo: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(identifier: string, password: string) {
    const user = await this.userRepo.findOne({
      where: [{ email: identifier }, { phone: identifier }],
      relations: ['role'],
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
  async login(dto: LoginDto) {
    const user = await this.validateUser(dto.identifier, dto.password);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    console.log('User found:', user);
    const payload = {
      userId: user.userId,
      email: user.email,
      phone: user?.phone,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_EXPIRES_IN || '15m',
      secret: process.env.JWT_SECRET,
    });
    const refreshPayload = {
      userId: user.userId,
      email: user.email,
      phone: user?.phone,
    };
    const refreshToken = this.jwtService.sign(refreshPayload, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
      secret: process.env.JWT_REFRESH_SECRET,
    });

    return { accessToken, refreshToken };
  }

  async logout(token: string, exp: number) {
    await this.blacklistToken(token, exp);
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
  async refresh(oldRefreshToken: string) {
    try {
      const refreshSecret = this.configService.get<string>(
        'app.jwtRefresh.secret',
      );
      if (!refreshSecret) {
        throw new InternalServerErrorException('Refresh secret not configured');
      }
      const payload = this.jwtService.verify(oldRefreshToken, {
        secret: refreshSecret,
      });
      const user = await this.userRepo.findOne({
        where: { userId: payload.userId },
        relations: ['role'],
      });

      if (!user || !user.isActive) throw new UnauthorizedException();

      const newPayload = {
        userId: user.userId,
        email: user.email,
        phone: user?.phone,
        role: user.role,
      };

      const accessSecret = this.configService.get<string>('app.jwt.secret');
      const expiresIn =
        this.configService.get<string>('app.jwt.expiresIn') || '15m';

      const accessToken = this.jwtService.sign(newPayload, {
        secret: accessSecret,
        expiresIn,
      });

      return { accessToken };
    } catch (err) {
      throw new UnauthorizedException(err.message || 'Invalid refresh token');
    }
  }
}
