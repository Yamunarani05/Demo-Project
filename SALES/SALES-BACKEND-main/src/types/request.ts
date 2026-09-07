export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminCreateRequest {
  email: string;
  name: string;
  password: string;
}
export interface PaginationQuery {
  page?: string;
  limit?: string;
  search?: string;
  combo?: string;
}