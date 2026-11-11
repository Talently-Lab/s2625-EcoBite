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
            // Adjuntamos el storeId a cada plato para conservar la relación
            const platosNormalizados = platosList.map(p => normalizarPlato({ ...p, storeId }))
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
    try {
      // Intentamos primero la ruta directa por si el backend la soporta en el futuro
      const response = await apiFetch(`/platos/${id}`)
      const item = response?.data || response
      return normalizarPlato(item)
    } catch (error) {
      // Fallback: como los platos están anidados por restaurante, 
      // los buscamos a través de los productos destacados de la API
      console.warn(`Ruta directa /platos/${id} no disponible, buscando en los locales...`)
      const allPlatos = await productsService.getFeaturedProducts()
      const found = allPlatos.find(p => p.id === id || p._id === id)
      
      if (found) {
        return found
      }
      throw new Error('Producto no encontrado en el servidor.')
    }
  }
}