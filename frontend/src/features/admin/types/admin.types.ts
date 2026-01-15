export interface User {
  id: number;
  nombre: string;
  email: string;
  roleId: number;
  planId: number;
  activo: boolean;
  modules?: Module[];
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
  planId?: number;
  activo?: boolean;
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
