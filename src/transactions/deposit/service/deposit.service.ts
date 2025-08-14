import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CryptoAddress } from '../entities/crypto-address.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { AlphapoService } from 'src/alphapo.service';
import { User } from 'src/user/entity/user.entity';
import { Deposit } from '../entities/deposit.entity';
import { GenericQueryService } from 'src/common/services/generic-query.service';
import { CreateCryptoAddressDto } from '../dtos/createCryptoAddress.dto';
import { GenericQueryDto } from 'src/common/dtos/GenericQueryDto';
import { UserType } from 'src/common/enums/user-type.enum';
import { Company } from '@/company/entity/company.entity';
import { CurrencyEntity } from '@/currency/entities/currency.entity';

@Injectable()
export class DepositService {
  constructor(
    @InjectRepository(CryptoAddress)
    private readonly cryptoAddressRepo: Repository<CryptoAddress>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Deposit)
    private readonly depositRepo: Repository<Deposit>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(CurrencyEntity)
    private readonly currencyRepository: Repository<CurrencyEntity>,
    private readonly alphapoService: AlphapoService,
    private readonly genericQueryService: GenericQueryService,
  ) {}
  async createAddressForUser(data: CreateCryptoAddressDto, userId: number) {
    try {
      const { currency, convertTo } = data;
      // Step 1: Find user and company
      const user = await this.userRepo.findOne({
        where: { userId: userId },
        relations: ['company'],
      });

      if (!user || !user.company) {
        throw new NotFoundException('Company not found for user');
      }

      const companyId = user.company.companyId;
      console.log(
        `Creating address for userId: ${userId}, companyId: ${companyId}, currency: ${currency}, convertTo: ${convertTo}`,
      );
      const company = await this.companyRepository.findOne({
        where: { companyId },
      });
      if (!company) {
        throw new NotFoundException('Company not found');
      }
      const currencyEntity = await this.currencyRepository.findOne({
        where: { currency },
      });
      if (!currencyEntity) {
        throw new NotFoundException('Currency not found');
      }

      // Step 2: Check if address already exists for this company and currency
      const existingAddress = await this.cryptoAddressRepo.findOne({
        where: { companyId, currency },
      });

      if (existingAddress) {
        return existingAddress; // Return existing address if found
      }

      // Step 3: Create a new address from Alphapo
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
      console.log('response', response);
      if (!response || !response.data) {
        throw new BadRequestException('Failed to create crypto address');
      }

      const addressData = response.data;

      // Step 4: Save new address to DB
      await this.cryptoAddressRepo.save({
        companyId, // Assign the companyId to the new address
        userId,
        currency,
        address: addressData.address,
        tag: addressData.tag,
        foreignId: `user-${userId}`,
        isActive: true,
      });

      return addressData;
    } catch (error) {
      throw new BadRequestException(
        `Failed to create address: ${error.message}`,
      );
    }
  }
  /**
   * Retrieves a paginated list of deposits with filters and relations.
   * @param queryOptions The query options (pagination, filters, search, etc.)
   * @param user The authenticated user (for merchant-specific filtering)
   * @returns A paginated result with nested deposit items
   */
  async getDepositList(queryOptions: GenericQueryDto, user: any) {
    // Add companyId filter for merchant users
    if (user.userType === UserType.MERCHANT) {
      queryOptions.filters = queryOptions.filters || {};
      queryOptions.filters.companyId = user.companyId.toString();
    }
    const result = await this.genericQueryService.query(
      this.depositRepo,
      'd',
      queryOptions,
      {
        allowedFilterColumns: ['status', 'companyId', 'currencyReceived'],
        searchableColumns: ['currencySent', 'currencyReceived'],
        defaultOrder: { column: 'createdAt', direction: 'DESC' },
        relations: ['cryptoAddress', 'company', 'fees'],
        excludedFields: ['crypto_address_id', 'amount_minus_fee', 'raw'],
      },
      [], // Nested response
    );
    return result;
  }

  async getDepositAddressList(queryOptions: GenericQueryDto, user: any) {
    // Add companyId filter for merchant users
    if (user.userType === UserType.MERCHANT) {
      queryOptions.filters = queryOptions.filters || {};
      queryOptions.filters.companyId = user.companyId.toString();
    }
    const result = await this.genericQueryService.query(
      this.cryptoAddressRepo,
      'ca',
      queryOptions,
      {
        allowedFilterColumns: ['currency', 'companyId'],
        searchableColumns: ['address', 'currency', 'companyId', 'tag'],
        defaultOrder: { column: 'createdAt', direction: 'DESC' },
        relations: ['currencyEntity', 'company'],
      },
      [], // Nested response
    );
    return result;
  }
  async getAddressById(id: number): Promise<CryptoAddress> {
    const address = await this.cryptoAddressRepo.findOne({
      where: { id },
      relations: ['currencyEntity', 'company'],
    });
    if (!address) {
      throw new NotFoundException('Crypto address not found');
    }
    return address;
  }
  async updateAddressStatus(id: number, isActive: boolean): Promise<string> {
    // Step 1: Find the address
    const address = await this.cryptoAddressRepo.findOne({ where: { id } });
    if (!address) {
      throw new NotFoundException('Crypto address not found');
    }

    // Step 2: Update isActive status
    address.isActive = isActive;

    // Step 3: Save updated status
    try {
      return (await this.cryptoAddressRepo.save(address))
        ? 'Crypto address status updated successfully'
        : 'Failed to update address status';
    } catch (error) {
      throw new InternalServerErrorException('Failed to update address status');
    }
  }
}
