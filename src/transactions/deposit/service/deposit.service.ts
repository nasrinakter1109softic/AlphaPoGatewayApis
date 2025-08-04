import { Injectable } from '@nestjs/common';
import { CryptoAddress } from '../entities/crypto-address.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AlphapoService } from 'src/alphapo.service';
import { User } from 'src/user/entity/user.entity';

@Injectable()
export class DepositService {
  constructor(
    @InjectRepository(CryptoAddress)
    private readonly cryptoAddressRepo: Repository<CryptoAddress>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly alphapoService: AlphapoService,
  ) {}
  async createAddressForUser(
    userId: number,
    currency: string,
    convertTo?: string,
  ) {
    // Step 1: Find user's company
    const user = await this.userRepo.findOne({
      where: { userId: userId },
      relations: ['company'],
    });

    if (!user || !user.company) {
      throw new Error('Company not found for user');
    }

    const companyId = user.company.companyId;
    // Step 2: Create address from Alphapo
    const payload = {
      foreign_id: `user-${userId}`,
      currency,
      ...(convertTo ? { convert_to: convertTo } : {}),
    };

    const response = await this.alphapoService.createDepositAddress(
      payload.foreign_id,
      payload.currency,
      payload.convert_to,
    );

    if (!response || !response.data || !response.data.data) {
      throw new Error('Failed to create crypto address');
    }

    const addressData = response.data.data;

    // Step 3: Save to DB
    await this.cryptoAddressRepo.save({
      companyId, // ✅ here you assign the company ID
      userId,
      currency,
      address: addressData.address,
      tag: addressData.tag,
      foreignId: `user-${userId}`,
    });

    return addressData;
  }
}
