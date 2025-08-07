import {
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Redis } from 'ioredis';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const token = req.headers.authorization?.split(' ')[1];

    const isBlacklisted = await this.redis.get(`blacklist:${token}`);
    if (isBlacklisted === 'true') {
      throw new UnauthorizedException('Token is blacklisted');
    }

    return super.canActivate(context) as Promise<boolean>;
  }
}
