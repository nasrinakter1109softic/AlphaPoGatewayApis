import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Req,
  UnauthorizedException,
  Query,
  Put,
  Patch,
  UseGuards,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company';
import { GenericQueryDto } from 'src/common/dtos/GenericQueryDto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { User } from 'src/auth/decorators/user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { OptionalJwtAuthGuard } from 'src/auth/guards/optional-jwt-auth.guard';
import { Permissions } from '@/auth/decorators/permissions.decorator';

@UseGuards(OptionalJwtAuthGuard)
@Controller('companies')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Permissions('company_create')
  @Post()
  create(
    @User('user') user: any,
    @Body() dto: CreateCompanyDto,
    @Req() req: any,
  ) {
    const { sendOtpType, ...rest } = dto;
    console.log('User from decorator:', user);
    // const isSuperAdmin = this.extractIsSuperAdmin(req?.headers?.authorization);
    const isSuperAdmin = user?.role?.roleName === 'SUPER_ADMIN' ? true : false;
    const adminInfo = { isSuperAdmin, userId: user?.userId };
    return this.companyService.create(rest, adminInfo, sendOtpType);
  }

  // @UseGuards(OptionalJwtAuthGuard)
  @Permissions('company_list')
  @Get()
  findAll(@Query() query: GenericQueryDto, @User('user') user: any) {
    return this.companyService.findAll(query);
  }

  // @UseGuards(OptionalJwtAuthGuard)
  @Permissions('company_view')
  @Get(':id')
  findOne(@Param('id') id: string, @User('user') user: any) {
    return this.companyService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Permissions('company_approve')
  @Patch(':id/approve')
  approveCompany(@User('user') user: any, @Param('id') id: string) {
    if (user.role.roleName !== 'SUPER_ADMIN') {
      throw new UnauthorizedException('Only super admin can approve a company');
    }
    return this.companyService.approveCompany(+id, user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Permissions('company_delete')
  @Delete(':id')
  remove(@Param('id') id: string, @User('user') user: any) {
    if (user.role.roleName !== 'SUPER_ADMIN') {
      throw new UnauthorizedException('Only super admin can delete a company');
    }
    return this.companyService.remove(+id);
  }

  // @UseGuards(OptionalJwtAuthGuard)
  @Permissions('company_update')
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCompanyDto) {
    return this.companyService.update(+id, dto);
  }

  @Permissions('verify-otp')
  @Post('verify-otp')
  verifyOtp(@Body() body: VerifyOtpDto) {
    return this.companyService.verifyOtp(body);
  }
}
