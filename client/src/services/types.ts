export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
  error?: string;
}

// Auth types
export interface AuthResponse {
  authenticated: boolean;
  user?: UserData;
}

export interface UserData {
  id: number;
  email: string;
  firstName: string;
}

// Breeder types
export interface BreederData {
  firstName: string;
  lastName: string;
  city: string;
  state: string;
  experienceYears: number;
  story: string;
  phone: string;
  email: string;
  profile_image?: string;
}

// About types
export interface AboutUsData {
  breeding_standards: string[];
  services_provided: string[];
  what_we_require: string[];
}
