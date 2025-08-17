import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionCacheService } from 'src/common/services/permission-cache.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Roles } from '@/role/entity/role.entity';
import { Repository } from 'typeorm';

@Injectable()
export class InjectPermissionsGuard implements CanActivate {
  constructor(
    private readonly permissionCache: PermissionCacheService,
    @InjectRepository(Roles) private roleRepository: Repository<Roles>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.userId || !user.role?.roleId) {
      return true;
    }

    // Only load if permissions not already present
    if (!user.permissions || user.permissions.length === 0) {
      let permissions = await this.permissionCache.getPermissions(user.userId);

      if (!permissions) {
        let { permissions } = await this.roleRepository.findOne({
          where: { roleId: user.role.roleId },
          relations: ['permissions'],
        });
        const userPermissions = permissions.map((p) => p.slug);
        await this.permissionCache.setPermissions(user.userId, userPermissions);
      }

      user.permissions = permissions;
    }

    return true;
  }
}
