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

  /**
   * Subir evidencia (archivo general)
   */
  async uploadEvidence(file: File): Promise<{ url: string; filename: string; mimetype: string }> {
    const formData = new FormData();
    formData.append('file', file);
    // Note: apiClient might automatically set Content-Type for FormData, but standard fetch needs it removed to let browser set boundary.
    // If apiClient is a wrapper (likely axios or custom fetch), we need to ensure correct handling.
    // Assuming standard fetch wrapper where we can pass body directly.
    return apiClient.post<{ url: string; filename: string; mimetype: string }>('/api/student/upload', formData);
  },

  /**
   * Registrar progreso RAG (con entregable)
   */
  async submitRagProgress(data: { studentId: number; plantillaRagId: number; pasoIndice: number; archivoUrl: string; tipoArchivo: string }) {
    return apiClient.post('/api/student/rag/submit', data);
  },

  /**
   * Registrar entrega HA
   */
  async submitHaEvidence(data: { studentId: number; plantillaHaId: number; archivosUrls: string[]; comentarioEstudiante: string }) {
    return apiClient.post('/api/student/ha/submit', data);
  },
};

export default studentApi;
