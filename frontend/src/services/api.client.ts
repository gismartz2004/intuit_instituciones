import env from '@/config/env';

/**
 * Cliente HTTP base para todas las llamadas a la API
 */

type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number>;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    method: HTTPMethod = 'GET',
    options: RequestOptions = {}
  ): Promise<T> {
    const { params, body, ...fetchOptions } = options;

    // Construir URL con query params si existen
    let url = `${this.baseURL}${endpoint}`;
    if (params) {
      const queryString = new URLSearchParams(
        Object.entries(params).map(([key, value]) => [key, String(value)])
      ).toString();
      url += `?${queryString}`;
    }

    const headers: Record<string, string> = { ...fetchOptions.headers as any };

    // Si el body no es FormData, ponemos el content-type por defecto
    if (!(body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const config: RequestInit = {
      method,
      headers,
      body,
      ...fetchOptions,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }

      // Si no hay contenido, retornar respuesta vacía
      if (response.status === 204) {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      console.error(`API Request Error [${method} ${endpoint}]:`, error);
      throw error;
    }
  }

  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, 'GET', options);
  }

  async post<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    const processedBody = body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined);
    return this.request<T>(endpoint, 'POST', {
      ...options,
      body: processedBody as any,
    });
  }

  async put<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    const processedBody = body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined);
    return this.request<T>(endpoint, 'PUT', {
      ...options,
      body: processedBody as any,
    });
  }

  async patch<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    const processedBody = body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined);
    return this.request<T>(endpoint, 'PATCH', {
      ...options,
      body: processedBody as any,
    });
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, 'DELETE', options);
  }
}

// Instancia singleton del cliente API
export const apiClient = new ApiClient(env.API_BASE_URL);

export default apiClient;
