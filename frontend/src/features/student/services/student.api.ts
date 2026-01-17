import apiClient from '@/services/api.client';

/**
 * Student API Service
 * Gestión de módulos, progreso y contenido del estudiante
 */

export interface StudentModule {
  id: number;
  nombreModulo: string;
  duracionDias: number;
  levels?: StudentLevel[];
  zoneIndex?: number;
}

export interface StudentLevel {
  id: number;
  orden: number;
  titulo: string;
  descripcion: string;
  type?: string;
}

export interface StudentProgress {
  totalPoints: number;
  completedLevels: number;
  achievements: string[];
}

export interface LevelContent {
  id: number;
  titulo: string;
  tipoContenido: string;
  contenido: string;
  orden: number;
}

export const studentApi = {
  /**
   * Obtener los módulos asignados al estudiante
   */
  async getModules(studentId: string): Promise<StudentModule[]> {
    return apiClient.get<StudentModule[]>(`/api/student/${studentId}/modules`);
  },

  /**
   * Obtener el progreso general del estudiante
   */
  async getProgress(studentId: string): Promise<StudentProgress> {
    return apiClient.get<StudentProgress>(`/api/student/${studentId}/progress`);
  },

  /**
   * Obtener el progreso de un módulo específico
   */
  async getModuleProgress(studentId: string, moduleId: number): Promise<any[]> {
    return apiClient.get<any[]>(`/api/student/${studentId}/module/${moduleId}/progress`);
  },

  /**
   * Obtener el contenido de un nivel específico
   */
  async getLevelContents(levelId: string): Promise<LevelContent[]> {
    return apiClient.get<LevelContent[]>(`/api/student/level/${levelId}/contents`);
  },

  /**
   * Obtener información de usuario
   */
  async getUserInfo(userId: string): Promise<any> {
    return apiClient.get<any>(`/api/usuarios/${userId}`);
  },

  /**
   * Obtener plantilla RAG de un nivel
   */
  async getRagTemplate(levelId: number): Promise<any> {
    return apiClient.get<any>(`/api/professor/levels/${levelId}/rag`);
  },

  /**
   * Obtener plantilla HA de un nivel
   */
  async getHaTemplate(levelId: number): Promise<any> {
    return apiClient.get<any>(`/api/professor/levels/${levelId}/ha`);
  },
};

export default studentApi;
