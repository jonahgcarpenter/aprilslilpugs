import { get, post } from './api';
import type { ApiResponse, AboutUsData } from './types';

export const getAboutInfo = () => 
  get<ApiResponse<AboutUsData>>('/aboutus/');

export const updateAboutInfo = (data: AboutUsData) => 
  post<ApiResponse<void>>('/aboutus/', data);
