export interface ApiResponse<T = any> {
  status: 'SUCCESS' | 'FAILED';
  message?: string;
  data?: T;
}

export interface ErrorResponse {
  status: 'FAILED';
  message: string;
  errors?: string[];
} 