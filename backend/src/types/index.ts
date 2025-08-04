import { Request } from "express";
import { Role } from "@prisma/client";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    username: string;
    email: string;
    role: Role;
    firstName: string;
    lastName: string;
  };
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: Role;
}

export interface CreateBookRequest {
  isbn: string;
  title: string;
  description?: string;
  price: number;
  publisher: string;
  publishedDate: string;
  authors: number[];
  edition: string;
  format: string;
  pages: number;
  language: string;
}

export interface CreateAuthorRequest {
  name: string;
  biography?: string;
}

export interface CreateSchoolRequest {
  schoolName: string;
  address: string;
  contactPerson: string;
  phone: string;
  email: string;
}

export interface CreateStockEntryRequest {
  bookId: number;
  quantity: number;
  location: string;
}

export interface CreateBillRequest {
  customerId: number;
  items: {
    bookId: number;
    quantity: number;
  }[];
  paymentMethod?: string;
}

export interface CreateTransactionRequest {
  schoolId: number;
  items: {
    bookId: number;
    quantity: number;
  }[];
  paymentMethod?: string;
}

export interface CreateReturnRequest {
  schoolId: number;
  items: {
    bookId: number;
    quantity: number;
    reason?: string;
  }[];
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
