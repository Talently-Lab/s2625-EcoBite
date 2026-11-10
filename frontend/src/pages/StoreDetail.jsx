import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { restaurantesService } from '../services/restaurantesService'

export default function DetalleRestaurante() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [store, setStore] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchStoreData() {
      try {
        setLoading(true)
        setError(null)

        const [storeRes, productsRes] = await Promise.allSettled([
          restaurantesService.getStoreById(id),
          restaurantesService.getStoreProducts(id)
        ])

        if (storeRes.status === 'fulfilled' && storeRes.value) {
          const val = storeRes.value
          setStore(val.data || val)
        } else {
          setStore(null)
        }

        if (productsRes.status === 'fulfilled' && productsRes.value) {
          const val = productsRes.value
          const lista = Array.isArray(val) ? val : (val?.data || [])
          setProducts(lista)
        } else {
          setProducts([])
        }
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
  const storeBanner = store.banner || store.img || store.image || store.imagen || ''
  const storeLogo = store.logo || ''
  const storeRating = store.rating || store.calificacion || '4.6'
  const storeTime = store.time || store.tiempoEnvio || '20-30 min'
  const storeAddress = store.address || store.direccion || ''

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-gray-800 font-sans pb-16">
      {/* Botón Volver */}
      <div className="max-w-4xl mx-auto px-4 py-3">
        <button
          onClick={() => navigate(-1)}
          className="text-xs font-semibold text-gray-600 hover:text-gray-900 flex items-center gap-1 cursor-pointer"
        >
          ← Volver
        </button>
      </div>

      <main className="max-w-4xl mx-auto px-4 space-y-6">
        {/* Header / Banner del Restaurante */}
        <div className="relative rounded-2xl overflow-hidden bg-gray-100 h-40 sm:h-56">
          {storeBanner ? (
            <img
              src={storeBanner}
              alt={storeName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">Sin imagen de portada</div>
          )}
          <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent flex items-end p-4">
            <div className="text-white flex items-center gap-3">
              {storeLogo && typeof storeLogo === 'string' && storeLogo.startsWith('http') ? (
                <img src={storeLogo} alt="logo" className="w-12 h-12 rounded-full bg-white p-1 object-contain shrink-0" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-[#3D2314] text-white font-bold text-lg flex items-center justify-center shrink-0">
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
        <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between text-xs sm:text-sm text-gray-600 shadow-2xs">
          <div>
            <span className="text-amber-500 font-bold">★ {storeRating}</span>
            <span className="mx-2">•</span>
            <span>Tiempo prom: {storeTime}</span>
          </div>
          <span className="text-emerald-600 font-medium bg-emerald-50 px-2.5 py-1 rounded-lg">🌱 Eco-Certificado</span>
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
                const prodImg = prod.img || prod.image || prod.imagen || prod.urlImagen

                return (
                  <div
                    key={prodId}
                    onClick={() => navigate(`/product/${prodId}`)}
                    className="bg-white p-3 rounded-xl border border-gray-100 flex gap-3 cursor-pointer hover:shadow-sm transition shadow-2xs"
                  >
                    {prodImg ? (
                      <img
                        src={prodImg}
                        alt={prodName}
                        className="w-20 h-20 rounded-lg object-cover shrink-0 bg-gray-100"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center text-[10px] text-gray-400 shrink-0">
                        Sin imagen
                      </div>
                    )}
                    <div className="flex flex-col justify-between flex-1">
                      <div>
                        <h3 className="font-semibold text-xs sm:text-sm text-gray-800 line-clamp-1">{prodName}</h3>
                        <p className="text-[11px] text-gray-400 line-clamp-2 mt-0.5">{prodDesc}</p>
                      </div>
                      <span className="font-bold text-xs sm:text-sm text-gray-900 mt-1">
                        {typeof prodPrice === 'number' ? `$${prodPrice.toLocaleString()}` : prodPrice}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-xs text-gray-400 py-8 text-center bg-white rounded-xl border border-gray-100">
              Este local aún no tiene platos cargados en el sistema.
            </p>
          )}
        </section>
      </main>
    </div>
  )
}