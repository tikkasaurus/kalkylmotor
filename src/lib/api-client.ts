/**
 * API Client wrapper using fetch
 * 
 * A type-safe HTTP client for making API requests.
 * Compatible with TanStack Query and supports all common HTTP methods.
 */

import { tokenProvider } from './tokenProvider'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  status: number
  statusText: string
  data?: unknown

  constructor(
    message: string,
    status: number,
    statusText: string,
    data?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.statusText = statusText
    this.data = data
  }
}

/**
 * Common request options
 */
interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean>
}

/**
 * Build URL with query parameters
 */
function buildUrl(endpoint: string, params?: Record<string, string | number | boolean>): string {
  const url = new URL(`${API_BASE_URL}${endpoint}`)
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value))
    })
  }
  
  return url.toString()
}

/**
 * Process the response and handle errors
 */
async function handleResponse<T>(response: Response): Promise<T> {
  // Handle no-content responses
  if (response.status === 204) {
    return undefined as T
  }

  // Try to parse JSON response
  let data: unknown
  const contentType = response.headers.get('content-type')
  
  if (contentType?.includes('application/json')) {
    data = await response.json()
  } else {
    data = await response.text()
  }

  // Handle error responses
  if (!response.ok) {
    throw new ApiError(
      `API request failed: ${response.statusText}`,
      response.status,
      response.statusText,
      data
    )
  }

  return data as T
}

/**
 * Get default headers for requests
 * Includes MSAL access token if available
 */
async function getDefaultHeaders(): Promise<HeadersInit> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }

  // Get MSAL access token for API calls
  const token = await tokenProvider.getAccessToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  return headers
}

/**
 * Make an HTTP request
 */
async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, headers, ...fetchOptions } = options

  const url = buildUrl(endpoint, params)
  const defaultHeaders = await getDefaultHeaders()

  const response = await fetch(url, {
    ...fetchOptions,
    headers: {
      ...defaultHeaders,
      ...headers,
    },
  })

  return handleResponse<T>(response)
}

/**
 * API Client
 */
export const apiClient = {
  /**
   * GET request
   */
  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return request<T>(endpoint, {
      ...options,
      method: 'GET',
    })
  },

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  },

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  },

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  },

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return request<T>(endpoint, {
      ...options,
      method: 'DELETE',
    })
  },
}

/**
 * Type-safe API client with specific endpoints
 * 
 * Example usage:
 * 
 * const api = {
 *   calculations: {
 *     list: () => apiClient.get<Calculation[]>('/calculations'),
 *     get: (id: number) => apiClient.get<Calculation>(`/calculations/${id}`),
 *     create: (data: CreateCalculationDto) => apiClient.post<Calculation>('/calculations', data),
 *     update: (id: number, data: UpdateCalculationDto) => apiClient.put<Calculation>(`/calculations/${id}`, data),
 *     delete: (id: number) => apiClient.delete(`/calculations/${id}`),
 *   }
 * }
 */
