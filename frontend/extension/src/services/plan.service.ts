import { apiService } from './api.service';
import { API_ENDPOINTS } from '../core/config/api';
import { Plan, UserPlan } from '../types/common';

export class PlanService {
  async getPlans(): Promise<Plan[]> {
    const response = await apiService.get<Plan[]>(API_ENDPOINTS.PLAN.LIST);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error?.message || 'Failed to fetch plans');
  }

  async getCurrentPlan(): Promise<UserPlan> {
    const response = await apiService.get<UserPlan>(API_ENDPOINTS.PLAN.CURRENT);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error?.message || 'Failed to fetch current plan');
  }

  async upgradePlan(planId: string, period: "month" | "year", promoCode?: string): Promise<UserPlan> {
    const response = await apiService.post<UserPlan>(API_ENDPOINTS.PLAN.UPGRADE, {
      planId,
      period,
      promoCode
    });
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error?.message || 'Failed to upgrade plan');
  }

  async cancelPlan(): Promise<boolean> {
    const response = await apiService.post<{ success: boolean }>(API_ENDPOINTS.PLAN.CANCEL, {});
    
    if (response.success) {
      return true;
    }
    
    throw new Error(response.error?.message || 'Failed to cancel plan');
  }
}

export const planService = new PlanService();
