import { HttpException } from '@nestjs/common';

export class BaseException extends HttpException {
  constructor(
    public readonly errorCode: string,
    public readonly message: string,
    public readonly statusCode: number,
    public readonly fields?: Record<string, string>,
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
