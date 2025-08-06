import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { DepositService } from '../service/deposit.service';
import { GenericQueryDto } from 'src/common/dtos/GenericQueryDto';
import { CreateCryptoAddressDto } from '../dtos/createCryptoAddress.dto';
import { User } from 'src/auth/decorators/user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('deposit')
export class DepositController {
  constructor(private readonly depositService: DepositService) {}

  @Get()
  async getDepositList(@Query() query: GenericQueryDto) {
    return await this.depositService.getDepositList(query);
  }

  @Post('createAddress')
  async createAddressForUser(
    @Body() body: CreateCryptoAddressDto,
    @User() user: any,
  ) {
    console.log('User:', user); // Ensure user info is coming properly
    const response = await this.depositService.createAddressForUser(
      body,
      user.userId,
    );
    console.log('Address Creation Response:', response); // Check API response
    return response;
  }
}
