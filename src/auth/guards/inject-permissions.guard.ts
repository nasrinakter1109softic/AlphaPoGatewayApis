import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionCacheService } from 'src/common/services/permission-cache.service';
import { RoleService } from 'src/role/role.service';

@Injectable()
export class InjectPermissionsGuard implements CanActivate {
  constructor(
    private readonly permissionCache: PermissionCacheService,
    private readonly roleService: RoleService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    console.log('Permissions Guard User:', user);

    if (!user || !user.userId || !user.role?.roleId) {
      return true;
    }

    // Only load if permissions not already present
    if (!user.permissions || user.permissions.length === 0) {
      let permissions = await this.permissionCache.getPermissions(user.userId);
      console.log('Cached Permissions:', permissions);
      if (!permissions) {
        const permEntities = await this.roleService.getPermissionsByRole(
          user.role.roleId,
        );
        permissions = permEntities.map((p) => p.slug);
        await this.permissionCache.setPermissions(user.userId, permissions);
      }

      user.permissions = permissions;
    }

    return true;
  }
}
