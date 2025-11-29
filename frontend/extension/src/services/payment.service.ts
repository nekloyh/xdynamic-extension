import { apiService } from './api.service';
import { API_ENDPOINTS } from '../core/config/api';

export interface Bill {
  id: string;
  amount: number;
  currency: string;
  dueDate: string;
  status: "paid" | "unpaid" | "overdue";
  description: string;
  plan: string;
}

export interface PaymentMethod {
  id: string;
  type: "credit_card" | "paypal" | "momo" | "zalo_pay";
  last4?: string;
  expiry?: string;
  isDefault: boolean;
}

export interface PaymentResult {
  transactionId: string;
  status: "success" | "failed" | "pending";
  message?: string;
  timestamp: string;
}

export interface PaymentData {
  transactionId: string;
  method: string;
  amount: number;
  currency: string;
  timestamp: string;
  bill: Bill;
  paymentData: any;
}

export class PaymentService {
  async getBills(): Promise<Bill[]> {
    const response = await apiService.get<Bill[]>(API_ENDPOINTS.PAYMENT.BILLS);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error?.message || 'Failed to fetch bills');
  }

  async getPaymentMethods(): Promise<PaymentMethod[]> {
    const response = await apiService.get<PaymentMethod[]>(API_ENDPOINTS.PAYMENT.METHODS);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error?.message || 'Failed to fetch payment methods');
  }

  async processPayment(billId: string, paymentMethodId: string): Promise<PaymentResult> {
    const response = await apiService.post<PaymentResult>(API_ENDPOINTS.PAYMENT.PROCESS, {
      billId,
      paymentMethodId
    });
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error?.message || 'Payment processing failed');
  }
}

export const paymentService = new PaymentService();
