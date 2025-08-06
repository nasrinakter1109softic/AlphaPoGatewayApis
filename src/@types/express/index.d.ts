import 'express';

declare module 'express' {
  interface UserPayload {
    userId: number;
    email: string;
    permissions: string[];
    role?: number;
    phone?: string;
  }

  interface Request {
    user?: UserPayload;
  }
}
