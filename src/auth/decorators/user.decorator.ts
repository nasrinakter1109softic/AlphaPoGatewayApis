import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    if (!data) return request.user;
    // return {
    //   userId: request.user.userId,
    //   role: request.user.role,
    //   email: request.user.email,
    //   phone: request.user?.phone,
    //   userType: request.user.userType,
    //   companyId: request.user?.companyId,
    // };
    return request.user[data];
  },
);
