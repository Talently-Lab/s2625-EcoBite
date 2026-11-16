const rawUrl = import.meta.env.VITE_API_URL || 'https://s2625-ecobite.onrender.com'
const BASE_URL = rawUrl.endsWith('/api') ? rawUrl.slice(0, -4) : rawUrl

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

  // Normalizamos el endpoint para asegurar que no duplique '/api' y mantenga la barra correcta
  const cleanEndpoint = endpoint.startsWith('/api') ? endpoint.slice(4) : endpoint
  const finalEndpoint = cleanEndpoint.startsWith('/') ? cleanEndpoint : `/${cleanEndpoint}`
  
  const fullUrl = `${BASE_URL}/api${finalEndpoint}`

  try {
    const response = await fetch(fullUrl, config)

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
    console.error(`[API Error] ${config.method} ${fullUrl}:`, error.message)
    throw error
  }
}