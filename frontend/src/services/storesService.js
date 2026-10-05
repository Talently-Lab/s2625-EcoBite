import { apiFetch } from './api'

export const storesService = {
  // Obtener la lista de locales sustentables
  getAllStores: async (params = {}) => {
    const query = new URLSearchParams(params).toString()
    const endpoint = query ? `/stores?${query}` : '/stores'
    return await apiFetch(endpoint)
  },

  // Obtener el detalle de un local por ID
  getStoreById: async (id) => {
    return await apiFetch(`/stores/${id}`)
  },

  // Obtener productos de un restaurante específico
  getStoreProducts: async (storeId) => {
    return await apiFetch(`/stores/${storeId}/products`)
  }
}