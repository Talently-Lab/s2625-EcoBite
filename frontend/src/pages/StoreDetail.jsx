import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { storesService } from '../services/storesService'

// Datos mock de respaldo si falla el backend
const STORE_MOCK = {
  id: '1',
  name: "McDonald's",
  category: 'Hamburguesas & Papas',
  rating: '4.6',
  time: '20-30 min',
  address: 'Av. Corrientes 1234',
  description: 'Comida rápida con opciones sustentables y empaques compostables.',
  banner: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=60',
  logo: 'https://upload.wikimedia.org/wikipedia/commons/3/36/McDonald%27s_Golden_Arches.svg'
}

const PRODUCTS_MOCK = [
  {
    id: 101,
    name: 'Cuarto de Libra con Queso + Papas',
    price: '$12.460',
    description: 'Hamburguesa con medallón de carne, queso cheddar, cebolla y pepinillos.',
    img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 102,
    name: 'McNuggets x10 Veggie',
    price: '$8.900',
    description: 'Nuggets a base de plantas con empaque 100% reciclable.',
    img: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=500&auto=format&fit=crop&q=60'
  }
]

export default function StoreDetail() {
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

        // Traemos los datos del restaurante y sus productos en paralelo
        const [storeRes, productsRes] = await Promise.allSettled([
          storesService.getStoreById(id),
          storesService.getStoreProducts(id)
        ])

        if (storeRes.status === 'fulfilled' && storeRes.value) {
          setStore(storeRes.value)
        } else {
          setStore(STORE_MOCK)
        }

        if (productsRes.status === 'fulfilled' && productsRes.value && productsRes.value.length > 0) {
          setProducts(productsRes.value)
        } else {
          setProducts(PRODUCTS_MOCK)
        }
      } catch (err) {
        console.warn('Error al cargar datos del local, usando mock:', err)
        setError('Cargando información guardada...')
        setStore(STORE_MOCK)
        setProducts(PRODUCTS_MOCK)
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
      <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center text-sm text-gray-500 font-medium">
        Cargando local...
      </div>
    )
  }

  if (!store) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] flex flex-col items-center justify-center p-4">
        <p className="text-gray-600 mb-4">No se encontró el restaurante seleccionado.</p>
        <Link to="/" className="px-4 py-2 bg-[#BA8B5C] text-white rounded-xl text-sm font-medium">
          Volver al Inicio
        </Link>
      </div>
    )
  }

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
        <div className="relative rounded-2xl overflow-hidden bg-gray-200 h-40 sm:h-56">
          <img
            src={store.banner || store.img || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=60'}
            alt={store.name}
            className="w-full h-full object-cover"
          />
<div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent flex items-end p-4">
            <div className="text-white flex items-center gap-3">
              {store.logo && typeof store.logo === 'string' && store.logo.startsWith('http') ? (
                <img src={store.logo} alt="logo" className="w-12 h-12 rounded-full bg-white p-1 object-contain shrink-0" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-red-600 text-white font-bold text-lg flex items-center justify-center shrink-0">
                  {store.name?.charAt(0) || 'E'}
                </div>
              )}
              <div>
                <h1 className="text-xl sm:text-2xl font-bold">{store.name}</h1>
                <p className="text-xs text-gray-200">{store.category} • {store.address || 'Local sustentable'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Info adicional */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between text-xs sm:text-sm text-gray-600">
          <div>
            <span className="text-amber-500 font-bold">★ {store.rating || '4.6'}</span>
            <span className="mx-2">•</span>
            <span>Tiempo prom: {store.time || '20-30 min'}</span>
          </div>
          <span className="text-emerald-600 font-medium bg-emerald-50 px-2.5 py-1 rounded-lg">🌱 Eco-Certificado</span>
        </div>

        {/* Carta / Menú */}
        <section className="space-y-3">
          <h2 className="font-bold text-base text-[#2D2320] border-b border-gray-100 pb-2">Menú disponible</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {products.map((prod) => (
              <div
                key={prod.id}
                onClick={() => navigate(`/product/${prod.id}`)}
                className="bg-white p-3 rounded-xl border border-gray-100 flex gap-3 cursor-pointer hover:shadow-xs transition"
              >
                <img
                  src={prod.img || prod.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&auto=format&fit=crop&q=60'}
                  alt={prod.name}
                  className="w-20 h-20 rounded-lg object-cover shrink-0 bg-gray-100"
                />
                <div className="flex flex-col justify-between flex-1">
                  <div>
                    <h3 className="font-semibold text-xs sm:text-sm text-gray-800 line-clamp-1">{prod.name}</h3>
                    <p className="text-[11px] text-gray-400 line-clamp-2 mt-0.5">{prod.description}</p>
                  </div>
                  <span className="font-bold text-xs sm:text-sm text-gray-900 mt-1">
                    {typeof prod.price === 'number' ? `$${prod.price}` : prod.price}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}