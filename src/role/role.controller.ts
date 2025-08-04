import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { GenericQueryDto } from 'src/common/dtos/GenericQueryDto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { Roles } from 'src/auth/decorators/role.decorator';
import { Permissions } from 'src/auth/decorators/permissions.decorator';
import { InjectPermissionsGuard } from 'src/auth/guards/inject-permissions.guard';

@UseGuards(JwtAuthGuard, RolesGuard, InjectPermissionsGuard, PermissionsGuard)
@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}
  @Roles('SUPER_ADMIN')
  @Permissions('role:create')
  @Post('create')
  async createRole(@Body() body: CreateRoleDto) {
    return this.roleService.createRole(body);
  }
  @Roles('SUPER_ADMIN')
  @Permissions('role:read')
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
  @Roles('SUPER_ADMIN')
  @Get(':id')
  async getRoleById(@Param('id') id: number) {
    return this.roleService.getRoleById(id);
  }
  @Roles('SUPER_ADMIN')
  @Put(':id/assign-menus')
  async assignMenusToRole(
    @Param('id') id: number,
    @Body() body: { menuIds: number[] },
  ) {
    return this.roleService.assignMenusToRole(id, body.menuIds);
  }
  @Roles('SUPER_ADMIN')
  @Put(':id/assign-permissions')
  async assignPermissionsToRole(
    @Param('id') id: number,
    @Body() body: { permissionIds: number[] },
  ) {
    return this.roleService.assignPermissionsToRole(id, body.permissionIds);
  }
  @Roles('SUPER_ADMIN')
  @Put(':id')
  async updateRole(@Param('id') id: number, @Body() body: UpdateRoleDto) {
    return this.roleService.updateRole(id, body);
  }
  @Roles('SUPER_ADMIN')
  @Delete(':id')
  async deleteRole(@Param('id') id: number) {
    return this.roleService.deleteRole(id);
  }
}
