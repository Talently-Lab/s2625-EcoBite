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
    return null 
  }

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#3D2314] font-sans pb-16">
      <header className="bg-[#FAFAF7] border-b border-gray-100 p-4 max-w-md mx-auto flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="text-gray-700 text-sm flex items-center gap-1 cursor-pointer">
          ← Volver
        </button>
        <h1 className="font-bold text-sm text-[#3A2E2B]">Mi cuenta</h1>
        <span className="text-xs text-gray-500 font-medium">EcoBite</span>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6">
        {/* Tarjeta de Usuario conectada exclusivamente a la API (AuthContext) */}
        <div className="bg-[#F5EFE6] border border-[#E8DFC8] rounded-2xl p-4 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full overflow-hidden bg-amber-100 shrink-0 flex items-center justify-center font-bold text-[#3D2314] text-lg">
            {user?.nombre ? user.nombre.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="space-y-1">
            <h2 className="font-bold text-base text-[#3D2314]">
              {user?.nombre || user?.name || 'Usuario'}
            </h2>
            <p className="text-xs text-gray-500">
              {user?.email || 'Sin correo asociado'}
            </p>
            <div className="inline-flex items-center gap-1 bg-white/80 px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-[#3D2314] border border-[#E8DFC8] mt-1">
              <span>🍃</span>
              <span>Rol: {user?.tipoUsuarioId === 2 || user?.rol === 'admin' ? 'Administrador' : 'Cliente'}</span>
            </div>
          </div>
        </div>

        {/* Sección informativa de actividad */}
        <section className="space-y-3">
          <h2 className="font-bold text-sm text-[#3D2314]">Resumen de actividad</h2>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs space-y-2 text-center">
            <p className="text-xs text-gray-500">
              Tu cuenta está conectada de forma segura al sistema de EcoBite.
            </p>
            <button 
              onClick={() => navigate('/catalog')}
              className="mt-2 px-4 py-2 bg-[#3D2314] hover:bg-[#2A180D] text-white text-xs font-medium rounded-xl transition cursor-pointer inline-block"
            >
              Explorar catálogo y hacer un pedido →
            </button>
          </div>
        </section>

        {/* Sección de Ayuda y soporte */}
        <div className="bg-white border border-[#EBE3D5] rounded-2xl p-4 flex items-center justify-between shadow-2xs hover:bg-[#FAF8F5] transition cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#FAF8F5] border border-[#EBE3D5] flex items-center justify-center text-[#3D2314]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xs font-bold text-[#3D2314]">Ayuda y soporte</span>
          </div>
          <span className="text-[#3D2314] font-bold">→</span>
        </div>

        {/* Botón Cerrar Sesión */}
        <div className="pt-2 text-center">
          <button
            onClick={() => {
              logout()
              navigate('/')
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