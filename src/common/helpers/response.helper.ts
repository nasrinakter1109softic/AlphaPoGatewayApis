// src/common/helpers/response.helper.ts
import { Injectable } from '@nestjs/common';
import { IErrorResponse, ISuccessResponse } from '../types/api.response';
import { BasicLogger } from '../logger/basic-console-logger';

@Injectable()
export class ResponseHelper {
  private readonly logger: BasicLogger = new BasicLogger();

  success<T = any>(data: T, message = 'Success', meta?: any): ISuccessResponse {
    const response: ISuccessResponse = {
      status: 200,
      message,
      data,
      meta,
    };
    this.logger.log(message);
    return response;
  }

  error(message: string, error: any, status = 500): IErrorResponse {
    const response: IErrorResponse = {
      status,
      message,
      error,
      request: {},
    };
    this.logger.error(message, JSON.stringify(error));
    return response;
  }
}
