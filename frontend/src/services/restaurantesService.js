import { apiFetch } from './api'

export const restaurantesService = {
  // Obtiene la lista completa de restaurantes
  getAllStores: () => apiFetch('/restaurantes'),

  // GET /api/restaurantes/:restauranteId (Detalle de restaurante)
  getStoreById: (restauranteId) => apiFetch(`/restaurantes/${restauranteId}`),

  // Obtiene los platos de un restaurante específico
  getStoreProducts: (restauranteId) => apiFetch(`/restaurantes/${restauranteId}/platos`),

  // GET /api/restaurantes/:restauranteId/platos/:platoId (Detalle de un plato específico)
  getPlatoById: (restauranteId, platoId) => 
    apiFetch(`/restaurantes/${restauranteId}/platos/${platoId}`),
}