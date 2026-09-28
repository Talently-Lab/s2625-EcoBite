export default function FoodCard({ title, store, originalPrice, discountPrice, pickupTime, image, tags }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition overflow-hidden group flex flex-col">
      {/* Imagen & Badges */}
      <div className="relative h-44 bg-gray-100 overflow-hidden">
        <img
          src={image || "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=60"}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
        />
        <div className="absolute top-3 left-3 bg-ecobrand-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
          -50% ECO
        </div>
      </div>

      {/* Contenido */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{store}</span>
          <h3 className="font-semibold text-gray-800 text-base leading-snug mt-0.5 mb-2 group-hover:text-ecobrand-700 transition">
            {title}
          </h3>

          {/* Horario de Retiro */}
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3 bg-gray-50 p-2 rounded-lg">
            <span>⏰</span>
            <span>Retiro: {pickupTime || "18:00 - 20:00 hs"}</span>
          </div>
        </div>

        {/* Precios y Botón */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-50">
          <div>
            <span className="text-xs text-gray-400 line-through mr-1.5">${originalPrice}</span>
            <span className="text-lg font-bold text-ecobrand-700">${discountPrice}</span>
          </div>

          <button className="bg-ecobrand-500 hover:bg-ecobrand-600 text-white text-xs font-semibold px-3 py-2 rounded-xl transition shadow-sm active:scale-95">
            Agregar
          </button>
        </div>
      </div>
    </div>
  )
}