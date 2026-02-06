import apiClient from '@/services/api.client';

export interface ModuleWithStats {
    id: number;
    nombreModulo: string;
    duracionDias: number;
    fechaCreacion: string;
    levelCount: number;
    studentCount: number;
    professorCount: number;
}

export interface LevelContent {
    id: number;
    nombreNivel: string;
    descripcion: string;
    rag: any[];
    ha: any[];
    pim: any[];
    contents: any[];
    activities: any[];
}

export interface ModuleContent {
    module: any;
    levels: LevelContent[];
}

export interface Assignment {
    assignment: any;
    student: any;
    module: any;
}

export interface StudentPreview {
    nombre: string;
    email: string;
    password: string;
    plan: string;
    emailPadre?: string;
    isValid: boolean;
    errors: Array<{ row: number; field: string; message: string }>;
}

export interface ImportPreview {
    students: StudentPreview[];
    totalRows: number;
    validRows: number;
    invalidRows: number;
    columns: string[];
}

export interface ImportResult {
    success: boolean;
    imported: number;
    skipped: number;
    users: any[];
}

export interface SystemStats {
    totalModules: number;
    totalStudents: number;
    totalProfessors: number;
    totalAssignments: number;
}

export interface Student {
    id: number;
    nombre: string;
    email: string;
    activo: boolean;
}

export const superadminApi = {
    // Get all students in the system
    getSystemStudents: (): Promise<Student[]> => {
        return apiClient.get('/api/superadmin/students');
    },

    // Get all modules with statistics
    getAllModules: (): Promise<ModuleWithStats[]> => {
        return apiClient.get('/api/superadmin/modules');
    },

    // Get complete content of a module (RAG, HA, PIM) - READ ONLY
    getModuleContent: (moduleId: number): Promise<ModuleContent> => {
        return apiClient.get(`/api/superadmin/modules/${moduleId}/content`);
    },

    // Get all assignments
    getAllAssignments: (): Promise<Assignment[]> => {
        return apiClient.get('/api/superadmin/assignments');
    },

    // Bulk assign module to students
    bulkAssignModules: (
        moduleId: number,
        studentIds: number[],
    ): Promise<{ success: boolean; count: number }> => {
        return apiClient.post('/api/superadmin/assignments/bulk', {
            moduleId,
            studentIds,
        });
    },

    // Preview students from Excel (validation only)
    previewStudentsFromExcel: (file: File): Promise<ImportPreview> => {
        const formData = new FormData();
        formData.append('file', file);
        return apiClient.post('/api/superadmin/students/preview', formData);
    },

    // Import students from Excel
    importStudentsFromExcel: (
        file: File,
        onlyValid: boolean = true,
    ): Promise<ImportResult> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('onlyValid', String(onlyValid));
        return apiClient.post('/api/superadmin/students/import', formData);
    },

    // Get students assigned to a specific module
    getModuleAssignments: (moduleId: number): Promise<Student[]> => {
        return apiClient.get(`/api/superadmin/modules/${moduleId}/assignments`);
    },

    // Unassign module
    unassignModule: (moduleId: number, studentId: number): Promise<{ success: boolean }> => {
        return apiClient.post(`/api/superadmin/modules/${moduleId}/assignments/unassign`, {
            studentId,
        });
    },

    // Get system statistics
    getSystemStats: (): Promise<SystemStats> => {
        return apiClient.get('/api/superadmin/stats');
    },
};
