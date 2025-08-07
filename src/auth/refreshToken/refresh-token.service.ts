import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshToken } from './refresh-token.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly tokenRepo: Repository<RefreshToken>,
  ) {}

  async create(
    userId: number,
    rawToken: string,
    expiresAt: Date,
    userAgent?: string,
    ip?: string,
  ) {
    const token = await bcrypt.hash(rawToken, 10);

    const newToken = this.tokenRepo.create({
      token,
      user: { userId } as any,
      expiresAt,
      userAgent,
      ip,
    });

    return this.tokenRepo.save(newToken);
  }

  async findValid(userId: number, rawToken: string) {
    const tokens = await this.tokenRepo.find({
      where: { user: { userId } },
      order: { createdAt: 'DESC' },
    });

    for (const stored of tokens) {
      const match = await bcrypt.compare(rawToken, stored.token);
      if (match) {
        return stored;
      }
    }

    return null;
  }

  async revokeById(id: number) {
    return this.tokenRepo.delete({ id });
  }

  async revokeAllForUser(userId: number) {
    return this.tokenRepo.delete({ user: { userId } });
  }
}
