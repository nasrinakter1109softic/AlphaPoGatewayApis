import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from './entity/permission.entity';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import {
  GenericQueryService,
  GenericQueryOptions,
} from 'src/common/services/generic-query.service';
import { GenericQueryDto } from 'src/common/dtos/GenericQueryDto';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepo: Repository<Permission>,
    private readonly genericQuery: GenericQueryService,
  ) {}

  async create(dto: CreatePermissionDto) {
    const exists = await this.permissionRepo.findOne({
      where: [{ title: dto.title }, { slug: dto.slug }],
    });
    if (exists) {
      throw new ConflictException(
        `Permission with title '${dto.title}' or slug '${dto.slug}' already exists.`,
      );
    }
    const permission = this.permissionRepo.create(dto);
    return this.permissionRepo.save(permission);
  }

  async findAll(options: GenericQueryDto) {
    return this.genericQuery.query(this.permissionRepo, 'permission', options, {
      allowedFilterColumns: ['title', 'slug'],
      searchableColumns: ['title', 'slug'],
    });
  }

  async findOne(id: number) {
    const permission = await this.permissionRepo.findOne({
      where: { permissionId: id },
      relations: ['roles'],
    });
    if (!permission) {
      throw new NotFoundException(`Permission with ID ${id} not found.`);
    }
    return permission;
  }

  async update(id: number, dto: UpdatePermissionDto) {
    await this.findOne(id);
    await this.permissionRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const permission = await this.findOne(id);
    if (permission.roles && permission.roles.length > 0) {
      throw new ConflictException(
        'Cannot delete permission that is assigned to roles.',
      );
    }
    await this.permissionRepo.remove(permission);
    return { success: true };
  }
}
