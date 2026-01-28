import apiClient from '@/services/api.client';
import type {
  User,
  Module,
  CreateUserPayload,
  CreateModulePayload,
  AssignModulePayload,
  UpdateUserPayload,
  Premio,
  CreatePremioPayload
} from '../types/admin.types';

/**
 * Admin API Service
 * Gestión de usuarios, módulos y asignaciones
 */

export const adminApi = {
  // ========== USUARIOS ==========

  /**
   * Obtener todos los usuarios del sistema
   */
  async getUsers(): Promise<User[]> {
    return apiClient.get<User[]>('/api/usuarios');
  },

  /**
   * Crear un nuevo usuario
   */
  async createUser(payload: CreateUserPayload): Promise<User> {
    return apiClient.post<User>('/api/usuarios', payload);
  },

  /**
   * Actualizar información de un usuario
   */
  async updateUser(userId: number, payload: UpdateUserPayload): Promise<User> {
    return apiClient.patch<User>(`/api/usuarios/${userId}`, payload);
  },

  /**
   * Eliminar un usuario del sistema
   */
  async deleteUser(userId: number): Promise<void> {
    return apiClient.delete<void>(`/api/usuarios/${userId}`);
  },

  // ========== MÓDULOS ==========

  /**
   * Obtener todos los módulos del sistema
   */
  async getModules(): Promise<Module[]> {
    return apiClient.get<Module[]>('/api/modulos');
  },

  /**
   * Crear un nuevo módulo educativo
   */
  async createModule(payload: CreateModulePayload): Promise<Module> {
    return apiClient.post<Module>('/api/modulos', payload);
  },

  /**
   * Eliminar un módulo del sistema
   */
  async deleteModule(moduleId: number): Promise<void> {
    return apiClient.delete<void>(`/api/modulos/${moduleId}`);
  },

  // ========== ASIGNACIONES ==========

  /**
   * Asignar un módulo a un estudiante o profesor
   */
  async assignModule(payload: AssignModulePayload): Promise<void> {
    return apiClient.post<void>('/api/modulos/asignar', payload);
  },

  // ========== PREMIOS ==========

  /**
   * Obtener todos los premios
   */
  async getPrizes(): Promise<Premio[]> {
    return apiClient.get<Premio[]>('/api/premios');
  },

  /**
   * Crear un nuevo premio
   */
  async createPrize(payload: CreatePremioPayload): Promise<Premio> {
    return apiClient.post<Premio>('/api/premios', payload);
  },

  /**
   * Actualizar un premio
   */
  async updatePrize(prizeId: number, payload: Partial<CreatePremioPayload>): Promise<Premio> {
    return apiClient.patch<Premio>(`/api/premios/${prizeId}`, payload);
  },

  /**
   * Eliminar un premio
   */
  async deletePrize(prizeId: number): Promise<void> {
    return apiClient.delete<void>(`/api/premios/${prizeId}`);
  },
};

export default adminApi;
