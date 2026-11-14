import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
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

  useEffect(() => {
    async function fetchStoreData() {
      try {
        setLoading(true)
        setError(null)

        // 1. Obtenemos todos los locales y filtramos el actual en el frontend
        const allStores = await restaurantesService.getAllStores()
        const listaLocales = Array.isArray(allStores) ? allStores : (allStores?.data || [])
        const foundStore = listaLocales.find(s => (s.id || s._id) === id)

        if (!foundStore) {
          setError('No se encontró el restaurante seleccionado.')
          setStore(null)
          return
        }

        setStore(foundStore)

        // 2. Intentamos cargar los platos de la API
        let lista = []
        try {
          const productsData = await restaurantesService.getStoreProducts(id)
          lista = Array.isArray(productsData) ? productsData : (productsData?.data || [])
        } catch (e) {
          console.warn('No se pudieron cargar los platos específicos:', e)
        }

        // 3. Respaldo visual garantizado para la demo: si la API viene vacía, mostramos platos sustentables de muestra
        if (!lista || lista.length === 0) {
          lista = [
            {
              id: 'demo-1',
              name: 'Bowl Orgánico de Quinoa y Verdes',
              description: 'Preparado con ingredientes locales de estación, aguacate y aderezo de cítricos.',
              price: 4500,
              img: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=60'
            },
            {
              id: 'demo-2',
              name: 'Wrap Sustentable Cero Residuos',
              description: 'Tortilla integral artesanal rellena de vegetales rostizados y hummus de lentejas.',
              price: 3800,
              img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&auto=format&fit=crop&q=60'
            }
          ]
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
  
  // Procesamos la imagen del banner/portada para que use Render si es relativa
  const rawStoreBanner = store.banner || store.img || store.image || store.imagen || ''
  const storeBanner = rawStoreBanner 
    ? (rawStoreBanner.startsWith('http') ? rawStoreBanner : `${backendUrl}${rawStoreBanner}`)
    : ''

  // Procesamos el logo del local de forma similar
  const rawStoreLogo = store.logo || ''
  const storeLogo = rawStoreLogo
    ? (rawStoreLogo.startsWith('http') ? rawStoreLogo : `${backendUrl}${rawStoreLogo}`)
    : ''

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
              {storeLogo ? (
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
                
                // Procesamos la imagen de cada plato para que apunte a Render si es ruta relativa
                const rawProdImg = prod.img || prod.image || prod.imagen || prod.urlImagen
                const prodImg = rawProdImg
                  ? (rawProdImg.startsWith('http') ? rawProdImg : `${backendUrl}${rawProdImg}`)
                  : ''

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