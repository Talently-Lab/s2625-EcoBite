import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import banner1 from '../assets/Carrusel/banner1.png'
import banner2 from '../assets/Carrusel/banner2.png'
import banner3 from '../assets/Carrusel/banner3.png'
import banner4 from '../assets/Carrusel/banner4.png'

import { restaurantesService } from '../services/restaurantesService'

export default function Home() {
  const navigate = useNavigate()

  const [locales, setLocales] = useState([])
  const [platos, setPlatos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Todos')

  const banners = [banner1, banner2, banner3, banner4]
  const [currentBanner, setCurrentBanner] = useState(0)

  const categories = ['Todos', 'Comida rápida', 'Saludable', 'Vegetariano', 'Cero residuos', 'Envío verde']

  const resolveImageUrl = (item) => {
    const rawPath = item?.imagenUrl || item?.imagen || item?.urlImagen || item?.img || item?.image
    if (!rawPath) {
      return 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60'
    }
    if (rawPath.startsWith('http')) return rawPath

    const backendUrl = import.meta.env.VITE_API_URL 
      ? import.meta.env.VITE_API_URL.replace('/api', '') 
      : 'https://s2625-ecobite.onrender.com'

    return `${backendUrl}${rawPath}`
  }

  const handleProductClick = (item, isStore = false) => {
    const prodId = item.id || item._id
    const restId = isStore ? null : (item.restauranteId || null)

    if (prodId) {
      navigate(`/product/${prodId}`, { 
        state: { 
          producto: item,
          restauranteId: restId,
          esRestaurante: isStore
        } 
      })
    }
  }

  useEffect(() => {
    async function fetchHomeData() {
      try {
        setLoading(true)
        setError(null)

        const listaLocales = await restaurantesService.getAllStores()
        setLocales(listaLocales || [])

        let todosLosPlatos = []
        if (listaLocales && listaLocales.length > 0) {
          for (const store of listaLocales) {
            const storeId = store.id || store._id
            try {
              const platosLocal = await restaurantesService.getStoreProducts(storeId)
              if (Array.isArray(platosLocal)) {
                const platosConLocal = platosLocal.map(p => ({ 
                  ...p, 
                  restauranteId: storeId,
                  restauranteNombre: store.nombre || store.name 
                }))
                todosLosPlatos = [...todosLosPlatos, ...platosConLocal]
              }
            } catch {
              // Silenciado para producción
            }
          }
        }
        setPlatos(todosLosPlatos)

      } catch {
        setError('Error de conexión con el servidor.')
        setPlatos([])
        setLocales([])
      } finally {
        setLoading(false)
      }
    }

    fetchHomeData()
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev === banners.length - 1 ? 0 : prev + 1))
    }, 4000)
    return () => clearInterval(timer)
  }, [banners.length])

  const filteredLocales = locales.filter((store) => {
    if (!store) return false
    const storeName = store.nombre || store.name || ''
    const storeCategory = store.categoriaComida || store.category || store.categoria || ''
    
    const matchesSearch = storeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          storeCategory.toLowerCase().includes(searchTerm.toLowerCase())
    
    let matchesCategory = true
    if (selectedCategory !== 'Todos') {
      if (selectedCategory === 'Cero residuos') {
        matchesCategory = Boolean(store.ceroResiduos)
      } else if (selectedCategory === 'Envío verde') {
        matchesCategory = Boolean(store.envioVerde)
      } else if (selectedCategory === 'Comida rápida') {
        matchesCategory = storeCategory === 'comida_rapida'
      } else if (selectedCategory === 'Saludable') {
        matchesCategory = storeCategory === 'comida_saludable'
      } else if (selectedCategory === 'Vegetariano') {
        matchesCategory = storeCategory === 'vegetariano' || storeCategory === 'vegano'
      }
    }

    return matchesSearch && matchesCategory
  })

  const isFiltering = selectedCategory !== 'Todos' || searchTerm.trim() !== ''

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-gray-800 font-sans pb-16">
      
      <header className="bg-[#FAFAF7] border-b border-gray-100 sticky top-0 z-20 shadow-2xs">
        <div className="max-w-md md:max-w-4xl lg:max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="md:hidden text-xl text-gray-700 hover:bg-gray-100 p-1.5 rounded-lg transition cursor-pointer">
              ☰
            </button>
            <span className="font-bold text-xl text-[#3A2E2B] tracking-tight">EcoBite</span>
          </div>
          <div className="flex items-center gap-3 text-gray-700">
            <Link to="/cart" className="p-1.5 hover:bg-gray-100 rounded-lg text-lg transition">🛒</Link>
            <Link to="/profile" className="p-1.5 hover:bg-gray-100 rounded-lg text-lg transition">👤</Link>
          </div>
        </div>
      </header>

      <main className="max-w-md md:max-w-4xl lg:max-w-6xl mx-auto px-4 py-4 space-y-6">
        
        <div className="relative max-w-2xl mx-auto">
          <input
            type="text"
            placeholder="Buscar restaurante, platos y productos"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-amber-600 shadow-2xs transition"
          />
          <span className="absolute left-3.5 top-3.5 text-gray-400 text-xs sm:text-sm">🔍</span>
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1 text-xs sm:justify-center">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition font-medium cursor-pointer ${
                  isActive
                    ? 'bg-[#B58252] text-white shadow-xs'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {cat}
              </button>
            )
          })}
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <div className="w-8 h-8 border-4 border-[#B58252] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-gray-600 font-medium animate-pulse">
              Cargando restaurantes y platillos...
            </p>
          </div>
        )}

        {error && (
          <div className="text-center py-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl">
            {error}
          </div>
        )}

        {!loading && !isFiltering && (
          <>
            <div className="relative rounded-2xl overflow-hidden shadow-sm bg-gray-100 w-full flex items-center">
              <img 
                src={banners[currentBanner]} 
                alt={`Banner promocional ${currentBanner + 1}`} 
                className="w-full h-auto block object-contain"
              />
              
              <button 
                onClick={() => setCurrentBanner((prev) => (prev === 0 ? banners.length - 1 : prev - 1))}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white w-8 h-8 rounded-full flex items-center justify-center transition backdrop-blur-xs cursor-pointer z-10"
              >
                ❮
              </button>
              
              <button 
                onClick={() => setCurrentBanner((prev) => (prev === banners.length - 1 ? 0 : prev + 1))}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white w-8 h-8 rounded-full flex items-center justify-center transition backdrop-blur-xs cursor-pointer z-10"
              >
                ❯
              </button>

              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
                {banners.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentBanner(index)}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      currentBanner === index ? 'bg-white w-5' : 'bg-white/50 w-2'
                    }`}
                  />
                ))}
              </div>
            </div>

            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-sm sm:text-base text-[#2D2320]">Locales sustentables</h2>
                <Link to="/stores" className="text-xs text-gray-600 hover:underline flex items-center gap-0.5 font-medium">
                  Ver todo <span>→</span>
                </Link>
              </div>

              <div className="flex overflow-x-auto sm:grid sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 scrollbar-none pb-2 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0">
                {locales.length > 0 ? (
                  locales.map((store) => (
                    <div
                      key={store.id || store._id}
                      onClick={() => handleProductClick(store, true)}
                      className="w-44 sm:w-auto shrink-0 bg-white rounded-2xl p-2.5 border border-gray-100 shadow-2xs cursor-pointer space-y-2 hover:shadow-md transition"
                    >
                      <div className="relative h-28 sm:h-32 rounded-xl overflow-hidden bg-gray-100">
                        <img 
                          src={resolveImageUrl(store)} 
                          alt={store.nombre || store.name} 
                          className="w-full h-full object-cover" 
                        />
                        <div className="absolute top-2 right-2 bg-indigo-900/80 backdrop-blur-xs text-white text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                          <span>🍃</span>
                          <span>{store.calificacionPromedio || 4.7}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-0.5 px-1">
                        <div className="flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                            {(store.nombre || store.name)?.charAt(0) || 'E'}
                          </span>
                          <h3 className="font-bold text-xs sm:text-sm text-gray-800 truncate">
                            {store.nombre || store.name}
                          </h3>
                        </div>
                        <p className="text-[10px] sm:text-xs text-gray-400 truncate">{store.categoriaComida}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 col-span-full py-4">No hay restaurantes disponibles.</p>
                )}
              </div>
            </section>

            <section className="space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <h2 className="font-bold text-sm sm:text-base text-[#2D2320]">Los más pedidos</h2>
                <Link to="/catalog" className="text-xs text-gray-600 hover:underline flex items-center gap-0.5 font-medium">
                  Ver todo <span>→</span>
                </Link>
              </div>

              <div className="flex overflow-x-auto sm:grid sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 scrollbar-none pb-2 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0">
                {platos.length > 0 ? (
                  platos.map((plato) => (
                    <div
                      key={plato.id || plato._id}
                      onClick={() => handleProductClick(plato, false)}
                      className="w-44 sm:w-auto shrink-0 bg-white rounded-2xl p-2.5 border border-gray-100 shadow-2xs cursor-pointer space-y-2 hover:shadow-md transition flex flex-col justify-between"
                    >
                      <div>
                        <div className="h-28 sm:h-32 rounded-xl overflow-hidden bg-gray-100 mb-2">
                          <img 
                            src={resolveImageUrl(plato)} 
                            alt={plato.nombre || plato.name} 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <h3 className="font-semibold text-xs sm:text-sm text-gray-800 line-clamp-2 leading-tight">
                          {plato.nombre || plato.name}
                        </h3>
                      </div>

                      <div className="space-y-1 pt-1">
                        <span className="text-xs sm:text-sm font-bold text-gray-900">
                          ${plato.precio}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 col-span-full py-4">No hay platillos disponibles.</p>
                )}
              </div>
            </section>

            <section className="space-y-4 pt-2">
              <h2 className="font-bold text-lg text-[#3A2E2B]">Para vos</h2>
              
              <div className="space-y-3">
                {platos.length > 0 ? (
                  platos.map((plato) => (
                    <div
                      key={plato.id || plato._id}
                      className="bg-white rounded-2xl p-4 border border-gray-100 shadow-2xs flex gap-4 items-center justify-between"
                    >
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                        <img 
                          src={resolveImageUrl(plato)} 
                          alt={plato.nombre || plato.name} 
                          className="w-full h-full object-cover" 
                        />
                      </div>

                      <div className="flex-1 space-y-1">
                        <h3 className="font-bold text-xs sm:text-sm text-gray-900 leading-snug">
                          {plato.nombre || plato.name}
                        </h3>
                        <p className="text-xs text-gray-500">{plato.restauranteNombre || ''}</p>
                        <span className="text-xs font-bold text-emerald-800">${plato.precio}</span>
                      </div>

                      <button
                        onClick={() => handleProductClick(plato, false)}
                        className="px-4 py-2.5 bg-[#3D2314] hover:bg-[#2A180D] text-white text-xs font-medium rounded-full transition flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        Ver detalle →
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 py-4">No hay sugerencias disponibles.</p>
                )}
              </div>
            </section>
          </>
        )}

        {!loading && isFiltering && (
          <section className="space-y-4 pt-2">
            <h2 className="font-bold text-base text-[#2D2320]">
              {filteredLocales.length} recomendaciones para vos
            </h2>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {filteredLocales.length > 0 ? (
                filteredLocales.map((store) => (
                  <div
                    key={store.id || store._id}
                    onClick={() => handleProductClick(store, true)}
                    className="bg-white rounded-2xl p-3 border border-gray-100 shadow-2xs cursor-pointer space-y-2 hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="h-32 sm:h-36 rounded-xl overflow-hidden bg-gray-100 mb-2 relative">
                        <img 
                          src={resolveImageUrl(store)} 
                          alt={store.nombre || store.name} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <h3 className="font-bold text-xs sm:text-sm text-gray-900 leading-tight truncate">
                        {store.nombre || store.name}
                      </h3>
                      <p className="text-[10px] text-gray-400 truncate mt-0.5">{store.categoriaComida}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 col-span-full py-8 text-center">
                  No se encontraron locales para este filtro.
                </p>
              )}
            </div>
          </section>
        )}

      </main>
    </div>
  )
}