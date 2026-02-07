import apiClient from '@/services/api.client';

/**
 * Auth API Service
 * Gestión de autenticación y onboarding
 */

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: number;
    nombre: string;
    email: string;
    roleId: number;
    planId: number;
    avatar?: string;
    onboardingCompleted?: boolean;
  };
  access_token: string;
}

export interface UpdateUserPayload {
  avatar?: string;
  onboardingCompleted?: boolean;
  nombrePadre?: string;
  emailPadre?: string;
  celularPadre?: string;
  trabajoPadre?: string;
}

export const authApi = {
  /**
   * Iniciar sesión
   */
  async login(payload: LoginPayload): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>('/api/auth/login', payload);
  },

  /**
   * Actualizar información de usuario (avatar, onboarding)
   */
  async updateUser(userId: string, payload: UpdateUserPayload): Promise<any> {
    return apiClient.patch<any>(`/api/usuarios/${userId}`, payload);
  },

  /**
   * Obtener información de usuario
   */
  async getUserInfo(userId: string): Promise<any> {
    return apiClient.get<any>(`/api/usuarios/${userId}`);
  },
};

export default authApi;
