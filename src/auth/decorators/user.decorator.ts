import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    console.log('User:', request.user);
    return {
      userId: request.user.userId,
      role: request.user.role,
      email: request.user.email,
      phone: request.user?.phone,
      userType: request.user.userType,
      companyId: request.user?.companyId,
    };
  },
);
