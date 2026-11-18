import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../services/api'

export default function Profile() {
  const navigate = useNavigate()
  const { user, isAuthenticated, loading, logout } = useAuth()

  const [perfilData, setPerfilData] = useState(null)
  const [loadingPerfil, setLoadingPerfil] = useState(true)
  const [errorPerfil, setErrorPerfil] = useState(null)

  const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=60'
  const DEFAULT_PLATO_IMG = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=60'

  const backendUrl = import.meta.env.VITE_API_URL 
    ? import.meta.env.VITE_API_URL.replace('/api', '') 
    : 'https://s2625-ecobite.onrender.com'

  const resolveImageUrl = (rawPath) => {
    if (!rawPath) return DEFAULT_PLATO_IMG
    if (rawPath.startsWith('http')) return rawPath
    return `${backendUrl}${rawPath}`
  }

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated, loading, navigate])

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

  // Calcular dinámicamente el plato más pedido a partir de pedidosRecientes reales
  const platoFavorito = useMemo(() => {
    const pedidos = perfilData?.pedidosRecientes || []
    if (!Array.isArray(pedidos) || pedidos.length === 0) return null

    const conteo = {}
    let maxPlato = null
    let maxCantidad = 0

    pedidos.forEach((pedido) => {
      const restauranteNombre = pedido.restaurante || pedido.nombreRestaurante || 'Restaurante EcoBite'
      
      if (Array.isArray(pedido.items) && pedido.items.length > 0) {
        pedido.items.forEach((item) => {
          const nombre = item.nombre || item.producto || pedido.plato
          if (!nombre) return
          const cant = Number(item.cantidad || 1)
          if (!conteo[nombre]) {
            conteo[nombre] = {
              nombre,
              restaurante: restauranteNombre,
              imagen: item.imagen || item.imagenUrl || pedido.imagen || pedido.imagenUrl,
              total: 0
            }
          }
          conteo[nombre].total += cant
          if (conteo[nombre].total > maxCantidad) {
            maxCantidad = conteo[nombre].total
            maxPlato = conteo[nombre]
          }
        })
      } else if (pedido.plato || pedido.descripcion) {
        const nombre = pedido.plato || pedido.descripcion
        if (!conteo[nombre]) {
          conteo[nombre] = {
            nombre,
            restaurante: restauranteNombre,
            imagen: pedido.imagen || pedido.imagenUrl,
            total: 0
          }
        }
        conteo[nombre].total += 1
        if (conteo[nombre].total > maxCantidad) {
          maxCantidad = conteo[nombre].total
          maxPlato = conteo[nombre]
        }
      }
    })

    if (!maxPlato && pedidos[0]) {
      return {
        nombre: pedidos[0].plato || `Pedido #${String(pedidos[0].id || '').slice(0, 8)}`,
        restaurante: pedidos[0].restaurante || 'EcoBite',
        imagen: pedidos[0].imagen || pedidos[0].imagenUrl
      }
    }

    return maxPlato
  }, [perfilData])

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

  const usuarioInfo = perfilData?.usuario || user || {}
  const nombreReal = usuarioInfo?.nombre || user?.nombre || 'Usuario'
  const imagenReal = usuarioInfo?.imagenUri || user?.imagenUri

  const pedidosSustentables = perfilData?.pedidosSustentables ?? 0
  const envasesReutilizados = perfilData?.envasesReutilizados ?? 0
  const co2AhorradoTotal = perfilData?.co2Ahorrado ?? 0

  const fechaActualMes = new Date().toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
  const fechaFormateada = fechaActualMes.charAt(0).toUpperCase() + fechaActualMes.slice(1)

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#3D2314] font-sans pb-16">
      {/* Header UX */}
      <header className="bg-[#FAFAF7] p-4 max-w-md mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-700 text-sm cursor-pointer pr-1"
            title="Volver"
          >
            ←
          </button>
          <span className="font-bold text-sm text-[#3D2314]">Mi impacto</span>
        </div>
        <span className="text-xs text-gray-500 font-medium">{fechaFormateada}</span>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6">
        {/* Tarjeta de Usuario */}
        <div className="bg-[#F5EFE6] border border-[#E8DFC8] rounded-2xl p-4 flex items-center gap-4 shadow-2xs">
          <div className="w-14 h-14 rounded-full overflow-hidden bg-amber-100 shrink-0 flex items-center justify-center font-bold text-[#3D2314] text-lg">
            <img
              src={imagenReal || DEFAULT_AVATAR}
              alt={nombreReal}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = DEFAULT_AVATAR
              }}
            />
          </div>
          <div className="space-y-1">
            <h2 className="font-bold text-base text-[#3D2314]">
              {nombreReal}
            </h2>
            <div className="inline-flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-full text-xs font-medium text-[#3D2314] border border-[#E8DFC8]">
              <span>🍃</span>
              <span>{pedidosSustentables} pedidos sustentables</span>
            </div>
          </div>
        </div>

        {/* Sección: Tu plato más pedido */}
        <section className="space-y-3">
          <h2 className="font-bold text-sm text-[#3D2314]">Tu plato más pedido</h2>
          
          {platoFavorito ? (
            <div className="bg-white p-4 rounded-2xl border border-[#EBE3D5] shadow-2xs flex items-center gap-4">
              <img 
                src={resolveImageUrl(platoFavorito.imagen)} 
                alt={platoFavorito.nombre} 
                className="w-20 h-20 rounded-xl object-cover shrink-0"
                onError={(e) => {
                  e.target.src = DEFAULT_PLATO_IMG
                }}
              />
              <div className="flex-1 space-y-1.5">
                <h3 className="font-bold text-xs text-[#3D2314]">{platoFavorito.nombre}</h3>
                <p className="text-[11px] text-gray-500">{platoFavorito.restaurante}</p>
                <button
                  onClick={() => navigate('/catalog')}
                  className="px-4 py-2 bg-[#3D2314] hover:bg-[#2A180D] text-white text-[11px] font-bold rounded-xl transition cursor-pointer inline-flex items-center gap-1"
                >
                  <span>Pedir ahora</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs text-center space-y-2">
              <p className="text-xs text-gray-500">Aún no tienes pedidos registrados para mostrar tu plato favorito.</p>
              <button
                onClick={() => navigate('/catalog')}
                className="mt-2 px-4 py-2 bg-[#3D2314] hover:bg-[#2A180D] text-white text-xs font-medium rounded-xl transition cursor-pointer inline-block"
              >
                Explorar catálogo →
              </button>
            </div>
          )}
        </section>

        {/* Sección: Métricas principales (Grilla 2x2 fiel al UX) */}
        <section className="space-y-3">
          <h2 className="font-bold text-sm text-[#3D2314]">Métricas principales</h2>

          {errorPerfil ? (
            <div className="bg-white p-4 rounded-2xl border border-red-100 text-xs text-red-600 text-center">
              {errorPerfil}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {/* Tarjeta 1 */}
              <div className="bg-white p-4 rounded-2xl border border-[#EBE3D5] shadow-2xs space-y-1">
                <p className="text-xl font-black text-[#3D2314]">
                  {loadingPerfil ? '—' : pedidosSustentables}
                </p>
                <p className="text-xs font-bold text-gray-800">pedidos sustentables</p>
                <p className="text-[11px] text-gray-500">Órdenes</p>
              </div>

              {/* Tarjeta 2 */}
              <div className="bg-white p-4 rounded-2xl border border-[#EBE3D5] shadow-2xs space-y-1">
                <p className="text-xl font-black text-[#3D2314]">
                  {loadingPerfil ? '—' : envasesReutilizados}
                </p>
                <p className="text-xs font-bold text-gray-800">Plásticos evitados</p>
                <p className="text-[11px] text-gray-500">Órdenes sin utensilios</p>
              </div>

              {/* Tarjeta 3 */}
              <div className="bg-white p-4 rounded-2xl border border-[#EBE3D5] shadow-2xs space-y-1">
                <p className="text-xl font-black text-[#3D2314]">
                  {loadingPerfil ? '—' : `${Number(co2AhorradoTotal).toFixed(1)} kg`}
                </p>
                <p className="text-xs font-bold text-gray-800">CO₂ ahorrado</p>
                <p className="text-[11px] text-gray-500">Por packaging</p>
              </div>

              {/* Tarjeta 4 */}
              <div className="bg-white p-4 rounded-2xl border border-[#EBE3D5] shadow-2xs space-y-1">
                <p className="text-xl font-black text-[#3D2314]">
                  {loadingPerfil ? '—' : `${(pedidosSustentables * 0.5).toFixed(1)} kg`}
                </p>
                <p className="text-xs font-bold text-gray-800">CO₂ ahorrado</p>
                <p className="text-[11px] text-gray-500">Por envíos ecológicos</p>
              </div>
            </div>
          )}
        </section>

        {/* Sección de Ayuda y soporte (Solicitada por Leonel) */}
        <div className="bg-white border border-[#EBE3D5] rounded-2xl p-4 flex items-center justify-between shadow-2xs hover:bg-[#FAF8F5] transition cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#FAF8F5] border border-[#EBE3D5] flex items-center justify-center text-[#3D2314]">
              🎧
            </div>
            <span className="text-xs font-bold text-[#3D2314]">Ayuda y soporte</span>
          </div>
          <span className="text-[#3D2314] font-bold text-base">→</span>
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