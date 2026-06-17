export interface ApiValidationErrorField {
  path: string;
  message: string;
}

export interface ApiError {
  code: string;
  message: string;
  fields?: ApiValidationErrorField[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
}
