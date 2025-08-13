import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DepositService } from '../service/deposit.service';
import { GenericQueryDto } from 'src/common/dtos/GenericQueryDto';
import { CreateCryptoAddressDto } from '../dtos/createCryptoAddress.dto';
import { User } from 'src/auth/decorators/user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Permissions } from '@/auth/decorators/permissions.decorator';

@UseGuards(JwtAuthGuard)
@Controller('deposit')
export class DepositController {
  constructor(private readonly depositService: DepositService) {}

  @Permissions('deposit_address_list')
  @Get('crypto-addresses')
  async getDepositAddresses(
    @Query() queryOptions: GenericQueryDto,
    @User() user: any,
  ) {
    console.log('Parsed queryOptions:', JSON.stringify(queryOptions, null, 2));
    return this.depositService.getDepositAddressList(queryOptions, user);
  }
  @Permissions('deposit_create_address')
  @Post('createAddress')
  async createAddressForUser(
    @Body() body: CreateCryptoAddressDto,
    @User() user: any,
  ) {
    const response = await this.depositService.createAddressForUser(
      body,
      user.userId,
    );
    return response;
  }
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: number,
    @Body('isActive') isActive: boolean,
  ) {
    const response = await this.depositService.updateAddressStatus(
      id,
      isActive,
    );
    return response;
  }
  @Permissions('deposit_list')
  @Get()
  async getDeposits(@Query() queryOptions: GenericQueryDto, @User() user: any) {
    console.log('Parsed queryOptions:', JSON.stringify(queryOptions, null, 2));
    return this.depositService.getDepositList(queryOptions, user);
  }
}
