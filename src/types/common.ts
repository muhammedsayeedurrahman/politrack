export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
  pagination?: Pagination;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'investigator' | 'analyst' | 'viewer';
  avatar?: string;
}

export type TimeRange = '24h' | '7d' | '30d' | '90d' | 'all';
