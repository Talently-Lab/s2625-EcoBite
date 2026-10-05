import { apiFetch } from './api'

export const productsService = {
  // Obtener platos destacados
  getFeaturedProducts: async () => {
    return await apiFetch('/products/featured')
  },

  // Obtener el detalle de un producto por ID
  getProductById: async (id) => {
    return await apiFetch(`/products/${id}`)
  }
}