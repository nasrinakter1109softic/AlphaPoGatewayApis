// src/common/guards/optional-jwt-auth.guard.ts
import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return true;
    }
    return super.canActivate(context);
  }

  // Override handleRequest to allow invalid tokens to pass as unauthenticated
  handleRequest(err: any, user: any, info: any): any {
    if (err || !user) {
      return null;
    }
    return user;
  }
}
