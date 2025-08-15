import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { User, Project, IncomeEntry, ExpenseEntry } from '../types';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: '/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('freelancer-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('freelancer-token');
      localStorage.removeItem('freelancer-user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API Response interface
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Pagination interface
interface PaginationResult {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Stats interfaces
interface ProjectStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalExpectedPayment: number;
}

interface IncomeStats {
  totalIncome: number;
  totalEntries: number;
  averageIncome: number;
  categoryBreakdown: Record<string, number>;
  monthlyTrend: Array<{ month: string; amount: number }>;
}

interface ExpenseStats {
  totalExpenses: number;
  totalEntries: number;
  averageExpense: number;
  categoryBreakdown: Record<string, number>;
  monthlyTrend: Array<{ month: string; amount: number }>;
}

interface HealthStatus {
  status: string;
  timestamp: string;
  environment: string;
  database: string;
}

// Auth API
export const authAPI = {
  register: async (name: string, email: string, password: string, currency = 'USD'): Promise<{ user: User; tokens: { accessToken: string; refreshToken: string } }> => {
    const response: AxiosResponse<ApiResponse<{ user: User; tokens: { accessToken: string; refreshToken: string } }>> = 
      await api.post('/auth/register', { name, email, password, currency });
    return response.data.data!;
  },

  login: async (email: string, password: string): Promise<{ user: User; tokens: { accessToken: string; refreshToken: string } }> => {
    const response: AxiosResponse<ApiResponse<{ user: User; tokens: { accessToken: string; refreshToken: string } }>> = 
      await api.post('/auth/login', { email, password });
    return response.data.data!;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  refreshToken: async (refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> => {
    const response: AxiosResponse<ApiResponse<{ accessToken: string; refreshToken: string }>> = 
      await api.post('/auth/refresh', { refreshToken });
    return response.data.data!;
  },

  getMe: async (): Promise<User> => {
    const response: AxiosResponse<ApiResponse<User>> = await api.get('/auth/me');
    return response.data.data!;
  },

  updateMe: async (userData: Partial<User>): Promise<User> => {
    const response: AxiosResponse<ApiResponse<User>> = await api.put('/auth/me', userData);
    return response.data.data!;
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await api.put('/auth/change-password', { currentPassword, newPassword });
  }
};

// Projects API
export const projectsAPI = {
  getProjects: async (params?: { page?: number; limit?: number; status?: string }): Promise<{ projects: Project[]; pagination?: PaginationResult }> => {
    const response: AxiosResponse<ApiResponse<Project[]>> = await api.get('/projects', { params });
    return { projects: response.data.data!, pagination: response.data.pagination };
  },

  getProject: async (id: string): Promise<Project> => {
    const response: AxiosResponse<ApiResponse<Project>> = await api.get(`/projects/${id}`);
    return response.data.data!;
  },

  createProject: async (project: Omit<Project, 'id' | 'createdDate'>): Promise<Project> => {
    const response: AxiosResponse<ApiResponse<Project>> = await api.post('/projects', project);
    return response.data.data!;
  },

  updateProject: async (id: string, updates: Partial<Project>): Promise<Project> => {
    const response: AxiosResponse<ApiResponse<Project>> = await api.put(`/projects/${id}`, updates);
    return response.data.data!;
  },

  deleteProject: async (id: string): Promise<void> => {
    await api.delete(`/projects/${id}`);
  },

  getProjectStats: async (): Promise<ProjectStats> => {
    const response: AxiosResponse<ApiResponse<ProjectStats>> = await api.get('/projects/stats');
    return response.data.data!;
  }
};

// Income API
export const incomeAPI = {
  getIncomeEntries: async (params?: { page?: number; limit?: number; projectId?: string; category?: string; startDate?: string; endDate?: string }): Promise<{ entries: IncomeEntry[]; pagination?: PaginationResult }> => {
    const response: AxiosResponse<ApiResponse<IncomeEntry[]>> = await api.get('/income', { params });
    return { entries: response.data.data!, pagination: response.data.pagination };
  },

  getIncomeEntry: async (id: string): Promise<IncomeEntry> => {
    const response: AxiosResponse<ApiResponse<IncomeEntry>> = await api.get(`/income/${id}`);
    return response.data.data!;
  },

  createIncomeEntry: async (entry: Omit<IncomeEntry, 'id'>): Promise<IncomeEntry> => {
    const response: AxiosResponse<ApiResponse<IncomeEntry>> = await api.post('/income', entry);
    return response.data.data!;
  },

  updateIncomeEntry: async (id: string, updates: Partial<IncomeEntry>): Promise<IncomeEntry> => {
    const response: AxiosResponse<ApiResponse<IncomeEntry>> = await api.put(`/income/${id}`, updates);
    return response.data.data!;
  },

  deleteIncomeEntry: async (id: string): Promise<void> => {
    await api.delete(`/income/${id}`);
  },

  getIncomeStats: async (params?: { startDate?: string; endDate?: string }): Promise<IncomeStats> => {
    const response: AxiosResponse<ApiResponse<IncomeStats>> = await api.get('/income/stats', { params });
    return response.data.data!;
  }
};

// Expenses API
export const expenseAPI = {
  getExpenseEntries: async (params?: { page?: number; limit?: number; projectId?: string; category?: string; startDate?: string; endDate?: string }): Promise<{ entries: ExpenseEntry[]; pagination?: PaginationResult }> => {
    const response: AxiosResponse<ApiResponse<ExpenseEntry[]>> = await api.get('/expenses', { params });
    return { entries: response.data.data!, pagination: response.data.pagination };
  },

  getExpenseEntry: async (id: string): Promise<ExpenseEntry> => {
    const response: AxiosResponse<ApiResponse<ExpenseEntry>> = await api.get(`/expenses/${id}`);
    return response.data.data!;
  },

  createExpenseEntry: async (entry: Omit<ExpenseEntry, 'id'>): Promise<ExpenseEntry> => {
    const response: AxiosResponse<ApiResponse<ExpenseEntry>> = await api.post('/expenses', entry);
    return response.data.data!;
  },

  updateExpenseEntry: async (id: string, updates: Partial<ExpenseEntry>): Promise<ExpenseEntry> => {
    const response: AxiosResponse<ApiResponse<ExpenseEntry>> = await api.put(`/expenses/${id}`, updates);
    return response.data.data!;
  },

  deleteExpenseEntry: async (id: string): Promise<void> => {
    await api.delete(`/expenses/${id}`);
  },

  getExpenseStats: async (params?: { startDate?: string; endDate?: string }): Promise<ExpenseStats> => {
    const response: AxiosResponse<ApiResponse<ExpenseStats>> = await api.get('/expenses/stats', { params });
    return response.data.data!;
  }
};

// Health check
export const healthAPI = {
  check: async (): Promise<HealthStatus> => {
    const response: AxiosResponse<ApiResponse<HealthStatus>> = await api.get('/health');
    return response.data.data!;
  }
};

export default api;
