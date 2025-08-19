// src/auth/token-blacklist.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlacklistedToken } from './entities/blacklisted-token.entity';

@Injectable()
export class TokenBlacklistService {
  constructor(
    @InjectRepository(BlacklistedToken)
    private readonly blacklistRepo: Repository<BlacklistedToken>,
  ) {}

  async blacklistToken(token: string, ttl: number) {
    const expiresAt = new Date(Date.now() + ttl * 1000);
    const entry = this.blacklistRepo.create({ token, expiresAt });
    await this.blacklistRepo.save(entry);
  }

  async isBlacklisted(token: string): Promise<boolean> {
    const entry = await this.blacklistRepo.findOne({ where: { token } });
    if (!entry) return false;

    // Cleanup expired tokens
    if (!entry.expiresAt || entry.expiresAt < new Date()) {
      if (entry.id !== undefined) {
        await this.blacklistRepo.delete(entry.id);
      } else {
        await this.blacklistRepo.delete({ token: entry.token });
      }
      return false;
    }

    return true;
  }
}
