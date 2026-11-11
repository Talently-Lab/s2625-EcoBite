const BASE_URL = import.meta.env.VITE_API_URL || 'https://s2625-ecobite.onrender.com/api'

/**
 * @param {string} endpoint 
 * @param {object} options 
 */
export async function apiFetch(endpoint, options = {}) {
  const defaultHeaders = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }

  // Buscamos con ambas claves para evitar problemas de sesión
  const token = localStorage.getItem('ecobite_token') || localStorage.getItem('token')
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`
  }

  const config = {
    method: options.method || 'GET',
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    ...options,
  }

  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    config.body = JSON.stringify(options.body)
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config)

    if (response.status === 204) {
      return { success: true }
    }

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      const error = new Error(data?.message || `Error ${response.status}: ${response.statusText}`)
      error.status = response.status
      error.data = data
      throw error
    }

    return data
  } catch (error) {
    console.error(`[API Error] ${config.method} ${endpoint}:`, error.message)
    throw error
  }
}