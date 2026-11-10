import { apiFetch } from './api'
import { restaurantesService } from './restaurantesService'

// Función auxiliar para normalizar los campos del plato al español
const normalizarPlato = (item) => {
  if (!item) return null
  return {
    ...item,
    id: item.id || item._id,
    nombre: item.nombre || item.name || '',
    descripcion: item.descripcion || item.description || '',
    precio: Number(item.precio || item.price || 0),
    imagen: item.imagen || item.urlImagen || item.img || item.image || '',
    categoria: item.categoria || item.category || ''
  }
}

export const productsService = {
  getFeaturedProducts: async () => {
    try {
      const storesList = await restaurantesService.getAllStores()
      
      if (!Array.isArray(storesList) || storesList.length === 0) return []

      let allPlatos = []
      for (const store of storesList) {
        const storeId = store.id || store._id
        if (!storeId) continue

        try {
          const response = await apiFetch(`/restaurantes/${storeId}/platos`)
          const platosList = Array.isArray(response) 
            ? response 
            : (response?.data || response?.platos || [])
          
          if (platosList.length > 0) {
            const platosNormalizados = platosList.map(normalizarPlato)
            allPlatos = [...allPlatos, ...platosNormalizados]
          }
        } catch {
          continue
        }
      }

      return allPlatos
    } catch (error) {
      console.error('Error al obtener platos destacados:', error)
      return []
    }
  },

  getProductById: async (id) => {
    const response = await apiFetch(`/platos/${id}`)
    const item = response?.data || response
    return normalizarPlato(item)
  }
}