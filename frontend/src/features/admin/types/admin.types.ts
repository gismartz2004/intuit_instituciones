export interface User {
  id: number;
  nombre: string;
  email: string;
  roleId: number;
  planId: number;
  activo: boolean;
  emailPadre?: string;
  modules?: Module[];
  profesorId?: number;
  fechaAsignacion?: string;
  identificacion?: string;
  fechaNacimiento?: string;
  edad?: number;
  institucion?: string;
  curso?: string;
}

export interface Module {
  id: number;
  nombreModulo: string;
  duracionDias: number;
  professor?: string;
  studentsCount?: number;
  status?: string;
  students?: User[];
  professors?: User[];
}

export interface CreateUserPayload {
  nombre: string;
  email: string;
  password: string;
  roleId: number;
  planId: number;
  activo: boolean;
  emailPadre?: string;
}

export interface CreateModulePayload {
  nombreModulo: string;
  duracionDias: number;
}

export interface AssignModulePayload {
  moduloId: number;
  estudianteId?: number;
  profesorId?: number;
}

export interface UpdateUserPayload {
  nombre?: string;
  email?: string;
  password?: string;
  roleId?: number;
  planId?: number;
  activo?: boolean;
  emailPadre?: string;
}

export interface Premio {
  id: number;
  nombre: string;
  descripcion: string;
  costoPuntos: number;
  imagenUrl?: string;
  stock?: number;
  activo: boolean;
  fechaCreacion: string;
}

export interface CreatePremioPayload {
  nombre: string;
  descripcion: string;
  costoPuntos: number;
  imagenUrl?: string;
  stock?: number;
}

export interface ModuleWithStats extends Module {
  levelCount: number;
  studentCount: number;
  professorCount: number;
}

export interface SystemStats {
  totalModules: number;
  totalStudents: number;
  totalProfessors: number;
  totalAssignments: number;
}

export interface Assignment {
  student: {
    id: number;
    nombre: string;
    email: string;
  };
  module: {
    id: number;
    nombreModulo: string;
  };
  assignment: {
    id: number;
    estudianteId: number;
    moduloId: number;
    fechaAsignacion: string;
  };
}

export interface ImportPreview {
  students: any[];
  totalRows: number;
  validRows: number;
  invalidRows: number;
  columns: string[];
}

export interface ModuleContent {
  module: Module;
  levels: any[];
}

export interface Plan {
  id: number;
  nombrePlan: string;
  precio?: string;
}

export const ROLE_MAP: Record<number, string> = {
  1: "Admin",
  2: "Profesor",
  3: "Estudiante"
};

export const PLAN_MAP: Record<number, string> = {
  1: "Básico",
  2: "Digital",
  3: "Pro"
};
