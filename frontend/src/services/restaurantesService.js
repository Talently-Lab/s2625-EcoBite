import { apiFetch } from './api'

// Función auxiliar para asegurarnos de que id, nombre e imagen siempre existan
const normalizarRestaurante = (item) => {
  if (!item) return null
  return {
    ...item,
    id: item.id || item._id,
    nombre: item.nombre || item.name || '',
    categoria: item.categoria || item.category || '',
    imagen: item.imagenUrl || item.imagen || item.urlImagen || item.img || item.image || '',
    calificacion: item.calificacion || item.rating || '4.6',
    tiempoEnvio: item.tiempoEnvio || item.time || '20-30 min'
  }
}

const normalizarPlato = (item) => {
  if (!item) return null
  return {
    ...item,
    id: item.id || item._id,
    nombre: item.nombre || item.name || '',
    descripcion: item.descripcion || item.description || '',
    precio: item.precio || item.price || 0,
    imagen: item.imagenUrl || item.imagen || item.urlImagen || item.img || item.image || ''
  }
}

export const restaurantesService = {
  getAllStores: async (params = {}) => {
    const query = new URLSearchParams(params).toString()
    const endpoint = query ? `/restaurantes?${query}` : '/restaurantes'
    const respuesta = await apiFetch(endpoint)
    const lista = Array.isArray(respuesta) ? respuesta : (respuesta?.data || [])
    return lista.map(normalizarRestaurante)
  },

  getStoreById: async (id) => {
    const respuesta = await apiFetch(`/restaurantes/${id}`)
    const item = respuesta?.data || respuesta
    return normalizarRestaurante(item)
  },

  getStoreProducts: async (storeId) => {
    // CORRECCIÓN CLAVE: Apunta exactamente a la ruta del backend /restaurantes/:id/platos
    const respuesta = await apiFetch(`/restaurantes/${storeId}/platos`)
    const lista = Array.isArray(respuesta) ? respuesta : (respuesta?.data || [])
    return lista.map(normalizarPlato)
  }
}