import { Inject, Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class PermissionCacheService {
  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}

  private makeKey(userId: number) {
    return `permission-cache:${userId}`;
  }

  async getPermissions(userId: number): Promise<string[] | null> {
    const data = await this.redis.get(this.makeKey(userId));
    return data ? JSON.parse(data) : null;
  }

  async setPermissions(
    userId: number,
    permissions: string[],
    ttlSeconds = 3600,
  ) {
    await this.redis.set(
      this.makeKey(userId),
      JSON.stringify(permissions),
      'EX',
      ttlSeconds,
    );
  }

  async invalidate(userId: number): Promise<void> {
    await this.redis.del(this.makeKey(userId));
  }
}
