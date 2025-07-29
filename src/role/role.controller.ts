import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}
  @Post('create')
  async createRole(@Body() body: CreateRoleDto) {
    return this.roleService.createRole(body);
  }
  @Get()
  async getRoles() {
    return this.roleService.getAllRoles();
  }
  @Get(':id')
  async getRoleById(@Param('id') id: number) {
    return this.roleService.getRoleById(id);
  }
  @Put(':id')
  async updateRole(@Param('id') id: number, @Body() body: UpdateRoleDto) {
    return this.roleService.updateRole(id, body);
  }
  @Delete(':id')
  async deleteRole(@Param('id') id: number) {
    return this.roleService.deleteRole(id);
  }
  @Post('assign')
  async assignRole(@Body() body: any) {
    return this.roleService.assignRole(body);
  }
}
