const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Token key constant
const TOKEN_KEY = 'admin_token';

// Get auth headers
const getHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// Custom error class for API errors
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Base request function with error handling
async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        ...getHeaders(),
        ...options?.headers,
      },
    });

    // Handle 401 Unauthorized
    if (response.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem('admin_user');
      window.location.href = '/login';
      throw new ApiError('Session expired. Please login again.', 401, 'UNAUTHORIZED');
    }

    // Handle 403 Forbidden
    if (response.status === 403) {
      throw new ApiError('Admin privileges required', 403, 'FORBIDDEN');
    }

    // Handle other errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.detail || errorData.message || 'Request failed',
        response.status
      );
    }

    // Handle empty responses
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      return response.json();
    }
    
    return {} as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new ApiError('Network error. Please check your connection.', 0, 'NETWORK_ERROR');
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'Unknown error occurred',
      0
    );
  }
}

// Types
export interface User {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
  last_login: string | null;
}

export interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
}

export interface OverviewStats {
  total_users: number;
  active_today: number;
  content_blocked: number;
  pending_reports: number;
  total_revenue: number;
  blocked_images_count: number;
}

export interface SystemSettingItem {
  key: string;
  value: string;
  description: string;
}

export interface UsageLog {
  id: number;
  user_id: number;
  action_type: string;
  details: string;
  created_at: string;
}

export interface UsageLogsResponse {
  logs: UsageLog[];
  total: number;
  page: number;
  limit: number;
}

export interface ChartDataPoint {
  date: string;
  revenue: number;
  users: number;
}

export interface ChartsData {
  data: ChartDataPoint[];
  total_revenue: number;
  total_users: number;
}

// Admin Service
export const adminService = {
  // Stats
  getOverviewStats: async (): Promise<OverviewStats> => {
    return apiRequest<OverviewStats>('/admin/stats/overview');
  },

  // Charts data (revenue & users over time)
  getChartsData: async (days = 30): Promise<ChartsData> => {
    return apiRequest<ChartsData>(`/admin/stats/charts?days=${days}`);
  },

  // Users
  getUsers: async (
    page = 1,
    limit = 10,
    search = '',
    status = '',
    role = ''
  ): Promise<UserListResponse> => {
    const params = new URLSearchParams();
    params.set('page', page.toString());
    params.set('limit', limit.toString());
    if (search) params.set('search', search);
    if (status) params.set('status', status);
    if (role) params.set('role', role);
    
    return apiRequest<UserListResponse>(`/admin/users?${params}`);
  },

  getUserById: async (userId: number): Promise<User> => {
    return apiRequest<User>(`/admin/users/${userId}`);
  },

  updateUserStatus: async (
    userId: number,
    isActive: boolean | null,
    isAdmin: boolean | null
  ): Promise<User> => {
    return apiRequest<User>(`/admin/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ 
        is_active: isActive, 
        is_admin: isAdmin 
      }),
    });
  },

  deleteUser: async (userId: number): Promise<void> => {
    return apiRequest<void>(`/admin/users/${userId}`, {
      method: 'DELETE',
    });
  },

  // Settings
  getSystemSettings: async (): Promise<SystemSettingItem[]> => {
    return apiRequest<SystemSettingItem[]>('/admin/settings');
  },

  updateSystemSettings: async (settings: SystemSettingItem[]): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify({ settings }),
    });
  },

  // Usage Logs
  getUsageLogs: async (
    page = 1,
    limit = 20,
    userId?: number,
    actionType?: string
  ): Promise<UsageLogsResponse> => {
    const params = new URLSearchParams();
    params.set('page', page.toString());
    params.set('limit', limit.toString());
    if (userId) params.set('user_id', userId.toString());
    if (actionType) params.set('action_type', actionType);
    
    return apiRequest<UsageLogsResponse>(`/admin/logs?${params}`);
  },

  // Export
  exportUsers: async (format: 'csv' | 'json' = 'csv'): Promise<Blob> => {
    const response = await fetch(`${API_URL}/admin/users/export?format=${format}`, {
      headers: getHeaders(),
    });
    
    if (!response.ok) {
      throw new ApiError('Failed to export users', response.status);
    }
    
    return response.blob();
  },
};

// Utility function to download blob as file
export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
