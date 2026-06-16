import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    this.logger.error(
      `HTTP Status: ${status} Error Message: ${JSON.stringify(exceptionResponse)}`,
    );

    if (
      typeof exceptionResponse === 'object' &&
      'success' in exceptionResponse
    ) {
      response.status(status).json(exceptionResponse);
    } else {
      response.status(status).json({
        success: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message: exception.message || 'Internal server error',
        },
      });
    }
  }
}
