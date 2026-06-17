import { HttpException } from '@nestjs/common';
import { ApiValidationErrorField } from '../interfaces/api-response.interface';

export class BaseException extends HttpException {
  constructor(
    public readonly errorCode: string,
    public readonly message: string,
    public readonly statusCode: number,
    public readonly fields?: ApiValidationErrorField[],
  ) {
    super(
      {
        success: false,
        error: {
          code: errorCode,
          message,
          fields,
        },
      },
      statusCode,
    );
  }
}
