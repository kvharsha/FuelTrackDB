import apiClient from './axios';

export interface LoginResponse {
  token: string;
  email: string;
  first_name: string;
  role: 'user' | 'admin';
}

export interface RegisterData {
  email: string;
  full_name: string;
  password: string;
  password_confirm: string;
  phone?: string;
  username?: string;
  gender?: string;
  age?: number;
  exact_home_address?: string;
}

export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login/', { email, password });
    return response.data;
  },

  register: async (data: RegisterData): Promise<{ message: string }> => {
    const response = await apiClient.post('/auth/register/', data);
    return response.data;
  },

  checkEmail: async (email: string): Promise<{ available: boolean; message: string }> => {
    const response = await apiClient.post('/auth/check-email/', { email });
    return response.data;
  },

  checkUsername: async (username: string): Promise<{ available: boolean; message: string }> => {
    const response = await apiClient.post('/auth/check-username/', { username });
    return response.data;
  },
};

