import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ResponseHelper } from '../helpers/response.helper';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly responseHelper: ResponseHelper) {}
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let errorData: any;

    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      errorData = typeof res === 'string' ? { message: res } : res;
    } else {
      errorData = { message: (exception as any)?.message || 'Unhandled error' };
    }

    const finalResponse = {
      status,
      message: errorData.message || 'Internal server error',
      error: errorData,
      request: {
        url: request.url,
        method: request.method,
      },
    };

    // Avoid nesting ResponseHelper.error here
    response.status(status).json(finalResponse);
  }
}
