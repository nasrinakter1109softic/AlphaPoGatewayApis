import 'express';

declare module 'express' {
  interface UserPayload {
    userId: number;
    email: string;
    permissions: string[];
    roleId?: number;
  }

  interface Request {
    user?: UserPayload;
  }
}
