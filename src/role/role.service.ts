/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Roles } from './role';
import { Repository } from 'typeorm';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Roles)
    private roleRepository: Repository<Roles>,
  ) {}
  async createRole(data: CreateRoleDto): Promise<Roles> {
    const role = this.roleRepository.create(data);
    return this.roleRepository.save(role);
  }
  async getAllRoles(): Promise<Roles[]> {
    return this.roleRepository.find();
  }
  async getRoleById(roleId: number): Promise<Roles | null> {
    return this.roleRepository.findOneBy({ roleId });
  }
  async updateRole(roleId: number, data: UpdateRoleDto): Promise<Roles> {
    const role = await this.getRoleById(roleId);
    if (!role) {
      throw new Error('Role not found');
    }
    role.roleName = data.roleName;
    return this.roleRepository.save(role);
  }
  async deleteRole(roleId: number): Promise<void> {
    const role = await this.getRoleById(roleId);
    if (!role) {
      throw new Error('Role not found');
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
