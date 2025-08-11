import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[] | string>(
      'roles',
      [context.getHandler(), context.getClass()],
    );
    if (!required || (Array.isArray(required) && required.length === 0))
      return true;
    const requiredList = Array.isArray(required) ? required : [required];

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const req = context.switchToHttp().getRequest();
    const user = req.user;

    if (isPublic && !user) return true;

    if (!user || !user.role?.roleName) {
      throw new ForbiddenException('Authentication/role required');
    }

    const ok = requiredList.some((role) => user.role.roleName === role);
    if (!ok) throw new ForbiddenException('Insufficient role');

    return true;
  }
}
