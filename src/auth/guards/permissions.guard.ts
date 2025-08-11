import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const required = this.reflector.getAllAndOverride<string[] | string>(
      'permissions',
      [context.getHandler(), context.getClass()],
    );

    if (!required || (Array.isArray(required) && required.length === 0)) {
      return true;
    }
    const requiredList = Array.isArray(required) ? required : [required];

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (isPublic && !user) return true;
    if (!user) throw new ForbiddenException('Authentication required');

    const userPermissions: string[] = user.permissions || [];
    const userPerms: string[] = Array.isArray(user.permissions)
      ? user.permissions
      : [];
    const ok = requiredList.every((p) => userPerms.includes(p));
    if (!ok) throw new ForbiddenException('Insufficient permissions');

    return true;
  }
}
