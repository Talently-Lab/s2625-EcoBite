import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { restaurantesService } from '../services/restaurantesService'

export default function StoreDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [store, setStore] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // URL base de Render extraída de las variables de entorno
  const backendUrl = import.meta.env.VITE_API_URL 
    ? import.meta.env.VITE_API_URL.replace('/api', '') 
    : 'https://s2625-ecobite.onrender.com'

  const resolveImageUrl = (item) => {
    const rawPath = item?.imagenUrl || item?.imagen || item?.urlImagen || item?.img || item?.image || item?.banner || item?.logo || ''
    if (!rawPath) return ''
    if (rawPath.startsWith('http')) return rawPath
    return `${backendUrl}${rawPath}`
  }

  useEffect(() => {
    async function fetchStoreData() {
      try {
        setLoading(true)
        setError(null)

        // 1. Obtenemos todos los locales y filtramos el actual de la API
        const allStores = await restaurantesService.getAllStores()
        const listaLocales = Array.isArray(allStores) ? allStores : (allStores?.data || [])
        const foundStore = listaLocales.find(s => (s.id || s._id) === id)

        if (!foundStore) {
          setError('No se encontró el restaurante seleccionado.')
          setStore(null)
          return
        }

        setStore(foundStore)

        // 2. Cargamos los platos reales exclusivos de este restaurante desde la API
        let lista = []
        try {
          const productsData = await restaurantesService.getStoreProducts(id)
          lista = Array.isArray(productsData) ? productsData : (productsData?.data || [])
        } catch (e) {
          console.warn('No se pudieron cargar los platos específicos del local:', e)
        }

        setProducts(lista)

      } catch (err) {
        console.error('Error al conectar con el servidor:', err)
        setError('No se pudo cargar la información del local.')
        setStore(null)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchStoreData()
    }
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center text-xs text-gray-500 font-medium">
        Cargando local...
      </div>
    )
  }

  if (error || !store) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] flex flex-col items-center justify-center p-4 text-center space-y-3">
        <p className="text-xs text-amber-800">{error || 'No se encontró el restaurante seleccionado.'}</p>
        <button 
          onClick={() => navigate('/')} 
          className="px-4 py-2 bg-[#3D2314] text-white text-xs rounded-xl cursor-pointer font-medium"
        >
          Volver al Inicio
        </button>
      </div>
    )
  }

  const storeName = store.name || store.nombre || 'Local sustentable'
  const storeCategory = store.category || store.categoria || ''
  
  const storeBanner = resolveImageUrl(store)
  const storeLogo = resolveImageUrl({ imagen: store.logo })

  const storeRating = store.rating || store.calificacion || store.calificacionPromedio || '4.6'
  const storeTime = store.time || store.tiempoEnvio || '20-30 min'
  const storeAddress = store.address || store.direccion || ''

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-gray-800 font-sans pb-16">
      
      {/* Contenedor centralizado para evitar desbordes en desktop */}
      <div className="max-w-4xl mx-auto px-4 py-3 space-y-6">
        
        {/* Botón Volver */}
        <div>
          <button
            onClick={() => navigate(-1)}
            className="text-xs font-semibold text-gray-600 hover:text-gray-900 flex items-center gap-1 cursor-pointer"
          >
            ← Volver
          </button>
        </div>

        {/* Header / Banner del Restaurante */}
        <div className="relative rounded-3xl overflow-hidden bg-gray-100 h-44 sm:h-64 shadow-sm border border-gray-100">
          {storeBanner ? (
            <img
              src={storeBanner}
              alt={storeName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">Sin imagen de portada</div>
          )}
          <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent flex items-end p-4 sm:p-6">
            <div className="text-white flex items-center gap-3">
              {storeLogo ? (
                <img src={storeLogo} alt="logo" className="w-12 h-12 rounded-full bg-white p-1 object-contain shrink-0 shadow" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-[#3D2314] text-white font-bold text-lg flex items-center justify-center shrink-0 shadow">
                  {storeName.charAt(0) || 'E'}
                </div>
              )}
              <div>
                <h1 className="text-xl sm:text-2xl font-bold">{storeName}</h1>
                <p className="text-xs text-gray-200">
                  {storeCategory} {storeAddress ? `• ${storeAddress}` : ''}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Info adicional */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between text-xs sm:text-sm text-gray-600 shadow-2xs">
          <div>
            <span className="text-amber-500 font-bold">★ {storeRating}</span>
            <span className="mx-2">•</span>
            <span>Tiempo prom: {storeTime}</span>
          </div>
          <span className="text-emerald-600 font-medium bg-emerald-50 px-3 py-1 rounded-full text-xs border border-emerald-100">🌱 Eco-Certificado</span>
        </div>

        {/* Carta / Menú */}
        <section className="space-y-3">
          <h2 className="font-bold text-base text-[#2D2320] border-b border-gray-100 pb-2">Menú disponible</h2>
          
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {products.map((prod) => {
                const prodId = prod.id || prod._id
                const prodName = prod.name || prod.nombre || 'Producto'
                const prodDesc = prod.description || prod.descripcion || ''
                const prodPrice = prod.price || prod.precio || 0
                
                const prodImg = resolveImageUrl(prod)

                return (
                  <div
                    key={prodId}
                    onClick={() => navigate(`/product/${prodId}`, { state: { producto: prod } })}
                    className="bg-white p-3.5 rounded-2xl border border-gray-100 flex gap-3.5 cursor-pointer hover:border-gray-300 transition shadow-2xs"
                  >
                    {prodImg ? (
                      <img
                        src={prodImg}
                        alt={prodName}
                        className="w-20 h-20 rounded-xl object-cover shrink-0 bg-gray-50 border border-gray-100"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=60'
                        }}
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-[10px] text-gray-400 shrink-0">
                        Sin imagen
                      </div>
                    )}
                    <div className="flex flex-col justify-between flex-1 min-w-0">
                      <div>
                        <h3 className="font-semibold text-xs sm:text-sm text-gray-800 line-clamp-1">{prodName}</h3>
                        <p className="text-[11px] text-gray-400 line-clamp-2 mt-0.5">{prodDesc}</p>
                      </div>
                      <span className="font-bold text-xs sm:text-sm text-[#3D2314] mt-1">
                        {typeof prodPrice === 'number' ? `$${prodPrice.toLocaleString()}` : `$${prodPrice}`}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="bg-white p-8 rounded-2xl border border-gray-100 text-center space-y-2">
              <p className="text-xs text-gray-500 font-medium">Este local aún no tiene platos cargados en el sistema.</p>
            </div>
          )}
        </section>

      </div>
    </div>
  )
}