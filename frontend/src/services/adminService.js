import { apiFetch } from './api'

export const adminService = {
  getStats: async () => {
    try {
      return await apiFetch('/dashboard/stats')
    } catch (error) {
      console.warn('Usando datos de respaldo para el dashboard por latencia de API:', error)
      // Fallback por si el endpoint requiere un token de admin o está en desarrollo
      return {
        totalVentas: 489200,
        pedidosActivos: 14,
        co2AhorradosKg: 128.5,
        restaurantesAfiliados: 8,
        pedidosRecientes: [
          { id: 'ORD-9821', cliente: 'Sofía Gomez', plato: 'Hamburguesa Patagónica', estado: 'Completado', total: 18700 },
          { id: 'ORD-9822', cliente: 'Martín Pérez', plato: 'Canelones de Espinaca', estado: 'En proceso', total: 4350 },
          { id: 'ORD-9823', cliente: 'Lucía Benítez', plato: 'Bowl de Falafel y Quinoa', estado: 'Pendiente', total: 12500 },
          { id: 'ORD-9824', cliente: 'Carlos Ruiz', plato: 'Empanadas Criollas', estado: 'Completado', total: 6000 }
        ]
      }
    }
  }
}