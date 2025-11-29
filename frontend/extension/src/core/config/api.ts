// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  TIMEOUT: 30000, // Increase timeout for image processing
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REGISTER: '/api/auth/register',
    REFRESH: '/api/auth/refresh',
    VERIFY: '/api/auth/verify',
  },
  
  // Content detection endpoints
  DETECTION: {
    ANALYZE_IMAGE: '/api/detection/image',
    ANALYZE_VIDEO: '/api/detection/video',
    BATCH_ANALYZE: '/api/detection/batch',
    GET_RESULT: '/api/detection/result/:id',
  },
  
  // User endpoints
  USER: {
    PROFILE: '/api/user/profile',
    UPDATE_PROFILE: '/api/user/profile',
    SETTINGS: '/api/user/settings',
    UPDATE_SETTINGS: '/api/user/settings',
    STATISTICS: '/api/user/statistics',
  },
  
  // Report endpoints
  REPORT: {
    CREATE: '/api/report',
    LIST: '/api/report/list',
    GET: '/api/report/:id',
    UPDATE: '/api/report/:id',
  },
  
  // Filter endpoints
  FILTER: {
    GET_RULES: '/api/filter/rules',
    UPDATE_RULES: '/api/filter/rules',
    WHITELIST: '/api/filter/whitelist',
    BLACKLIST: '/api/filter/blacklist',
  },
  
  // Statistics endpoints
  STATS: {
    OVERVIEW: '/api/stats/overview',
    DAILY: '/api/stats/daily',
    WEEKLY: '/api/stats/weekly',
    MONTHLY: '/api/stats/monthly',
  },

  // Payment endpoints
  PAYMENT: {
    BILLS: '/api/payment/bills',
    METHODS: '/api/payment/methods',
    PROCESS: '/api/payment/process',
    HISTORY: '/api/payment/history',
  },

  // Plan endpoints
  PLAN: {
    LIST: '/api/plans',
    CURRENT: '/api/plans/current',
    UPGRADE: '/api/plans/upgrade',
    CANCEL: '/api/plans/cancel',
  },
} as const;

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    timestamp: string;
    requestId: string;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
  };
}