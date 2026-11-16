import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { restaurantesService } from '../services/restaurantesService'

export default function Catalog() {
  const navigate = useNavigate()
  const location = useLocation()
  
  const filtroInicial = location.state?.filtro || 'Todos'

  const [restaurantes, setRestaurantes] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtroActivo, setFiltroActivo] = useState(filtroInicial)
  const [busqueda, setBusqueda] = useState('')

  const backendUrl = import.meta.env.VITE_API_URL 
    ? import.meta.env.VITE_API_URL.replace('/api', '') 
    : 'https://s2625-ecobite.onrender.com'

  useEffect(() => {
    setLoading(true)
    restaurantesService.getAllStores()
      .then((res) => {
        const data = Array.isArray(res) ? res : (res?.data || [])
        setRestaurantes(data)
      })
      .catch((err) => console.error("Error al cargar restaurantes:", err))
      .finally(() => setLoading(false))
  }, [])

  const restaurantesFiltrados = restaurantes.filter(r => {
    const nombre = (r.name || r.nombre || '').toLowerCase()
    const matchBusqueda = nombre.includes(busqueda.toLowerCase())
    
    if (filtroActivo === 'Recomendados') return matchBusqueda && (Number(r.rating || r.calificacion || 0) >= 4.5)
    if (filtroActivo === '+Sustentables') return matchBusqueda && (r.sustentable || r.ecoScore > 80 || true)
    if (filtroActivo === 'Mejores valoradas') return matchBusqueda && (Number(r.rating || r.calificacion || 0) >= 4.7)
    return matchBusqueda
  })

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#3D2314] font-sans pb-16">
      {/* Contenedor centralizado para desktop y móvil */}
      <div className="max-w-md sm:max-w-3xl mx-auto px-4 py-4 space-y-5 bg-white sm:my-6 sm:rounded-3xl sm:shadow-lg sm:border sm:border-gray-100">
        
        {/* Header con botón de retroceso y título */}
        <div className="flex items-center justify-between pt-2">
          <button 
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center bg-white border border-gray-200 rounded-full hover:bg-gray-50 shadow-2xs transition cursor-pointer text-sm font-bold"
          >
            ←
          </button>
          <span className="font-bold text-sm text-[#2D2320]">Catálogo de Restaurantes</span>
          <div className="w-9"></div>
        </div>

        {/* Buscador */}
        <div className="relative">
          <input 
            type="text"
            placeholder="Buscar restaurante, platos y productos"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full bg-[#F5F2EB] border border-[#EBE3D5] rounded-2xl py-3 px-4 text-xs text-gray-800 placeholder-gray-400 focus:outline-hidden"
          />
        </div>

        {/* Chips de Filtro estilo Figma */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {['Todos', 'Recomendados', '+Sustentables', 'Mejores valoradas'].map((chip) => (
            <button
              key={chip}
              onClick={() => setFiltroActivo(chip)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold shrink-0 transition cursor-pointer ${
                filtroActivo === chip 
                  ? 'bg-[#3D2314] text-white' 
                  : 'bg-[#F5F2EB] text-gray-700 hover:bg-gray-200'
              }`}
            >
              {chip}
            </button>
          ))}
        </div>

        <p className="text-xs text-gray-500 font-medium pt-1">
          {restaurantesFiltrados.length} recomendaciones para vos
        </p>

        {/* Listado en Grid de tarjetas estilo UX */}
        {loading ? (
          <div className="text-center py-12 text-xs text-gray-400">Cargando restaurantes...</div>
        ) : restaurantesFiltrados.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4">
            {restaurantesFiltrados.map((r) => {
              const rId = r.id || r._id
              const rName = r.name || r.nombre || 'Local sustentable'
              const rCat = r.category || r.categoria || 'Comida saludable'
              const rRating = r.rating || r.calificacion || '4.5'
              const rawImg = r.banner || r.img || r.image || r.imagen || ''
              const rImg = rawImg 
                ? (rawImg.startsWith('http') ? rawImg : `${backendUrl}${rawImg}`)
                : 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=60'

              return (
                <div 
                  key={rId}
                  onClick={() => navigate(`/store/${rId}`)}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-2xs hover:shadow-md transition cursor-pointer flex flex-col justify-between"
                >
                  {/* Imagen del local con altura fija y sin estirarse */}
                  <div className="h-32 w-full bg-gray-100 relative overflow-hidden">
                    <img src={rImg} alt={rName} className="w-full h-full object-cover" />
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-full text-[10px] font-bold text-[#3D2314] flex items-center gap-1 shadow-xs">
                      ★ {rRating}
                    </div>
                  </div>

                  {/* Textos y Eco Score fieles al diseño de Figma */}
                  <div className="p-3.5 space-y-2">
                    <div>
                      <h3 className="font-bold text-xs text-gray-900 truncate">{rName}</h3>
                      <p className="text-[11px] text-gray-500 capitalize mt-0.5">{rCat}</p>
                    </div>

                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between text-[10px] text-gray-500 font-medium">
                        <span>Eco Score</span>
                        <span className="text-emerald-700 font-bold">Excelente</span>
                      </div>
                      <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-600 h-full rounded-full" style={{ width: '85%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12 space-y-2 bg-gray-50 rounded-2xl border border-gray-100">
            <span className="text-3xl">🔍</span>
            <p className="text-xs text-gray-500 font-medium">No se encontraron restaurantes con este filtro.</p>
          </div>
        )}

      </div>
    </div>
  )
}