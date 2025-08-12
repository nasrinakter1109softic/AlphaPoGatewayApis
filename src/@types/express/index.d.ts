import 'express';

declare module 'express' {
  interface UserPayload {
    userId: number;
    email: string;
    permissions: string[];
    role?: number;
    phone?: string;
    userType?: string;
    companyId?: number;
  }

  interface Request {
    user?: UserPayload;
  }
}
