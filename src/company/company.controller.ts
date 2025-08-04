import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company';

@Controller('companies')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post()
  create(@Body() dto: CreateCompanyDto, @Req() req: any) {
    const isSuperAdmin = this.extractIsSuperAdmin(req?.headers?.authorization);
    return this.companyService.create(dto, isSuperAdmin);
  }

  @Get()
  findAll() {
    return this.companyService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.companyService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.companyService.remove(+id);
  }

  // 🔒 Utility: Extracts and checks if the user is SUPER_ADMIN
  private extractIsSuperAdmin(authHeader: string | undefined): boolean {

    const token = authHeader?.split(' ')[1];
    try {
      const decoded: any = jwt.decode(token);
      const roleName = decoded?.role?.roleName;
      return roleName === 'SUPER_ADMIN'? true : false;
    } catch (error) {
      throw new UnauthorizedException('Failed to decode token');
    }
  }
}
