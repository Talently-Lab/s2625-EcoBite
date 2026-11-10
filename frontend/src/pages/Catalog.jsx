import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export default function Catalog() {
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true)
        // Aquí puedes cambiar la ruta según el endpoint 
        // (Ej: /api/restaurants o /api/stores)
        const response = await fetch('/api/restaurants')
        
        if (!response.ok) {
          throw new Error('No se pudieron cargar los restaurantes')
        }
        
        const data = await response.json()
        setRestaurants(data)
      } catch (error) {
        console.error('Error al conectar con el backend:', error)
        // Por las dudas, si falla o aún no está arriba el endpoint, 
        // puedes dejar un array vacío o un fallback
        setRestaurants([])
      } finally {
        setLoading(false)
      }
    }

    fetchRestaurants()
  }, [])

  return (
    <div className="min-h-screen bg-white text-gray-900 max-w-md mx-auto border-x border-gray-100 font-sans pb-12">
      {/* Header */}
      <header className="px-4 py-3 flex items-center justify-between border-b border-gray-100 sticky top-0 bg-white z-10">
        <Link to="/" className="text-xl">←</Link>
        <span className="font-bold text-base text-gray-900">Restaurantes</span>
        <Link to="/cart" className="text-lg">🛒</Link>
      </header>

      <main className="p-4 space-y-4">
        {/* Buscador y filtro de vista */}
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Filtrar"
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none"
            />
            <span className="absolute left-3 top-2.5 text-gray-400 text-sm">🔍</span>
          </div>
          <button className="p-2 border border-gray-200 rounded-xl text-sm">⊞</button>
        </div>

        {/* Chips de filtro */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar text-xs font-medium py-1">
          <button className="px-3 py-1.5 rounded-lg border border-gray-200 whitespace-nowrap">Recomendados</button>
          <button className="px-3 py-1.5 rounded-lg border border-gray-200 whitespace-nowrap">Eco Score</button>
          <button className="px-3 py-1.5 bg-black text-white font-semibold rounded-lg whitespace-nowrap">Distancia</button>
          <button className="px-3 py-1.5 rounded-lg border border-gray-200 whitespace-nowrap">Mejores valorados</button>
        </div>

        <p className="text-xs text-gray-500 font-medium">
          {loading ? 'Buscando restaurantes...' : `${restaurants.length} restaurantes cerca tuyo`}
        </p>

        {/* Estado de carga */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <span className="loading loading-spinner loading-md text-primary">Cargando...</span>
          </div>
        ) : (
          /* Grilla de Restaurantes */
          <div className="grid grid-cols-2 gap-3">
            {restaurants.length > 0 ? (
              restaurants.map((res) => (
                <Link
                  to={`/product/${res.id}`}
                  key={res.id}
                  className="border border-gray-200 rounded-xl p-2.5 bg-white space-y-2 block relative hover:shadow-sm transition"
                >
                  {/* Badge EcoScore */}
                  <span className="absolute top-2 right-2 text-[10px] font-bold bg-gray-100 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                    🍃 {res.ecoScore}
                  </span>

                  {/* Placeholder Imagen (Aquí se conectará la foto real cuando Brandon pase la ruta) */}
                  <div className="h-24 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 overflow-hidden">
                    {res.image ? (
                      <img src={res.image} alt={res.name} className="w-full h-full object-cover" />
                    ) : (
                      '🍴'
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold text-xs text-gray-900 leading-snug">{res.name}</h3>
                    <div className="flex items-center justify-between text-[10px] text-gray-500 mt-1">
                      <span>★ {res.rating}</span>
                      <span>{res.distance}</span>
                    </div>
                    <span className="inline-block mt-2 text-[10px] border border-gray-300 rounded px-2 py-0.5 text-gray-700 font-medium">
                      {res.tag}
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-2 text-center py-10 text-gray-500 text-xs">
                No se encontraron restaurantes disponibles en este momento.
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}