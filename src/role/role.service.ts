/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Roles } from './entity/role.entity';
import { Repository } from 'typeorm';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { GenericQueryService } from 'src/common/services/generic-query.service';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Roles)
    private roleRepository: Repository<Roles>,
    private readonly genericQueryService: GenericQueryService,
  ) {}
  async createRole(data: CreateRoleDto): Promise<Roles> {
    const existingRole = await this.roleRepository.findOne({
      where: { roleName: data.roleName },
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
      },
    );
    return roles;
  }
  async getRoleById(roleId: number): Promise<Roles | null> {
    return this.roleRepository.findOneBy({ roleId });
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
    if (role.isUsed) {
      throw new Error('Cannot delete roles that are currently in use');
    }
    await this.roleRepository.remove(role);
  }
  async assignRole(data: any | null): Promise<void> {
    // Logic to assign a role to a user
    // This would typically involve updating a user entity with the roleId
    // Implementation depends on your user management logic
    return Promise.resolve();
  }
}
