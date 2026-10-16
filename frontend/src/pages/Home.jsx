import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import banner1 from '../assets/Carrusel/banner1.png'
import banner2 from '../assets/Carrusel/banner2.png'
import banner3 from '../assets/Carrusel/banner3.png'
import banner4 from '../assets/Carrusel/banner4.png'

// Importación de servicios HTTP
import { storesService } from '../services/storesService'
import { productsService } from '../services/productsService'

// Datos de respaldo (fallback)
const LOCALES_MOCK = [
  {
    id: 1,
    name: "McDonald's...",
    category: 'Hamburguesas & Papas',
    rating: '4.6',
    time: '20-30 min',
    ecoScore: 95,
    categories: ['Todos', 'Envío verde'],
    img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/3/36/McDonald%27s_Golden_Arches.svg'
  },
  {
    id: 2,
    name: 'La Kermés',
    category: 'Cocina consciente & Bowls',
    rating: '4.4',
    time: '15-25 min',
    ecoScore: 92,
    categories: ['Todos', 'Vegano', 'Vegetariano', 'Cero residuos'],
    img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60',
    logo: 'K'
  },
  {
    id: 3,
    name: 'Green & Co',
    category: 'Bistro & Cafe',
    rating: '4.7',
    time: '25-35 min',
    ecoScore: 88,
    categories: ['Todos', 'Vegetariano', 'Envío verde'],
    img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&auto=format&fit=crop&q=60',
    logo: 'G'
  },
  {
    id: 4,
    name: 'Bio Restaurant',
    category: 'Orgánico & Veggie',
    rating: '4.8',
    time: '20-40 min',
    ecoScore: 96,
    categories: ['Todos', 'Vegano', 'Vegetariano', 'Cero residuos', 'Envío verde'],
    img: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=60',
    logo: 'B'
  }
]

const PLATOS_MOCK = [
  {
    id: 101,
    name: 'Cuarto de Libra con Queso + Papas medianas',
    store: "McDonald's",
    price: '$12.480',
    originalPrice: '$15.600',
    rating: '4.8',
    shipping: 'gratis',
    categories: ['Todos'],
    img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 102,
    name: 'Power Bowl Quinoa & Falafel',
    store: 'La Kermés',
    price: '$9.900',
    originalPrice: '$14.500',
    rating: '4.6',
    shipping: '$1.880',
    categories: ['Todos', 'Vegano', 'Vegetariano'],
    img: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 103,
    name: 'Pizza Vegana de Rúcula y Tomate',
    store: 'Green & Co',
    price: '$13.500',
    originalPrice: '$16.000',
    rating: '4.9',
    shipping: 'gratis',
    categories: ['Todos', 'Vegano', 'Vegetariano'],
    img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=60'
  }
]

const PARA_VOS_MOCK = [
  {
    id: 201,
    name: 'Milanesa Napolitana con Puré Mixto',
    store: 'Standard 69',
    categories: ['Todos'],
    img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 202,
    name: 'Tostón en Masa Madre con Palta & Huevo',
    store: 'Bio Restaurant',
    categories: ['Todos', 'Vegetariano'],
    img: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 203,
    name: 'Media docena de empanadas al Horno de Jamón y Queso',
    store: 'El Hornito Santiagueño',
    categories: ['Todos'],
    img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=60'
  }
]

