import { API_CONFIG } from '../core/config/api';
import { readFromStorage, writeManyToStorage, removeFromStorage } from '../core/storage';
import { STORAGE_KEYS } from '../utils';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
}

// Backend response format
interface BackendAuthResponse {
  access_token: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
  };
  token: string;
}

export class AuthService {
  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Login failed');
      }

      const data: BackendAuthResponse = await response.json();
      
      const authResponse: AuthResponse = {
        user: {
          id: 'user', // Backend doesn't return user info in login response
          email: credentials.email,
        },
        token: data.access_token,
      };

      await this.saveAuthData(authResponse);
      return authResponse;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Register new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Registration failed');
      }

      const backendData: BackendAuthResponse = await response.json();
      
      const authResponse: AuthResponse = {
        user: {
          id: 'user',
          email: data.email,
        },
        token: backendData.access_token,
      };

      await this.saveAuthData(authResponse);
      return authResponse;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Login with Google
   */
  async loginWithGoogle(code: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Google login failed');
      }

      const data: BackendAuthResponse = await response.json();
      
      const authResponse: AuthResponse = {
        user: {
          id: 'user',
          email: 'google-user@gmail.com', // Backend doesn't return email
        },
        token: data.access_token,
      };

      await this.saveAuthData(authResponse);
      return authResponse;
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  }

  /**
   * Logout
   */
  async logout(): Promise<void> {
    await this.clearAuthData();
  }

  /**
   * Verify if current token is valid
   */
  async verifyToken(): Promise<boolean> {
    try {
      const token = await this.getAuthToken();
      
      if (!token) {
        return false;
      }

      // Try to call a protected endpoint to verify token
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/subscription/current`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Get auth token from storage
   */
  async getAuthToken(): Promise<string | null> {
    const token = await readFromStorage<string>(STORAGE_KEYS.AUTH_TOKEN);
    return token ?? null;
  }

  /**
   * Get user email from storage
   */
  async getUserEmail(): Promise<string | null> {
    const email = await readFromStorage<string>(STORAGE_KEYS.USER_EMAIL);
    return email ?? null;
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getAuthToken();
    return !!token;
  }

  /**
   * Save auth data to storage
   */
  private async saveAuthData(data: AuthResponse): Promise<void> {
    await writeManyToStorage(
      {
        [STORAGE_KEYS.AUTH_TOKEN]: data.token,
        [STORAGE_KEYS.USER_EMAIL]: data.user.email,
        [STORAGE_KEYS.USER_ID]: data.user.id,
        [STORAGE_KEYS.IS_AUTHENTICATED]: true,
      },
      'local'
    );
  }

  /**
   * Clear auth data from storage
   */
  private async clearAuthData(): Promise<void> {
    await removeFromStorage(
      [
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.USER_EMAIL,
        STORAGE_KEYS.USER_ID,
        STORAGE_KEYS.IS_AUTHENTICATED,
      ],
      'local'
    );
  }
}

export const authService = new AuthService();
