import { API_CONFIG } from '../../core/config/api';
import { authService } from '../../services/auth.service';

const ADMIN_PREFIX = '/api/admin';

export interface OverviewStats {
  total_users: number;
  active_today: number;
  content_blocked: number;
  pending_reports: number;
}

export interface UsageStats {
  usage_over_time: { date: string; value: number }[];
  growth_percentage: number;
}

export interface AccuracyStats {
  accuracy_percentage: number;
  last_30_days_change: number;
  accurate_count: number;
  inaccurate_count: number;
}

export interface TopCategory {
  category: string;
  percentage: number;
}

export interface Activity {
  id: string;
  content: string;
  user: string;
  date: string;
  action: string;
  type: 'filtered_content' | 'login' | 'report';
}

export interface Report {
  id: string;
  content_preview: string;
  report_reason: string;
  reporter: string;
  submission_date: string;
  status: 'pending' | 'approved' | 'rejected' | 'reviewed';
  category?: string;
}

export interface ReportResponse {
  data: Report[];
  total: number;
  page: number;
  limit: number;
}

class AdminService {
  private async getHeaders() {
    const token = await authService.getAuthToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async getOverviewStats(): Promise<OverviewStats> {
    const response = await fetch(`${API_CONFIG.BASE_URL}${ADMIN_PREFIX}/stats/overview`, {
      headers: await this.getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch overview stats');
    return response.json();
  }

  async getUsageStats(range: string = '30d'): Promise<UsageStats> {
    const response = await fetch(`${API_CONFIG.BASE_URL}${ADMIN_PREFIX}/stats/usage?range=${range}`, {
      headers: await this.getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch usage stats');
    return response.json();
  }

  async getAccuracyStats(range: string = '30d'): Promise<AccuracyStats> {
    const response = await fetch(`${API_CONFIG.BASE_URL}${ADMIN_PREFIX}/stats/accuracy?range=${range}`, {
      headers: await this.getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch accuracy stats');
    return response.json();
  }

  async getTopCategories(range: string = '30d'): Promise<TopCategory[]> {
    const response = await fetch(`${API_CONFIG.BASE_URL}${ADMIN_PREFIX}/stats/top-categories?range=${range}`, {
      headers: await this.getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch top categories');
    return response.json();
  }

  async getRecentActivities(limit: number = 5): Promise<Activity[]> {
    const response = await fetch(`${API_CONFIG.BASE_URL}${ADMIN_PREFIX}/activities?limit=${limit}`, {
      headers: await this.getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch recent activities');
    return response.json();
  }

  async getReports(params: {
    page?: number;
    limit?: number;
    status?: string;
    date_range?: string;
    category?: string;
    search?: string;
  }): Promise<ReportResponse> {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.status) query.append('status', params.status);
    if (params.date_range) query.append('date_range', params.date_range);
    if (params.category) query.append('category', params.category);
    if (params.search) query.append('search', params.search);

    const response = await fetch(`${API_CONFIG.BASE_URL}${ADMIN_PREFIX}/reports?${query.toString()}`, {
      headers: await this.getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch reports');
    return response.json();
  }

  async handleReportAction(reportIds: string[], action: 'approve' | 'reject' | 'review'): Promise<any> {
    const response = await fetch(`${API_CONFIG.BASE_URL}${ADMIN_PREFIX}/reports/action`, {
      method: 'POST',
      headers: await this.getHeaders(),
      body: JSON.stringify({ report_ids: reportIds, action }),
    });
    if (!response.ok) throw new Error('Failed to perform action');
    return response.json();
  }
}

export const adminService = new AdminService();
