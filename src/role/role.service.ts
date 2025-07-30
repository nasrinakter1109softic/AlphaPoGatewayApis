/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Roles } from './entity/role.entity';
import { Repository } from 'typeorm';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { GenericQueryService } from 'src/common/services/generic-query.service';
import { Menu } from 'src/menu/entity/menu.entity';
import { Permission } from 'src/permission/entity/permission.entity';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Roles)
    private roleRepository: Repository<Roles>,
    private readonly genericQueryService: GenericQueryService,
    @InjectRepository(Menu)
    private menuRepo: Repository<Menu>,
    @InjectRepository(Permission)
    private permissionRepo: Repository<Permission>,
  ) {}
  async createRole(data: CreateRoleDto): Promise<Roles> {
    const existingRole = await this.roleRepository.findOne({
      where: { roleName: data.roleName },
      relations: ['menus', 'permissions'],
    });
    if (existingRole) {
      throw new Error('Role with this name already exists');
    }
    // Create a new role instance
    const role = this.roleRepository.create(data);
    return this.roleRepository.save(role);
  }
  async getAllRoles(options: {
    page?: number;
    limit?: number;
    search?: string;
    filters?: Record<string, string>; // e.g. { provider: 'alphapo', status: 'received' }
    dateFrom?: string | Date;
    dateTo?: string | Date;
    orderBy?: string; // e.g. { createdAt: 'DESC' }
    orderDir?: 'ASC' | 'DESC'; // e.g. 'createdAt'
  }) {
    const roles = await this.genericQueryService.query<Roles>(
      this.roleRepository,
      'role',
      {
        page: options.page ?? 1,
        limit: options.limit ?? 20,
        search: options.search ?? '',
        filters: options.filters ?? {},
        dateFrom: options.dateFrom,
        dateTo: options.dateTo,
        orderBy: options.orderBy,
        orderDir: options.orderDir,
      },
      {
        searchableColumns: ['roleName'], // searchable fields
        relations: ['menus', 'permissions'],
      },
    );
    return roles;
  }
  async getRoleById(roleId: number): Promise<Roles | null> {
    return this.roleRepository.findOne({
      where: { roleId },
      relations: ['menus', 'permissions', 'users'],
    });
  }
  async updateRole(roleId: number, data: UpdateRoleDto): Promise<Roles> {
    const role = await this.getRoleById(roleId);
    if (!role) {
      throw new Error('Role not found');
    }
    role.roleName = data.roleName || role.roleName;
    return this.roleRepository.save(role);
  }
  async deleteRole(roleId: number): Promise<void> {
    const role = await this.getRoleById(roleId);
    if (!role) {
      throw new Error('Role not found');
    }
    if (role.isPredefined) {
      throw new Error('Cannot delete predefined roles');
    }
    if (role.users && role.users.length > 0) {
      throw new Error(
        'Cannot delete role because it is already assigned to users',
      );
    }
    await this.roleRepository.remove(role);
  }
  async assignMenusToRole(roleId: number, menuIds: number[]) {
    const role = await this.roleRepository.findOne({
      where: { roleId: roleId },
      relations: ['menus', 'permissions'],
    });

    const menus = await this.menuRepo.findByIds(menuIds);
    role.menus = menus;

    return this.roleRepository.save(role);
  }

  async assignPermissionsToRole(roleId: number, permissionIds: number[]) {
    const role = await this.roleRepository.findOne({
      where: { roleId: roleId },
      relations: ['permissions', 'menus'],
    });

    const permissions = await this.permissionRepo.findByIds(permissionIds);
    role.permissions = permissions;

    return this.roleRepository.save(role);
  }
}
