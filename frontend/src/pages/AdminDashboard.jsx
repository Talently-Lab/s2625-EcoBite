import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { adminService } from '../services/adminService'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  // Simulación de contador animado para métricas clave (Efecto WOW para portfolio)
  const [co2Animado, setCo2Animado] = useState(0)

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true)
        const data = await adminService.getStats()
        setStats(data)

        // Animación de conteo para CO2
        const targetCo2 = data?.co2AhorradosKg || 128.5
        let current = 0
        const step = targetCo2 / 30
        const timer = setInterval(() => {
          current += step
          if (current >= targetCo2) {
            setCo2Animado(targetCo2)
            clearInterval(timer)
          } else {
            setCo2Animado(Number(current.toFixed(1)))
          }
        }, 30)

      } catch (err) {
        console.error('Error al cargar dashboard:', err)
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] flex flex-col items-center justify-center p-4">
        <div className="w-8 h-8 border-4 border-[#3D2314] border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs text-gray-600 font-medium animate-pulse">Cargando panel de administración...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#3D2314] font-sans pb-16">
      
      {/* Header Admin */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-20 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="w-8 h-8 flex items-center justify-center bg-gray-50 border border-gray-200 rounded-full text-xs font-bold hover:bg-gray-100 transition">
              ←
            </Link>
            <span className="font-black text-base text-[#3A2E2B]">EcoBite <span className="text-xs font-normal px-2 py-0.5 bg-amber-50 text-amber-800 rounded-full border border-amber-200">Admin Panel</span></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-600 hidden sm:inline">Admin General</span>
            <div className="w-8 h-8 rounded-full bg-[#3D2314] text-white flex items-center justify-center text-xs font-bold">
              A
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        
        {/* Título de sección */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-xl font-black text-[#2D2320]">Torre de Control</h1>
            <p className="text-xs text-gray-500">Métricas en tiempo real del impacto y operaciones de EcoBite.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[11px] font-semibold text-emerald-700">Sistema Conectado</span>
          </div>
        </div>

        {/* Tarjetas de KPI (Estilo Stat Dashboard) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* KPI 1 */}
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-2xs space-y-2 relative overflow-hidden">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Ventas Totales</span>
              <span className="p-2 bg-emerald-50 text-emerald-700 rounded-2xl text-sm">💰</span>
            </div>
            <div className="space-y-0.5">
              <h2 className="text-2xl font-black text-[#2D2320]">${stats?.totalVentas?.toLocaleString() || '489,200'}</h2>
              <p className="text-[11px] text-emerald-600 font-semibold">+12.4% vs mes anterior</p>
            </div>
          </div>

          {/* KPI 2 */}
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-2xs space-y-2 relative overflow-hidden">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">CO₂ Ahorrado</span>
              <span className="p-2 bg-amber-50 text-amber-700 rounded-2xl text-sm">🌱</span>
            </div>
            <div className="space-y-0.5">
              <h2 className="text-2xl font-black text-[#2D2320]">{co2Animado} <span className="text-xs font-bold text-gray-500">kg</span></h2>
              <p className="text-[11px] text-gray-400">Impacto ecológico positivo</p>
            </div>
          </div>

          {/* KPI 3 */}
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-2xs space-y-2 relative overflow-hidden">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Pedidos Activos</span>
              <span className="p-2 bg-blue-50 text-blue-700 rounded-2xl text-sm">🛍️</span>
            </div>
            <div className="space-y-0.5">
              <h2 className="text-2xl font-black text-[#2D2320]">{stats?.pedidosActivos || 14}</h2>
              <p className="text-[11px] text-blue-600 font-semibold">En cocina y camino</p>
            </div>
          </div>

          {/* KPI 4 */}
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-2xs space-y-2 relative overflow-hidden">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Locales Aliados</span>
              <span className="p-2 bg-purple-50 text-purple-700 rounded-2xl text-sm">🏪</span>
            </div>
            <div className="space-y-0.5">
              <h2 className="text-2xl font-black text-[#2D2320]">{stats?.restaurantesAfiliados || 8}</h2>
              <p className="text-[11px] text-purple-600 font-semibold">Activos en la red</p>
            </div>
          </div>

        </div>

        {/* Tabla de Pedidos */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-2xs overflow-hidden space-y-4 p-5 sm:p-6">
          <div className="flex justify-between items-center border-b border-gray-100 pb-4">
            <div>
              <h2 className="font-bold text-sm sm:text-base text-[#2D2320]">Últimos Pedidos</h2>
              <p className="text-xs text-gray-400">Monitoreo de órdenes en curso y completadas.</p>
            </div>
            <span className="text-xs font-bold text-[#3D2314] bg-gray-50 border border-gray-200 px-3 py-1 rounded-xl">
              Tiempo real
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 font-semibold text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-3">ID Orden</th>
                  <th className="py-3 px-3">Cliente</th>
                  <th className="py-3 px-3">Plato</th>
                  <th className="py-3 px-3">Estado</th>
                  <th className="py-3 px-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-gray-700">
                {(stats?.pedidosRecientes || []).map((pedido, index) => (
                  <tr key={pedido.id || index} className="hover:bg-gray-50/50 transition">
                    <td className="py-3.5 px-3 font-bold text-gray-900">{pedido.id}</td>
                    <td className="py-3.5 px-3 font-medium">{pedido.cliente}</td>
                    <td className="py-3.5 px-3 text-gray-500">{pedido.plato}</td>
                    <td className="py-3.5 px-3">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        pedido.estado === 'Completado' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        pedido.estado === 'En proceso' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                        'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {pedido.estado}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right font-black text-gray-900">${pedido.total?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  )
}