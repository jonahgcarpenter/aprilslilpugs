import { get, post } from './api';
import type { ApiResponse, AuthResponse } from './types';

interface RegistrationData {
  email: string;
  password: string;
  userDetail: {
    firstName: string;
    lastName: string;
    // Add any other user details needed
  };
  profileImage?: File;
}

export const login = async (email: string, password: string) => {
  const response = await post<ApiResponse<AuthResponse>>('/auth/login', { email, password });
  if (response.status === 'error') {
    throw new Error(response.message || 'Login failed');
  }
  return response;
};

export const logout = async () => {
  const response = await post<ApiResponse<void>>('/auth/logout');
  if (response.status === 'error') {
    throw new Error(response.message || 'Logout failed');
  }
  return response;
};

export const checkSession = async () => {
  const response = await get<ApiResponse<AuthResponse>>('/auth/session');
  if (response.status === 'error') {
    throw new Error(response.message || 'Session check failed');
  }
  return response;
};

export const register = async (data: RegistrationData) => {
  const formData = new FormData();
  formData.append('email', data.email);
  formData.append('password', data.password);
  formData.append('userDetail', JSON.stringify(data.userDetail));
  if (data.profileImage) {
    formData.append('profileImage', data.profileImage);
  }
  return post<ApiResponse<void>>('/auth/register', formData);
};

// Export all functions as named exports
export const auth = {
  login,
  logout,
  checkSession,
  register
};

export default auth;
