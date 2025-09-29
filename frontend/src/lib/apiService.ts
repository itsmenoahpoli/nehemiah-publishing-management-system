import api from './api';

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
}

export class ApiService {
  static async get<T = any>(url: string, params?: any): Promise<ApiResponse<T>> {
    try {
      const response = await api.get(url, { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Request failed');
    }
  }

  static async post<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await api.post(url, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Request failed');
    }
  }

  static async put<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await api.put(url, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Request failed');
    }
  }

  static async delete<T = any>(url: string): Promise<ApiResponse<T>> {
    try {
      const response = await api.delete(url);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Request failed');
    }
  }
}

export const booksApi = {
  getAll: (params?: PaginationParams & { author?: string }) =>
    ApiService.get('/books', params),
  getById: (id: number) => ApiService.get(`/books/${id}`),
  create: (data: any) => ApiService.post('/books', data),
  update: (id: number, data: any) => ApiService.put(`/books/${id}`, data),
  delete: (id: number) => ApiService.delete(`/books/${id}`),
  getAuthors: (params?: PaginationParams) => ApiService.get('/books/authors', params),
  createAuthor: (data: any) => ApiService.post('/books/authors', data),
};

export const inventoryApi = {
  getWarehouse: (params?: PaginationParams) =>
    ApiService.get('/inventory/warehouse', params),
  getSchools: (params?: PaginationParams & { status?: string }) =>
    ApiService.get('/inventory/schools', params),
  getSchoolStock: (schoolId: number, params?: PaginationParams) =>
    ApiService.get(`/inventory/schools/${schoolId}`, params),
};

export const billingApi = {
  getAll: (params?: PaginationParams & { status?: string }) =>
    ApiService.get('/billing', params),
  create: (data: any) => ApiService.post('/billing', data),
  processPayment: (id: number, data: any) => ApiService.put(`/billing/${id}/pay`, data),
  updateStatus: (id: number, status: string) => ApiService.put(`/billing/${id}/status`, { status }),
};

export const stockEntriesApi = {
  getAll: (params?: PaginationParams) => ApiService.get('/stock-entries', params),
  create: (data: any) => ApiService.post('/stock-entries', data),
  update: (id: number, data: any) => ApiService.put(`/stock-entries/${id}`, data),
  delete: (id: number) => ApiService.delete(`/stock-entries/${id}`),
};

export const bookRequestsApi = {
  getAll: (params?: PaginationParams) => ApiService.get('/book-requests', params),
  create: (data: any) => ApiService.post('/book-requests', data),
  approve: (id: number) => ApiService.put(`/book-requests/${id}/approve`),
  reject: (id: number) => ApiService.put(`/book-requests/${id}/reject`),
};

export const returnsApi = {
  getAll: (params?: PaginationParams & { status?: string }) =>
    ApiService.get('/returns', params),
  create: (data: any) => ApiService.post('/returns', data),
  approve: (id: number) => ApiService.put(`/returns/${id}/approve`),
  reject: (id: number) => ApiService.put(`/returns/${id}/reject`),
};

export const registrationsApi = {
  getAll: (params?: PaginationParams & { status?: string }) =>
    ApiService.get('/registrations', params),
  create: (data: any) => ApiService.post('/registrations', data),
  approve: (id: number) => ApiService.put(`/registrations/${id}/approve`),
  reject: (id: number) => ApiService.put(`/registrations/${id}/reject`),
};

export const reportsApi = {
  getSales: (params?: { startDate?: string; endDate?: string }) =>
    ApiService.get('/reports/sales', params),
  getInventory: () => ApiService.get('/reports/inventory'),
  getTransactions: (params?: { startDate?: string; endDate?: string; type?: string }) =>
    ApiService.get('/reports/transactions', params),
  getSchools: () => ApiService.get('/reports/schools'),
};

export const usersApi = {
  getAll: (params?: PaginationParams) => ApiService.get('/users', params),
  create: (data: any) => ApiService.post('/users', data),
  update: (id: number, data: any) => ApiService.put(`/users/${id}`, data),
  delete: (id: number) => ApiService.delete(`/users/${id}`),
};

export const schoolsApi = {
  getAll: (params?: PaginationParams & { status?: string }) =>
    ApiService.get('/schools', params),
  getById: (id: number) => ApiService.get(`/schools/${id}`),
  create: (data: any) => ApiService.post('/schools', data),
  update: (id: number, data: any) => ApiService.put(`/schools/${id}`, data),
  delete: (id: number) => ApiService.delete(`/schools/${id}`),
  approve: (id: number) => ApiService.post(`/schools/${id}/approve`),
};

export const dashboardApi = {
  getOverview: () => ApiService.get('/dashboard/overview'),
  getRevenueCharts: (period?: 'week' | 'month' | 'year') => 
    ApiService.get('/dashboard/charts/revenue', { period }),
  getBooksCharts: () => ApiService.get('/dashboard/charts/books'),
  getInventoryCharts: () => ApiService.get('/dashboard/charts/inventory'),
  getSalesCharts: (period?: 'week' | 'month' | 'year') => 
    ApiService.get('/dashboard/charts/sales', { period }),
  getSchoolsCharts: () => ApiService.get('/dashboard/charts/schools'),
  getRecentActivity: () => ApiService.get('/dashboard/recent-activity'),
};
