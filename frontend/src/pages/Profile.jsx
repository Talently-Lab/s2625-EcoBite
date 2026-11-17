import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../services/api'

export default function Profile() {
  const navigate = useNavigate()
  const { user, isAuthenticated, loading, logout } = useAuth()

  const [perfilData, setPerfilData] = useState(null)
  const [loadingPerfil, setLoadingPerfil] = useState(true)
  const [errorPerfil, setErrorPerfil] = useState(null)

  // Redirigir al Login si no está autenticado
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated, loading, navigate])

  // Consultar métricas individuales e historial real desde GET /api/usuarios/perfil
  useEffect(() => {
    const fetchPerfil = async () => {
      if (!isAuthenticated) return
      try {
        setLoadingPerfil(true)
        setErrorPerfil(null)
        const data = await apiFetch('/usuarios/perfil')
        setPerfilData(data)
      } catch (err) {
        console.error('Error al cargar perfil:', err)
        setErrorPerfil('No se pudieron cargar tus métricas en este momento.')
      } finally {
        setLoadingPerfil(false)
      }
    }

    if (!loading && isAuthenticated) {
      fetchPerfil()
    }
  }, [isAuthenticated, loading])

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

  // Extraer datos combinando la respuesta real de /usuarios/perfil con AuthContext como respaldo
  const usuarioInfo = perfilData?.usuario || perfilData || user || {}
  const metricas = perfilData?.metricas || perfilData?.impacto || perfilData || {}
 const historial =
    perfilData?.pedidosRecientes ||
    perfilData?.historial ||
    perfilData?.ultimosPedidos ||
    perfilData?.pedidos ||
    []

  const pedidosSustentables =
    metricas.pedidosSustentables ??
    metricas.totalPedidos ??
    metricas.pedidosEntregados ??
    (Array.isArray(historial) ? historial.length : 0)

  const co2Ahorrado =
    metricas.co2Ahorrado ??
    metricas.ahorroTotalKg ??
    metricas.co2Total ??
    0

  const envasesReutilizados =
    metricas.envasesReutilizados ??
    metricas.plasticoEvitado ??
    pedidosSustentables

  const rolNombre =
    usuarioInfo?.tipoUsuario?.nombreRol ||
    (usuarioInfo?.tipoUsuarioId === 2 || usuarioInfo?.rol === 'admin'
      ? 'Administrador'
      : 'Cliente')

  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return ''
    const fecha = new Date(fechaStr)
    if (Number.isNaN(fecha.getTime())) return fechaStr
    return fecha.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const formatearEstado = (estado) => {
    const mapa = {
      pendiente: { texto: 'Pendiente', clase: 'bg-amber-100 text-amber-800' },
      preparando: { texto: 'En preparación', clase: 'bg-blue-100 text-blue-800' },
      en_camino: { texto: 'En camino', clase: 'bg-indigo-100 text-indigo-800' },
      entregado: { texto: 'Entregado', clase: 'bg-emerald-100 text-emerald-800' },
      cancelado: { texto: 'Cancelado', clase: 'bg-red-100 text-red-700' },
    }
    const clave = String(estado || '').toLowerCase()
    return mapa[clave] || { texto: estado || 'Confirmado', clase: 'bg-gray-100 text-gray-700' }
  }

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#3D2314] font-sans pb-16">
      <header className="bg-[#FAFAF7] border-b border-gray-100 p-4 max-w-md mx-auto flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-700 text-sm flex items-center gap-1 cursor-pointer"
        >
          ← Volver
        </button>
        <h1 className="font-bold text-sm text-[#3A2E2B]">Mi cuenta</h1>
        <span className="text-xs text-gray-500 font-medium">EcoBite</span>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6">
        {/* Tarjeta de Usuario conectada a la API */}
        <div className="bg-[#F5EFE6] border border-[#E8DFC8] rounded-2xl p-4 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full overflow-hidden bg-amber-100 shrink-0 flex items-center justify-center font-bold text-[#3D2314] text-lg">
            {usuarioInfo?.nombre ? usuarioInfo.nombre.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="space-y-1">
            <h2 className="font-bold text-base text-[#3D2314]">
              {usuarioInfo?.nombre || usuarioInfo?.name || 'Usuario'}
            </h2>
            <p className="text-xs text-gray-500">
              {usuarioInfo?.email || 'Sin correo asociado'}
            </p>
            <div className="inline-flex items-center gap-1 bg-white/80 px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-[#3D2314] border border-[#E8DFC8] mt-1">
              <span>🍃</span>
              <span className="capitalize">Rol: {rolNombre}</span>
            </div>
          </div>
        </div>

        {/* Sección de Métricas de Impacto Individual */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-sm text-[#3D2314]">Tu impacto sustentable</h2>
            {loadingPerfil && (
              <span className="text-[11px] text-gray-400">Actualizando...</span>
            )}
          </div>

          {errorPerfil ? (
            <div className="bg-white p-4 rounded-2xl border border-red-100 text-xs text-red-600 text-center">
              {errorPerfil}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2.5">
              <div className="bg-white p-3.5 rounded-2xl border border-[#EBE3D5] text-center shadow-2xs">
                <span className="text-lg block mb-1">🥗</span>
                <p className="text-base font-extrabold text-[#3D2314]">
                  {loadingPerfil ? '—' : pedidosSustentables}
                </p>
                <p className="text-[10px] text-gray-500 leading-tight mt-0.5">
                  Pedidos eco
                </p>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-[#EBE3D5] text-center shadow-2xs">
                <span className="text-lg block mb-1">🌱</span>
                <p className="text-base font-extrabold text-emerald-700">
                  {loadingPerfil ? '—' : `${Number(co2Ahorrado).toFixed(1)} kg`}
                </p>
                <p className="text-[10px] text-gray-500 leading-tight mt-0.5">
                  CO₂ ahorrado
                </p>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-[#EBE3D5] text-center shadow-2xs">
                <span className="text-lg block mb-1">♻️</span>
                <p className="text-base font-extrabold text-[#3D2314]">
                  {loadingPerfil ? '—' : envasesReutilizados}
                </p>
                <p className="text-[10px] text-gray-500 leading-tight mt-0.5">
                  Envases evitados
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Historial de Pedidos Recientes */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-sm text-[#3D2314]">Mis pedidos recientes</h2>
            {Array.isArray(historial) && historial.length > 0 && (
              <span className="text-[11px] text-gray-500">
                {historial.length} {historial.length === 1 ? 'pedido' : 'pedidos'}
              </span>
            )}
          </div>

          {loadingPerfil ? (
            <div className="bg-white p-5 rounded-2xl border border-gray-100 text-center text-xs text-gray-400">
              Cargando historial de pedidos...
            </div>
          ) : Array.isArray(historial) && historial.length > 0 ? (
            <div className="space-y-2.5">
              {historial.map((pedido, index) => {
                const badge = formatearEstado(pedido.estado)
                const total = pedido.montoTotal ?? pedido.total ?? 0
                const tituloPlato =
                  pedido.plato ||
                  pedido.descripcion ||
                  (Array.isArray(pedido.items)
                    ? pedido.items.map((i) => `${i.cantidad}x ${i.nombre}`).join(', ')
                    : `Pedido #${String(pedido.id || index + 1).slice(0, 8)}`)

                return (
                  <div
                    key={pedido.id || index}
                    className="bg-white p-4 rounded-2xl border border-[#EBE3D5] shadow-2xs space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-bold text-[#3D2314]">{tituloPlato}</p>
                        {(pedido.restaurante || pedido.fecha) && (
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            {[pedido.restaurante, formatearFecha(pedido.fecha)]
                              .filter(Boolean)
                              .join(' • ')}
                          </p>
                        )}
                      </div>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${badge.clase}`}
                      >
                        {badge.texto}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1.5 border-t border-gray-100 text-xs">
                      <span className="text-gray-500">Total abonado</span>
                      <span className="font-bold text-[#3D2314]">
                        ${Number(total).toLocaleString('es-AR')}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs space-y-2 text-center">
              <p className="text-xs text-gray-500">
                Aún no tienes pedidos registrados en tu cuenta.
              </p>
              <button
                onClick={() => navigate('/catalog')}
                className="mt-2 px-4 py-2 bg-[#3D2314] hover:bg-[#2A180D] text-white text-xs font-medium rounded-xl transition cursor-pointer inline-block"
              >
                Explorar catálogo y hacer un pedido →
              </button>
            </div>
          )}
        </section>

        {/* Sección de Ayuda y soporte */}
        <div className="bg-white border border-[#EBE3D5] rounded-2xl p-4 flex items-center justify-between shadow-2xs hover:bg-[#FAF8F5] transition cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#FAF8F5] border border-[#EBE3D5] flex items-center justify-center text-[#3D2314]">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
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