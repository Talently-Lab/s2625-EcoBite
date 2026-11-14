import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Profile() {
  const navigate = useNavigate()
  const { user, isAuthenticated, loading, logout } = useAuth()

  // Redirigir al Login si no está autenticado
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated, loading, navigate])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center text-xs text-gray-500">
        Cargando perfil...
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Evita renderizar mientras redirige a /login
  }

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#3D2314] font-sans pb-16">
      {/* Resto del código de Profile.jsx */}
      <header className="bg-[#FAFAF7] border-b border-gray-100 p-4 max-w-md mx-auto flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="text-gray-700 text-sm flex items-center gap-1 cursor-pointer">
          ← Volver
        </button>
        <h1 className="font-bold text-sm text-[#3A2E2B]">Mi impacto</h1>
        <span className="text-xs text-gray-500 font-medium">Septiembre 2026</span>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6">
        {/* Tarjeta de Usuario con datos dinámicos */}
        <div className="bg-[#F5EFE6] border border-[#E8DFC8] rounded-2xl p-4 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-200 shrink-0">
            <img 
              src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80"} 
              alt="Avatar" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="space-y-1">
            <h2 className="font-bold text-base text-[#3D2314]">{user?.name || user?.email || 'Pedro Ramírez'}</h2>
            <div className="inline-flex items-center gap-1 bg-white/80 px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-[#3D2314] border border-[#E8DFC8]">
              <span>🍃</span>
              <span>47 pedidos sustentables</span>
            </div>
          </div>
        </div>

        {/* Plato más pedido y Métricas */}
        <section className="space-y-3">
          <h2 className="font-bold text-sm text-[#3D2314]">Tu plato más pedido</h2>
          <div className="bg-white rounded-2xl p-3 border border-gray-100 shadow-2xs flex items-center gap-3">
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0">
              <img 
                src="https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&auto=format&fit=crop&q=60" 
                alt="Hamburguesa Patagónica" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 space-y-2">
              <div>
                <h3 className="font-bold text-xs sm:text-sm text-gray-900">Hamburguesa Patagónica</h3>
                <p className="text-[11px] text-gray-400">La Kermés</p>
              </div>
              <button 
                onClick={() => navigate('/product/104')}
                className="px-3.5 py-1.5 bg-[#3D2314] hover:bg-[#2A180D] text-white text-[11px] font-medium rounded-xl transition flex items-center gap-1 cursor-pointer"
              >
                Pedir ahora &rarr;
              </button>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-sm text-[#3D2314]">Métricas principales</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs space-y-1">
              <span className="text-xl font-bold text-[#3D2314]">12</span>
              <p className="text-[11px] text-gray-400 font-medium">pedidos sustentables</p>
              <p className="text-xs font-bold text-[#3D2314] pt-1">Órdenes</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs space-y-1">
              <span className="text-xl font-bold text-[#3D2314]">10</span>
              <p className="text-[11px] text-gray-400 font-medium">Plásticos evitados</p>
              <p className="text-xs font-bold text-[#3D2314] pt-1">Órdenes sin utensilios</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs space-y-1">
              <span className="text-xl font-bold text-[#3D2314]">2 kg</span>
              <p className="text-[11px] text-gray-400 font-medium">CO₂ ahorrado</p>
              <p className="text-xs font-bold text-[#3D2314] pt-1">Por packaging</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs space-y-1">
              <span className="text-xl font-bold text-[#3D2314]">8 kg</span>
              <p className="text-[11px] text-gray-400 font-medium">CO₂ ahorrado</p>
              <p className="text-xs font-bold text-[#3D2314] pt-1">Por envíos ecológicos</p>
            </div>
          </div>
        </section>

        {/* Botón Cerrar Sesión */}
        <div className="pt-2 text-center">
          <button
            onClick={() => {
              logout()
              navigate('/login')
            }}
            className="text-xs font-semibold text-red-600 hover:underline cursor-pointer"
          >
            Cerrar Sesión
          </button>
        </div>
      </main>
    </div>
  )
}