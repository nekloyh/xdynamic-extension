import { apiService } from './api.service';
import { API_ENDPOINTS } from '../core/config/api';

export interface URLItem {
  id: string;
  url: string;
  addedAt: Date;
  visits: number;
}

export class FilterService {
  private normalizeItem(data: any): URLItem {
    const addedAt = data?.addedAt || data?.created_at || data?.createdAt || Date.now();
    const fallbackId = `url-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    return {
      id: data?.id || data?.url || (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : fallbackId),
      url: data?.url || "",
      addedAt: addedAt instanceof Date ? addedAt : new Date(addedAt),
      visits: typeof data?.visits === "number" ? data.visits : data?.count || 0,
    };
  }

  async getWhitelist(): Promise<URLItem[]> {
    const response = await apiService.get<URLItem[]>(API_ENDPOINTS.FILTER.WHITELIST);
    if (response.success && response.data) {
      return response.data.map((item) => this.normalizeItem(item));
    }
    throw new Error(response.error?.message || 'Failed to get whitelist');
  }

  async addToWhitelist(url: string): Promise<URLItem> {
    const response = await apiService.post<URLItem>(API_ENDPOINTS.FILTER.WHITELIST, { url });
    if (response.success && response.data) {
      return this.normalizeItem(response.data);
    }
    throw new Error(response.error?.message || 'Failed to add to whitelist');
  }

  async removeFromWhitelist(id: string): Promise<void> {
    const response = await apiService.delete(API_ENDPOINTS.FILTER.WHITELIST + `/${id}`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to remove from whitelist');
    }
  }

  async getBlacklist(): Promise<URLItem[]> {
    const response = await apiService.get<URLItem[]>(API_ENDPOINTS.FILTER.BLACKLIST);
    if (response.success && response.data) {
      return response.data.map((item) => this.normalizeItem(item));
    }
    throw new Error(response.error?.message || 'Failed to get blacklist');
  }

  async addToBlacklist(url: string): Promise<URLItem> {
    const response = await apiService.post<URLItem>(API_ENDPOINTS.FILTER.BLACKLIST, { url });
    if (response.success && response.data) {
      return this.normalizeItem(response.data);
    }
    throw new Error(response.error?.message || 'Failed to add to blacklist');
  }

  async removeFromBlacklist(id: string): Promise<void> {
    const response = await apiService.delete(API_ENDPOINTS.FILTER.BLACKLIST + `/${id}`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to remove from blacklist');
    }
  }
}

export const filterService = new FilterService();
