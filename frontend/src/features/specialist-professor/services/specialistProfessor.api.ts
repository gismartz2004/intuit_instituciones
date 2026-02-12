import apiClient from '@/services/api.client';

export interface SpecialistModule {
    id: number;
    nombreModulo: string;
    duracionDias: number;
    categoria: string;
    profesorId: number;
}

export interface SpecialistLevel {
    id: number;
    moduloId: number;
    tituloNivel: string;
    orden: number;
}

export const specialistProfessorApi = {
    getModules: async (professorId: number): Promise<SpecialistModule[]> => {
        return apiClient.get(`/api/specialist-professor/modules/${professorId}`);
    },

    createModule: async (data: { nombreModulo: string; duracionDias: number; profesorId: number; especializacion?: string }): Promise<SpecialistModule> => {
        return apiClient.post('/api/specialist-professor/modules', data);
    },

    getLevels: async (moduleId: number): Promise<SpecialistLevel[]> => {
        return apiClient.get(`/api/specialist-professor/modules/${moduleId}/levels`);
    },

    createLevel: async (moduleId: number, data: { tituloNivel: string; orden: number }): Promise<SpecialistLevel> => {
        return apiClient.post(`/api/specialist-professor/modules/${moduleId}/levels`, data);
    },

    deleteLevel: async (moduleId: number, levelId: number): Promise<any> => {
        return apiClient.delete(`/api/specialist-professor/modules/${moduleId}/levels/${levelId}`);
    },

    // BD Templates
    getBdTemplate: async (levelId: number): Promise<any> => {
        return apiClient.get(`/api/specialist-professor/levels/${levelId}/bd`);
    },

    saveBdTemplate: async (levelId: number, data: any): Promise<any> => {
        return apiClient.post(`/api/specialist-professor/levels/${levelId}/bd`, data);
    },

    // IT Templates
    getItTemplate: async (levelId: number): Promise<any> => {
        return apiClient.get(`/api/specialist-professor/levels/${levelId}/it`);
    },

    saveItTemplate: async (levelId: number, data: any): Promise<any> => {
        return apiClient.post(`/api/specialist-professor/levels/${levelId}/it`, data);
    },

    // PIC Templates
    getPicTemplate: async (levelId: number): Promise<any> => {
        return apiClient.get(`/api/specialist-professor/levels/${levelId}/pic`);
    },

    savePicTemplate: async (levelId: number, data: any): Promise<any> => {
        return apiClient.post(`/api/specialist-professor/levels/${levelId}/pic`, data);
    }
};

export default specialistProfessorApi;
