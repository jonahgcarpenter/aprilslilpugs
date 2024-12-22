import { get, put } from './api';
import type { ApiResponse, BreederData } from './types';

export const getProfile = () => get<ApiResponse<BreederData>>('/breeder/profile');

export const updateProfile = (data: Partial<BreederData>, profileImage?: File) => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) {
      formData.append(key, value.toString());
    }
  });
  if (profileImage) {
    formData.append('profile_image', profileImage);
  }
  return put<ApiResponse<void>>('/breeder/profile', formData);
};
