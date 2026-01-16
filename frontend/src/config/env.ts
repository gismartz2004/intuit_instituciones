/**
 * Environment Configuration
 * Centraliza todas las variables de entorno del proyecto
 */

const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = import.meta.env[key] || defaultValue;

  if (!value) {
    console.warn(`⚠️ Environment variable ${key} is not defined`);
  }

  return value || '';
};

export const env = {
  /**
   * API Base URL - URL del backend
   * @default 'http://localhost:3000'
   */
  API_BASE_URL: getEnvVar('VITE_API_BASE_URL', 'http://localhost:8080'),

  /**
   * Nombre de la aplicación
   * @default 'ARG Academy'
   */
  APP_NAME: getEnvVar('VITE_APP_NAME', 'ARG Academy'),

  /**
   * Ambiente de ejecución
   * @default 'development'
   */
  NODE_ENV: getEnvVar('MODE', 'development'),

  /**
   * Habilitar analytics
   * @default false
   */
  ENABLE_ANALYTICS: getEnvVar('VITE_ENABLE_ANALYTICS', 'false') === 'true',
} as const;

// Validación en desarrollo
if (env.NODE_ENV === 'development') {
  console.log('🔧 Environment Configuration:', {
    API_BASE_URL: env.API_BASE_URL,
    APP_NAME: env.APP_NAME,
    NODE_ENV: env.NODE_ENV,
  });
}

export default env;
