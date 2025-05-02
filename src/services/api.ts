import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://localhost:5000/api/v1';

interface RequestConfig extends RequestInit {
  token?: string;
  params?: Record<string, string>;
}

class ApiService {
  private static instance: ApiService;

  private constructor() {}

  static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  private async getHeaders(config?: RequestConfig): Promise<Headers> {
    const headers = new Headers({
      'Content-Type': 'application/json',
    });

    const token = config?.token || await AsyncStorage.getItem('authToken');
    if (token) {
      headers.append('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  private buildUrl(endpoint: string, params?: Record<string, string>): string {
    const url = new URL(`${API_URL}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }
    return url.toString();
  }

  async get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    const headers = await this.getHeaders(config);
    const url = this.buildUrl(endpoint, config?.params);

    const response = await fetch(url, {
      method: 'GET',
      headers,
      ...config,
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return response.json();
  }

  async post<T>(endpoint: string, data: any, config?: RequestConfig): Promise<T> {
    const headers = await this.getHeaders(config);
    const url = this.buildUrl(endpoint, config?.params);

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
      ...config,
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return response.json();
  }

  async put<T>(endpoint: string, data: any, config?: RequestConfig): Promise<T> {
    const headers = await this.getHeaders(config);
    const url = this.buildUrl(endpoint, config?.params);

    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
      ...config,
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return response.json();
  }

  async patch<T>(endpoint: string, data: any, config?: RequestConfig): Promise<T> {
    const headers = await this.getHeaders(config);
    const url = this.buildUrl(endpoint, config?.params);

    const response = await fetch(url, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
      ...config,
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return response.json();
  }

  async delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    const headers = await this.getHeaders(config);
    const url = this.buildUrl(endpoint, config?.params);

    const response = await fetch(url, {
      method: 'DELETE',
      headers,
      ...config,
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return response.json();
  }
}

export const api = ApiService.getInstance(); 