import { api } from './api';

interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

class AuthService {
  private static instance: AuthService;

  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    return api.post<LoginResponse>('/auth/login', { email, password });
  }

  async register(data: RegisterData): Promise<LoginResponse> {
    return api.post<LoginResponse>('/auth/register', data);
  }

  async getProfile(): Promise<any> {
    return api.get('/auth/profile');
  }

  async updateProfile(data: Partial<RegisterData>): Promise<any> {
    return api.patch('/auth/profile', data);
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<any> {
    return api.post('/auth/change-password', { currentPassword, newPassword });
  }
}

export const authService = AuthService.getInstance(); 