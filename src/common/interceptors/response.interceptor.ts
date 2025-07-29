// src/common/interceptors/response.interceptor.ts
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map, catchError, throwError } from 'rxjs';
import { Request } from 'express';
import { ResponseHelper } from '../helpers/response.helper';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  constructor(private readonly helper: ResponseHelper) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<Request>();

    return next.handle().pipe(
      map((data) =>
        this.helper.success(data, 'Success', {
          url: req.originalUrl,
          method: req.method,
        }),
      ),
      catchError((err) => {
        const errorResp = this.helper.error(
          err.message || 'Internal server error',
          err.response || err,
          err.status || 500,
        );
        return throwError(() => errorResp);
      }),
    );
  }
}
