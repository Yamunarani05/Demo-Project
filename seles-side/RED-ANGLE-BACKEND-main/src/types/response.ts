// Generic response types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Admin specific response types
export interface AdminLoginResponseData {
  admin: {
    id: string;
    email: string;
    name: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
  token: string;
}

export interface AdminProfileResponseData {
  id: string;
  email: string;
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

