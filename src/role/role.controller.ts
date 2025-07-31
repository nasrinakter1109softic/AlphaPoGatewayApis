import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { GenericQueryDto } from 'src/common/dtos/GenericQueryDto';

@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}
  @Post('create')
  async createRole(@Body() body: CreateRoleDto) {
    return this.roleService.createRole(body);
  }
  @Get()
  async getRoles(@Query() query: GenericQueryDto) {
    const {
      page,
      limit,
      search,
      orderBy,
      orderDir,
      dateFrom,
      dateTo,
      filters = {},
    } = query;
    return this.roleService.getAllRoles({
      page,
      limit,
      search,
      filters,
      dateFrom,
      dateTo,
      orderBy,
      orderDir,
    });
  }
  @Get(':id')
  async getRoleById(@Param('id') id: number) {
    return this.roleService.getRoleById(id);
  }
  @Put(':id/assign-menus')
  async assignMenusToRole(
    @Param('id') id: number,
    @Body() body: { menuIds: number[] },
  ) {
    return this.roleService.assignMenusToRole(id, body.menuIds);
  }

  @Put(':id/assign-permissions')
  async assignPermissionsToRole(
    @Param('id') id: number,
    @Body() body: { permissionIds: number[] },
  ) {
    return this.roleService.assignPermissionsToRole(id, body.permissionIds);
  }
  @Put(':id')
  async updateRole(@Param('id') id: number, @Body() body: UpdateRoleDto) {
    return this.roleService.updateRole(id, body);
  }
  @Delete(':id')
  async deleteRole(@Param('id') id: number) {
    return this.roleService.deleteRole(id);
  }
}
