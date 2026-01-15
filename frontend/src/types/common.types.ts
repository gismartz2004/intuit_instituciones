/**
 * Common Types
 * Tipos compartidos en toda la aplicación
 */

export interface User {
  id: string | number;
  name: string;
  role: "student" | "admin" | "professor";
  plan?: string;
  avatar?: string;
  onboardingCompleted?: boolean;
}

export type UserRole = "student" | "admin" | "professor";

export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}
