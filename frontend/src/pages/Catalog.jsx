import { Link } from 'react-router-dom'

export default function Catalog() {
  const restaurants = [
    { id: 1, name: 'Santa Calma', ecoScore: 95, rating: 4.7, distance: '0.8 km', tag: 'Vegano' },
    { id: 2, name: 'Rincón Verde', ecoScore: 94, rating: 4.7, distance: '1.2 km', tag: 'Vegetariano' },
    { id: 3, name: 'San Pietro', ecoScore: 84, rating: 4.5, distance: '1.4 km', tag: 'Cero residuos' },
    { id: 4, name: 'Sampa', ecoScore: 88, rating: 4.8, distance: '1.2 km', tag: 'Vegetariano' },
  ]

  return (
    <div className="min-h-screen bg-white text-gray-900 max-w-md mx-auto border-x border-gray-100 font-sans pb-12">
      {/* Header */}
      <header className="px-4 py-3 flex items-center justify-between border-b border-gray-100 sticky top-0 bg-white z-10">
        <Link to="/" className="text-xl">←</Link>
        <span className="font-bold text-base text-gray-900">Restaurantes</span>
        <button className="text-lg">🛒</button>
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
// ✅ DESPUÉS (Corregido):
<button className="px-3 py-1.5 bg-black text-white font-semibold rounded-lg whitespace-nowrap">Distancia</button>
          <button className="px-3 py-1.5 rounded-lg border border-gray-200 whitespace-nowrap">Mejores valorados</button>
        </div>

        <p className="text-xs text-gray-500 font-medium">48 restaurantes cerca tuyo</p>

        {/* Grilla de Restaurantes */}
        <div className="grid grid-cols-2 gap-3">
          {restaurants.map((res) => (
            <Link
              to={`/product/${res.id}`}
              key={res.id}
              className="border border-gray-200 rounded-xl p-2.5 bg-white space-y-2 block relative hover:shadow-sm transition"
            >
              {/* Badge EcoScore */}
              <span className="absolute top-2 right-2 text-[10px] font-bold bg-gray-100 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                🍃 {res.ecoScore}
              </span>

              {/* Placeholder Imagen */}
              <div className="h-24 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                🍴
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
          ))}
        </div>
      </main>
    </div>
  )
}