import { apiFetch } from './api'

export const adminService = {
  getStats: async () => {
    return await apiFetch('/dashboard/resumen-semanal')
  }
}