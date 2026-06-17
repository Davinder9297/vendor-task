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
      exceptionResponse &&
      typeof exceptionResponse === 'object' &&
      'success' in exceptionResponse
    ) {
      response.status(status).json(exceptionResponse);
    } else {
      let code = 'UNKNOWN_ERROR';
      switch (status) {
        case 400:
          code = 'BAD_REQUEST';
          break;
        case 401:
          code = 'UNAUTHORIZED';
          break;
        case 403:
          code = 'FORBIDDEN';
          break;
        case 404:
          code = 'NOT_FOUND';
          break;
        case 409:
          code = 'CONFLICT';
          break;
        case 500:
          code = 'INTERNAL_SERVER_ERROR';
          break;
      }

      let message = exception.message || 'Internal server error';
      if (exceptionResponse && typeof exceptionResponse === 'object') {
        const resObj = exceptionResponse as any;
        if (typeof resObj.message === 'string') {
          message = resObj.message;
        } else if (Array.isArray(resObj.message)) {
          message = resObj.message.join(', ');
        }
      }

      response.status(status).json({
        success: false,
        error: {
          code,
          message,
        },
      });
    }
  }
}
