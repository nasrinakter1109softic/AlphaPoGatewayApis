// Fallback: src/common/logger/basic-console-logger.ts
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class BasicLogger {
  private readonly logger = new Logger('App');

  log(message: any, context?: string) {
    this.logger.log(message, context);
  }

  error(message: any, trace?: string, context?: string) {
    this.logger.error(message, trace, context);
  }

  warn(message: any, context?: string) {
    this.logger.warn(message, context);
  }

  debug(message: any, context?: string) {
    this.logger.debug(message, context);
  }

  verbose(message: any, context?: string) {
    this.logger.verbose(message, context);
  }
}
