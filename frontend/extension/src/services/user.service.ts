import { apiService } from './api.service';
import { API_ENDPOINTS } from '../core/config/api';
import { UserProfile, SecuritySettings, PrivacySettings, UserStatistics } from '../types/common';

export interface UserSettings {
  security: SecuritySettings;
  privacy: PrivacySettings;
  notifications: boolean;
  language: string;
  theme: string;
}



export class UserService {
  async getProfile(): Promise<UserProfile> {
    const response = await apiService.get<UserProfile>(
      API_ENDPOINTS.USER.PROFILE
    );

    if (response.success && response.data) {
      const data = response.data as any;
      // Map backend fields to frontend interface if needed
      return {
        ...response.data,
        fullName: response.data.fullName || data.name || data.full_name || data.username || '',
        id: response.data.id || data._id || '',
      };
    }

    throw new Error(response.error?.message || 'Failed to get user profile');
  }

  async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    // Create a payload that might satisfy different backend expectations
    const payload = {
      ...data,
      name: data.fullName, // Fallback for backends expecting 'name'
      full_name: data.fullName, // Fallback for backends expecting 'full_name'
    };

    const response = await apiService.put<UserProfile>(
      API_ENDPOINTS.USER.UPDATE_PROFILE,
      payload
    );

    if (response.success && response.data) {
      const responseData = response.data as any;
      return {
        ...response.data,
        fullName: response.data.fullName || responseData.name || responseData.full_name || data.fullName || '',
      };
    }

    throw new Error(response.error?.message || 'Failed to update profile');
  }

  async getSettings(): Promise<UserSettings> {
    const response = await apiService.get<UserSettings>(
      API_ENDPOINTS.USER.SETTINGS
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error?.message || 'Failed to get settings');
  }

  async updateSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
    const response = await apiService.put<UserSettings>(
      API_ENDPOINTS.USER.UPDATE_SETTINGS,
      settings
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error?.message || 'Failed to update settings');
  }

  async getStatistics(): Promise<UserStatistics> {
    const response = await apiService.get<UserStatistics>(
      API_ENDPOINTS.USER.STATISTICS
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error?.message || 'Failed to get statistics');
  }
}

export const userService = new UserService();
