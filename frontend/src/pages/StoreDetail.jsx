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

        const allStores = await restaurantesService.getAllStores()
        const listaLocales = Array.isArray(allStores) ? allStores : (allStores?.data || [])
        const foundStore = listaLocales.find(s => (s.id || s._id) === id)

        if (!foundStore) {
          setError('No se encontró el restaurante seleccionado.')
          setStore(null)
          return
        }

        setStore(foundStore)

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
      <div className="h-screen bg-[#FAFAF7] flex items-center justify-center text-xs text-gray-500 font-medium">
        Cargando local...
      </div>
    )
  }

  if (error || !store) {
    return (
      <div className="h-screen bg-[#FAFAF7] flex flex-col items-center justify-center p-4 text-center space-y-3">
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
    <div className="h-screen bg-[#FAFAF7] text-gray-800 font-sans flex flex-col overflow-hidden">
      
      {/* Contenedor principal adaptado al alto de la pantalla sin scroll general */}
      <div className="max-w-4xl w-full mx-auto px-4 py-2 flex flex-col h-full justify-between">
        
        {/* Cabecera, Banner compacto e Información */}
        <div className="space-y-2 shrink-0">
          <button
            onClick={() => navigate(-1)}
            className="text-xs font-semibold text-gray-600 hover:text-gray-900 flex items-center gap-1 cursor-pointer"
          >
            ← Volver
          </button>

          <div className="w-full relative rounded-2xl overflow-hidden bg-gray-100 h-32 sm:h-40 shadow-2xs border border-gray-100">
            {storeBanner ? (
              <img
                src={storeBanner}
                alt={storeName}
                className="w-full h-full object-cover object-center"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">Sin imagen</div>
            )}
            <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent flex items-end p-3">
              <div className="text-white flex items-center gap-3 w-full">
                {storeLogo ? (
                  <img src={storeLogo} alt="logo" className="w-10 h-10 rounded-full bg-white p-1 object-contain shrink-0 shadow" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#3D2314] text-white font-bold text-sm flex items-center justify-center shrink-0 shadow">
                    {storeName.charAt(0) || 'E'}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h1 className="text-base sm:text-lg font-extrabold truncate">{storeName}</h1>
                  <p className="text-[11px] text-gray-200 truncate">
                    {storeCategory} {storeAddress ? `• ${storeAddress}` : ''}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white px-3.5 py-2 rounded-xl border border-gray-100 flex items-center justify-between text-xs text-gray-600 shadow-2xs">
            <div>
              <span className="text-amber-500 font-bold">★ {storeRating}</span>
              <span className="mx-2">•</span>
              <span>Tiempo prom: {storeTime}</span>
            </div>
            <span className="text-emerald-600 font-medium bg-emerald-50 px-2.5 py-0.5 rounded-full text-[11px] border border-emerald-100">🌱 Eco-Certificado</span>
          </div>
        </div>

        {/* Menú disponible en grilla con scroll interno si sobrepasa la altura */}
        <section className="space-y-2 flex-1 flex flex-col min-h-0 pt-1 pb-4">
          <h2 className="font-bold text-sm text-[#2D2320] border-b border-gray-100 pb-1.5 shrink-0">Menú disponible</h2>
          
          <div className="overflow-y-auto flex-1 pr-1 space-y-2 min-h-0">
            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
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
                      className="bg-white p-3 rounded-2xl border border-gray-100 flex gap-3 cursor-pointer hover:border-gray-300 transition shadow-2xs items-center"
                    >
                      {prodImg ? (
                        <img
                          src={prodImg}
                          alt={prodName}
                          className="w-16 h-16 rounded-xl object-cover shrink-0 bg-gray-50 border border-gray-100"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=60'
                          }}
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-[10px] text-gray-400 shrink-0">
                          Sin imagen
                        </div>
                      )}
                      <div className="flex flex-col justify-between flex-1 min-w-0">
                        <div>
                          <h3 className="font-semibold text-xs text-gray-800 line-clamp-1">{prodName}</h3>
                          <p className="text-[10px] text-gray-400 line-clamp-1 mt-0.5">{prodDesc}</p>
                        </div>
                        <span className="font-bold text-xs text-[#3D2314] mt-1">
                          {typeof prodPrice === 'number' ? `$${prodPrice.toLocaleString()}` : `$${prodPrice}`}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="bg-white p-6 rounded-2xl border border-gray-100 text-center">
                <p className="text-xs text-gray-500 font-medium">Este local aún no tiene platos cargados.</p>
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  )
}