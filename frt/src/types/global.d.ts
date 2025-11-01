interface ApiResponse<T> {
  localDateTime: string;
  data?: T;
  apiError?: ApiError;
}

interface ApiError {
    status_code: number;
    message: string;
    errors : Record<string, string>;
}

interface IUniversalMessage {
    message: string
}