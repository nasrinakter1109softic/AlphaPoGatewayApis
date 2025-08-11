import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorMessage = 'Internal server error';
    let errorDetails = { message: errorMessage };

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        errorMessage = exceptionResponse;
        errorDetails = { message: exceptionResponse };
      } else {
        // For validation errors, use the first error message or default
        const responseObj = exceptionResponse as any;
        errorMessage = responseObj.error || 'Bad Request Exception';
        errorDetails = {
          message: Array.isArray(responseObj.message)
            ? responseObj.message[0]
            : responseObj.message || errorMessage,
        };
      }
    } else if (exception instanceof Error) {
      errorDetails = { message: exception.message };
    }
    const errorResponse = {
      status,
      message: errorMessage,
      error: errorDetails,
      request: {
        url: request.url,
        method: request.method,
      },
    };

    this.logger.error(
      `${request.method} ${request.url}`,
      JSON.stringify(errorResponse),
      'HttpExceptionFilter',
    );
    response.status(status).json(errorResponse);
  }
}
