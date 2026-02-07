import apiClient from '@/services/api.client';
import type {
  User,
  Module,
  CreateUserPayload,
  CreateModulePayload,
  AssignModulePayload,
  UpdateUserPayload,
  Premio,
  CreatePremioPayload,
  ModuleWithStats,
  SystemStats,
  ImportPreview,
  Plan
} from '../types/admin.types';

/**
 * Admin API Service
 * Gestión centralizada de usuarios, módulos, asignaciones y estadísticas
 */
export const adminApi = {
  // ========== USUARIOS ==========

  async getUsers(): Promise<User[]> {
    return apiClient.get<User[]>('/api/usuarios');
  },

  async getSystemStudents(): Promise<User[]> {
    return apiClient.get<User[]>('/api/admin/students');
  },

  async getSystemProfessors(): Promise<User[]> {
    return apiClient.get<User[]>('/api/admin/professors');
  },

  async createUser(payload: CreateUserPayload): Promise<User> {
    return apiClient.post<User>('/api/usuarios', payload);
  },

  async updateUser(userId: number, payload: UpdateUserPayload): Promise<User> {
    return apiClient.patch<User>(`/api/usuarios/${userId}`, payload);
  },

  async deleteUser(userId: number): Promise<void> {
    return apiClient.delete<void>(`/api/usuarios/${userId}`);
  },

  async resetUser(userId: number): Promise<{ success: boolean; message: string }> {
    return apiClient.post(`/api/admin/users/${userId}/reset`, {});
  },

  async bulkResetUsers(userIds: number[]): Promise<{ success: boolean; message: string; successful: number; failed: number }> {
    return apiClient.post('/api/admin/users/bulk-reset', { userIds });
  },

  // ========== MÓDULOS ==========

  async getModules(): Promise<Module[]> {
    return apiClient.get<Module[]>('/api/modulos');
  },

  async getAllModulesWithStats(): Promise<ModuleWithStats[]> {
    return apiClient.get<ModuleWithStats[]>('/api/admin/modules');
  },

  async getModuleContent(moduleId: number): Promise<any> {
    return apiClient.get(`/api/admin/modules/${moduleId}/content`);
  },

  async createModule(payload: CreateModulePayload): Promise<Module> {
    return apiClient.post<Module>('/api/modulos', payload);
  },

  async deleteModule(moduleId: number): Promise<void> {
    return apiClient.delete<void>(`/api/modulos/${moduleId}`);
  },

  // ========== ASIGNACIONES ==========

  async getAllAssignments(): Promise<any[]> {
    return apiClient.get('/api/admin/assignments');
  },

  async assignModule(payload: AssignModulePayload): Promise<void> {
    return apiClient.post<void>('/api/modulos/asignar', payload);
  },

  async bulkAssignModules(moduleId: number, studentIds: number[], professorId?: number): Promise<{ success: boolean; count: number }> {
    return apiClient.post('/api/admin/assignments/bulk', { moduleId, studentIds, professorId });
  },

  async getModuleAssignments(moduleId: number): Promise<User[]> {
    return apiClient.get<User[]>(`/api/admin/modules/${moduleId}/assignments`);
  },

  async assignProfessorToModule(moduleId: number, professorId: number): Promise<void> {
    return apiClient.post(`/api/admin/modules/${moduleId}/professor`, { professorId });
  },

  async unassignModule(moduleId: number, studentId: number): Promise<{ success: boolean }> {
    return apiClient.post(`/api/admin/modules/${moduleId}/assignments/unassign`, { studentId });
  },

  // ========== ESTADÍSTICAS Y PLANES ==========

  async getSystemStats(): Promise<SystemStats> {
    return apiClient.get('/api/admin/stats');
  },

  async getPlanes(): Promise<Plan[]> {
    return apiClient.get('/api/admin/planes');
  },

  // ========== EXCEL IMPORT ==========

  async previewStudentsFromExcel(file: File): Promise<ImportPreview> {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/api/admin/students/preview', formData);
  },

  async importStudentsFromExcel(file: File, onlyValid: boolean = true): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('onlyValid', String(onlyValid));
    return apiClient.post('/api/admin/students/import', formData);
  },

  // ========== PREMIOS ==========

  async getPrizes(): Promise<Premio[]> {
    return apiClient.get<Premio[]>('/api/premios');
  },

  async createPrize(payload: CreatePremioPayload): Promise<Premio> {
    return apiClient.post<Premio>('/api/premios', payload);
  },

  async updatePrize(prizeId: number, payload: Partial<CreatePremioPayload>): Promise<Premio> {
    return apiClient.patch<Premio>(`/api/premios/${prizeId}`, payload);
  },

  async deletePrize(prizeId: number): Promise<void> {
    return apiClient.delete<void>(`/api/premios/${prizeId}`);
  },
};

export default adminApi;