export default function Home() {
  const navigate = useNavigate()

  // Estados de la API
  const [locales, setLocales] = useState([])
  const [platos, setPlatos] = useState([])
  const [paraVosList, setParaVosList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Todos')

  // Banners
  const banners = [banner1, banner2, banner3, banner4]
  const [currentBanner, setCurrentBanner] = useState(0)

  const categories = ['Todos', 'Vegano', 'Vegetariano', 'Cero residuos', 'Envío verde']

  // Cargar datos
  useEffect(() => {
    async function fetchHomeData() {
      try {
        setLoading(true)
        setError(null)

        const [storesData, productsData] = await Promise.allSettled([
          storesService.getAllStores(),
          productsService.getFeaturedProducts()
        ])

        if (storesData.status === 'fulfilled' && storesData.value && storesData.value.length > 0) {
          setLocales(storesData.value)
        } else {
          setLocales(LOCALES_MOCK)
        }

        if (productsData.status === 'fulfilled' && productsData.value && productsData.value.length > 0) {
          setPlatos(productsData.value)
          setParaVosList(productsData.value)
        } else {
          setPlatos(PLATOS_MOCK)
          setParaVosList(PARA_VOS_MOCK)
        }
      } catch (err) {
        console.warn('Backend no disponible, cargando datos locales:', err)
        setError('No se pudo conectar con el backend. Mostrando datos locales.')
        setLocales(LOCALES_MOCK)
        setPlatos(PLATOS_MOCK)
        setParaVosList(PARA_VOS_MOCK)
      } finally {
        setLoading(false)
      }
    }

    fetchHomeData()
  }, [])

  // Auto-play del carrusel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev === banners.length - 1 ? 0 : prev + 1))
    }, 4000)
    return () => clearInterval(timer)
  }, [banners.length])

  // Lógica de filtrado por categoría y búsqueda
  const isFiltering = selectedCategory !== 'Todos' || searchTerm.trim() !== ''

  const filteredLocales = locales.filter((store) => {
    const matchesSearch = store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (store.category && store.category.toLowerCase().includes(searchTerm.toLowerCase()))
    
    let matchesCategory = true
    if (selectedCategory !== 'Todos') {
      const catList = store.categories || []
      matchesCategory = catList.some(c => c.toLowerCase() === selectedCategory.toLowerCase()) ||
                        (store.category && store.category.toLowerCase().includes(selectedCategory.toLowerCase()))
    }

    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-gray-800 font-sans pb-16">
      
      {/* Header Superior */}
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

      {/* Contenedor Principal */}
      <main className="max-w-md md:max-w-4xl lg:max-w-6xl mx-auto px-4 py-4 space-y-6">
        
        {/* Buscador general */}
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

        {/* Botones de Categoría */}
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

        {/* Indicador de Carga */}
        {loading && (
          <div className="text-center py-4 text-xs text-gray-500 font-medium animate-pulse">
            Cargando recomendaciones...
          </div>
        )}

        {/* Error discreto */}
        {error && (
          <div className="text-center py-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl">
            {error}
          </div>
        )}

        {/* SI NO SE ESTÁ FILTRANDO: Muestra Banners + Locales + Los más pedidos + Para vos */}
        {!isFiltering ? (
          <>
            {/* Banner Promocional */}
            <div className="relative rounded-2xl overflow-hidden shadow-sm bg-gray-100 w-full flex items-center">
              <img 
                src={banners[currentBanner]} 
                alt={`Banner promocional ${currentBanner + 1}`} 
                className="w-full h-auto block object-contain transform-gpu backface-hidden [image-rendering:-webkit-optimize-contrast]"
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

            {/* Locales sustentables */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-sm sm:text-base text-[#2D2320]">Locales sustentables</h2>
                <Link to="/stores" className="text-xs text-gray-600 hover:underline flex items-center gap-0.5 font-medium">
                  Ver todo <span>→</span>
                </Link>
              </div>

              <div className="flex overflow-x-auto sm:grid sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 scrollbar-none pb-2 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0">
                {locales.map((store) => (
                  <div
                    key={store.id}
                    onClick={() => navigate(`/store/${store.id}`)}
                    className="w-44 sm:w-auto shrink-0 bg-white rounded-2xl p-2.5 border border-gray-100 shadow-2xs cursor-pointer space-y-2 hover:shadow-md transition"
                  >
                    <div className="relative h-28 sm:h-32 rounded-xl overflow-hidden bg-gray-100">
                      <img src={store.img || store.image} alt={store.name} className="w-full h-full object-cover" />
                      <div className="absolute top-2 right-2 bg-indigo-900/80 backdrop-blur-xs text-white text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                        <span>🍃</span>
                        <span>{store.ecoScore || 95}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-0.5 px-1">
                      <div className="flex items-center gap-1.5">
                        {store.logo && typeof store.logo === 'string' && store.logo.startsWith('http') ? (
                          <img src={store.logo} alt="logo" className="w-4 h-4 rounded-full object-contain shrink-0" />
                        ) : (
                          <span className="w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                            {store.logo || store.name?.charAt(0) || 'E'}
                          </span>
                        )}
                        <h3 className="font-bold text-xs sm:text-sm text-gray-800 truncate">{store.name}</h3>
                      </div>
                      <p className="text-[10px] sm:text-xs text-gray-400 truncate">{store.category}</p>
                      <div className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-500 pt-1">
                        <span className="text-amber-500 font-bold">★ {store.rating || '4.6'}</span>
                        <span>•</span>
                        <span>{store.time || '20-30 min'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Los más pedidos */}
            <section className="space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <h2 className="font-bold text-sm sm:text-base text-[#2D2320]">Los más pedidos</h2>
                <Link to="/catalog" className="text-xs text-gray-600 hover:underline flex items-center gap-0.5 font-medium">
                  Ver todo <span>→</span>
                </Link>
              </div>

              <div className="flex overflow-x-auto sm:grid sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 scrollbar-none pb-2 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0">
                {platos.map((plato) => (
                  <div
                    key={plato.id}
                    onClick={() => navigate(`/product/${plato.id}`)}
                    className="w-44 sm:w-auto shrink-0 bg-white rounded-2xl p-2.5 border border-gray-100 shadow-2xs cursor-pointer space-y-2 hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="h-28 sm:h-32 rounded-xl overflow-hidden bg-gray-100 mb-2">
                        <img src={plato.img || plato.image} alt={plato.name} className="w-full h-full object-cover" />
                      </div>

                      <h3 className="font-semibold text-xs sm:text-sm text-gray-800 line-clamp-2 leading-tight">
                        {plato.name}
                      </h3>
                    </div>

                    <div className="space-y-1 pt-1">
                      <div className="flex items-baseline gap-1">
                        <span className="text-xs sm:text-sm font-bold text-gray-900">
                          {typeof plato.price === 'number' ? `$${plato.price}` : plato.price}
                        </span>
                        {plato.originalPrice && (
                          <span className="text-[9px] sm:text-xs text-gray-400 line-through">{plato.originalPrice}</span>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[10px] sm:text-xs text-gray-500">
                        <span className="text-amber-500 font-bold">★ {plato.rating || '4.8'}</span>
                        <span className="text-emerald-600 font-medium">{plato.shipping || 'gratis'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Para vos */}
            <section className="space-y-4 pt-2">
              <h2 className="font-bold text-lg text-[#3A2E2B]">Para vos</h2>
              
              <div className="space-y-3">
                {paraVosList.map((plato) => (
                  <div
                    key={plato.id}
                    className="bg-white rounded-2xl p-4 border border-gray-100 shadow-2xs flex gap-4 items-center justify-between"
                  >
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                      <img src={plato.img} alt={plato.name} className="w-full h-full object-cover" />
                    </div>

                    <div className="flex-1 space-y-1">
                      <h3 className="font-bold text-xs sm:text-sm text-gray-900 leading-snug">{plato.name}</h3>
                      <p className="text-xs text-gray-500">{plato.store}</p>
                    </div>

                    <button
                      onClick={() => navigate(`/product/${plato.id}`)}
                      className="px-4 py-2.5 bg-[#3D2314] hover:bg-[#2A180D] text-white text-xs font-medium rounded-full transition flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      Ver detalle &rarr;
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </>
        ) : (
          /* SI SE ESTÁ FILTRANDO: Muestra ÚNICAMENTE la grilla limpia de locales filtrados */
          <section className="space-y-4 pt-2">
            <h2 className="font-bold text-base text-[#2D2320]">
              {filteredLocales.length} recomendaciones para vos
            </h2>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {filteredLocales.length > 0 ? (
                filteredLocales.map((store) => (
                  <div
                    key={store.id}
                    onClick={() => navigate(`/store/${store.id}`)}
                    className="bg-white rounded-2xl p-3 border border-gray-100 shadow-2xs cursor-pointer space-y-2 hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="h-32 sm:h-36 rounded-xl overflow-hidden bg-gray-100 mb-2 relative">
                        <img src={store.img || store.image} alt={store.name} className="w-full h-full object-cover" />
                        <div className="absolute top-2 right-2 bg-indigo-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <span>🍃</span>
                          <span>{store.ecoScore || 95}</span>
                        </div>
                      </div>
                      <h3 className="font-bold text-xs sm:text-sm text-gray-900 leading-tight truncate">
                        {store.name}
                      </h3>
                      <p className="text-[10px] sm:text-xs text-gray-400 truncate mt-0.5">{store.category}</p>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center gap-1 text-xs text-gray-700">
                        <span className="text-amber-500 font-bold">★ {store.rating || '4.6'}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-500 text-[11px]">{store.time || '20-30 min'}</span>
                      </div>
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