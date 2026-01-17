import apiClient from '@/services/api.client';

/**
 * Professor API Service
 * Gestión de módulos, estudiantes y contenido del profesor
 */

export interface ProfessorModule {
  id: number;
  nombreModulo: string;
  duracionDias: number;
  students?: any[];
  levels?: any[];
}

export interface CreateStudentPayload {
  name: string;
  email: string;
  password: string;
  moduleId: string;
}

export interface CreateLevelPayload {
  tituloNivel: string;
  descripcion?: string;
  orden: number;
}

export interface CreateContentPayload {
  titulo: string;
  tipoContenido: string;
  contenido: string;
  orden: number;
}

export interface CreateModulePayload {
  title: string;
  description: string;
  professorId: string;
}

export const professorApi = {
  /**
   * Crear un nuevo módulo
   */
  async createModule(payload: CreateModulePayload): Promise<any> {
    return apiClient.post<any>('/api/modules', payload);
  },
  /**
   * Obtener los módulos asignados al profesor
   */
  async getModules(professorId: string): Promise<ProfessorModule[]> {
    return apiClient.get<ProfessorModule[]>(`/api/professor/${professorId}/modules`);
  },

  /**
   * Crear un nuevo estudiante y asignarlo a un módulo
   */
  async createStudent(payload: CreateStudentPayload): Promise<any> {
    return apiClient.post<any>('/api/professor/students', payload);
  },

  /**
   * Obtener información de un módulo específico
   */
  async getModule(moduleId: string): Promise<any> {
    return apiClient.get<any>(`/api/modulos/${moduleId}`);
  },

  /**
   * Obtener niveles de un módulo
   */
  async getModuleLevels(moduleId: string): Promise<any[]> {
    return apiClient.get<any[]>(`/api/professor/modules/${moduleId}/levels`);
  },

  /**
   * Crear un nuevo nivel en un módulo
   */
  async createLevel(moduleId: string, payload: CreateLevelPayload): Promise<any> {
    return apiClient.post<any>(`/api/professor/modules/${moduleId}/levels`, payload);
  },

  /**
   * Eliminar un nivel
   */
  async deleteLevel(levelId: number): Promise<void> {
    return apiClient.delete<void>(`/api/professor/levels/${levelId}`);
  },

  /**
   * Crear contenido en un nivel
   */
  async createContent(levelId: number, payload: CreateContentPayload): Promise<any> {
    return apiClient.post<any>(`/api/professor/levels/${levelId}/contents`, payload);
  },

  /**
   * Actualizar contenido
   */
  async updateContent(contentId: number, payload: Partial<CreateContentPayload>): Promise<any> {
    return apiClient.patch<any>(`/api/professor/contents/${contentId}`, payload);
  },

  /**
   * Eliminar contenido
   */
  async deleteContent(contentId: number): Promise<void> {
    return apiClient.delete<void>(`/api/professor/contents/${contentId}`);
  },

  /**
   * Obtener recursos del profesor
   */
  async getResources(): Promise<any[]> {
    return apiClient.get<any[]>('/api/professor/resources');
  },

  /**
   * Subir archivo
   */
  async uploadFile(formData: FormData): Promise<any> {
    // Special case for file upload - use fetch directly
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
    const response = await fetch(`${baseUrl}/api/professor/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Error al subir archivo');
    }

    return response.json();
  },

  // RAG Templates
  async saveRagTemplate(levelId: number, data: any): Promise<any> {
    return apiClient.post(`/api/professor/levels/${levelId}/rag`, data);
  },

  async getRagTemplate(levelId: number): Promise<any> {
    return apiClient.get(`/api/professor/levels/${levelId}/rag`);
  },

  // HA Templates
  async saveHaTemplate(levelId: number, data: any): Promise<any> {
    return apiClient.post(`/api/professor/levels/${levelId}/ha`, data);
  },

  async getHaTemplate(levelId: number): Promise<any> {
    return apiClient.get(`/api/professor/levels/${levelId}/ha`);
  },
};

export default professorApi;
