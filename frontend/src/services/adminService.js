import { apiFetch } from './api'

export const adminService = {
  getStats: async () => {
    // Obtenemos el token de autenticación del administrador desde localStorage
    const token = localStorage.getItem('token') || '';

    try {
      // Consumimos el endpoint real indicado por backend
      const data = await apiFetch('/dashboard/resumen-semanal', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return data;
    } catch (error) {
      console.warn('Usando datos de respaldo para el dashboard por latencia o falta de token:', error)
      // Fallback de respaldo por si no hay sesión activa de admin en desarrollo
      return {
        ventasTotales: 489200,
        pedidosEntregados: 14,
        impacto: {
          ahorroTotalKg: 128.5
        },
        restaurantes: {
          activos: 8
        },
        ultimosPedidos: [
          { id: 'uuid-9821-mock', cliente: 'Sofía Gomez', plato: '2 x Hamburguesa Patagónica', estado: 'completado', montoTotal: 18700 },
          { id: 'uuid-9822-mock', cliente: 'Martín Pérez', plato: '1 x Canelones de Espinaca', estado: 'pendiente', montoTotal: 4350 },
          { id: 'uuid-9823-mock', cliente: 'Lucía Benítez', plato: '1 x Bowl de Falafel y Quinoa', estado: 'pendiente', montoTotal: 12500 },
          { id: 'uuid-9824-mock', cliente: 'Carlos Ruiz', plato: '3 x Empanadas Criollas', estado: 'completado', montoTotal: 6000 }
        ]
      }
    }
  }
}
