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

@Controller('companies')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post()
  create(@Body() dto: CreateCompanyDto, @Req() req: any) {
    const { sendOtpType, ...rest } = dto;
    const isSuperAdmin = this.extractIsSuperAdmin(req?.headers?.authorization);
    return this.companyService.create(rest, isSuperAdmin, sendOtpType);
  }

  @Get()
  findAll(@Query() query: GenericQueryDto) {
    return this.companyService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.companyService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/approve')
  approveCompany(@User('user') user: any, @Param('id') id: string) {
    console.log(user.userId, 'User ID from JWT');
    return this.companyService.approveCompany(+id, user.userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.companyService.remove(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCompanyDto) {
    return this.companyService.update(+id, dto);
  }

  // 🔒 Utility: Extracts and checks if the user is SUPER_ADMIN
  private extractIsSuperAdmin(authHeader: string | undefined): boolean {
    const token = authHeader?.split(' ')[1];
    try {
      const decoded: any = jwt.decode(token);
      const roleName = decoded?.role?.roleName;
      return roleName === 'SUPER_ADMIN' ? true : false;
    } catch (error) {
      throw new UnauthorizedException('Failed to decode token');
    }
  }
}
