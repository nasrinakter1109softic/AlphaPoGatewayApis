import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const ClientInfo = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    const userAgent = req.headers['user-agent'] || '';
    const ip =
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.ip ||
      req.connection?.remoteAddress ||
      '';
    return { ip, userAgent };
  },
);
