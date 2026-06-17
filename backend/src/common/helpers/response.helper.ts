import { ApiResponse, ApiValidationErrorField } from '../interfaces/api-response.interface';

export class ResponseHelper {
  static success<T>(data: T): ApiResponse<T> {
    return {
      success: true,
      data,
    };
  }

  static error(
    code: string,
    message: string,
    fields?: ApiValidationErrorField[],
  ): ApiResponse {
    return {
      success: false,
      error: {
        code,
        message,
        fields,
      },
    };
  }
}
