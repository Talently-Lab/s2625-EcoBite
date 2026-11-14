import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

export default function Cart() {
  const navigate = useNavigate()
  const location = useLocation()

  // Recogemos el producto real que mandamos desde ProductDetail
  const producto = location.state?.producto || {
    nombre: 'Canelones Rellenos de Espinaca y Ricota',
    precio: 135,
    imagenUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=60'
  }

  const [cantidad, setCantidad] = useState(location.state?.cantidad || 1)
  const [servilletas, setServilletas] = useState(false)
  const [utensilios, setUtensilios] = useState(false)

  // URL Base de Render para resolver las imágenes relativas del backend
  const backendUrl = import.meta.env.VITE_API_URL 
    ? import.meta.env.VITE_API_URL.replace('/api', '') 
    : 'https://s2625-ecobite.onrender.com'

  const rawImg = producto.imagenUrl || producto.imagen || producto.urlImagen
  const imgUrl = rawImg 
    ? (rawImg.startsWith('http') ? rawImg : `${backendUrl}${rawImg}`)
    : 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=60'

  const precioUnitario = Number(producto.precio || producto.precioCalculado || 135)
  const costoServilletas = servilletas ? 500 : 0
  const costoUtensilios = utensilios ? 1500 : 0
  const costoEnvio = 1950

  const subtotalProductos = precioUnitario * cantidad
  const totalGeneral = subtotalProductos + costoServilletas + costoUtensilios + costoEnvio

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#3D2314] font-sans pb-28">
      {/* Header */}
      <header className="p-4 flex items-center justify-between bg-[#FAFAF7] sticky top-0 z-20 border-b border-gray-100">
        <button 
          onClick={() => navigate(-1)}
          className="w-9 h-9 flex items-center justify-center bg-white border border-gray-200 rounded-full hover:bg-gray-50 shadow-2xs transition cursor-pointer text-sm font-bold"
        >
          ←
        </button>
        <span className="font-bold text-sm text-[#3D2314]">EcoBite</span>
        <div className="w-9"></div>
      </header>

      {/* Contenido */}
      <main className="max-w-md mx-auto px-4 py-4 space-y-6">
        
        {/* Tu pedido */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-sm text-[#3D2314]">Tu pedido</h2>
            <span className="text-xs text-gray-400 font-medium">{cantidad} producto</span>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-2xs flex items-center gap-3">
            <img 
              src={imgUrl} 
              alt={producto.nombre || producto.name} 
              className="w-16 h-16 rounded-xl object-cover"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=60'
              }}
            />
            <div className="flex-1">
              <h3 className="font-bold text-xs text-gray-900">{producto.nombre || producto.name}</h3>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-2 py-0.5 bg-gray-50">
                  <button onClick={() => setCantidad(Math.max(1, cantidad - 1))} className="text-gray-500 font-bold text-xs cursor-pointer">-</button>
                  <span className="text-xs font-bold w-3 text-center">{cantidad}</span>
                  <button onClick={() => setCantidad(cantidad + 1)} className="text-gray-500 font-bold text-xs cursor-pointer">+</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Utensilios y servilletas biodegradables */}
        <div className="space-y-2">
          <h3 className="font-bold text-xs text-[#3D2314]">Utensilios y servilletas biodegradables</h3>
          <p className="text-[11px] text-gray-400">Pedilos solo si realmente los necesitás.</p>
          
          <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-2xs space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-2.5">
                <input 
                  type="checkbox" 
                  checked={servilletas}
                  onChange={() => setServilletas(!servilletas)}
                  className="accent-[#3D2314] w-4 h-4 rounded cursor-pointer"
                />
                <span className="text-xs text-gray-800 font-medium">Servilletas de papel</span>
              </div>
              <span className="text-xs font-semibold text-gray-600">$500</span>
            </label>

            <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-gray-50">
              <div className="flex items-center gap-2.5">
                <input 
                  type="checkbox" 
                  checked={utensilios}
                  onChange={() => setUtensilios(!utensilios)}
                  className="accent-[#3D2314] w-4 h-4 rounded cursor-pointer"
                />
                <span className="text-xs text-gray-800 font-medium">Utensilios (tenedor + cuchillo)</span>
              </div>
              <span className="text-xs font-semibold text-gray-600">$1500</span>
            </label>
          </div>
        </div>

        {/* Badge CO2 */}
        <div className="bg-[#F8F5F0] border border-[#EBE3D5] p-3.5 rounded-2xl flex items-center gap-3">
          <span className="text-xl">🍃</span>
          <div>
            <p className="text-xs font-bold text-[#3D2314]">3.4 kg CO₂</p>
            <p className="text-[10px] text-gray-600 leading-tight">Al elegir nuestra app, ayudás a mantener el aire de tu ciudad más limpio.</p>
          </div>
        </div>

        {/* Resumen */}
        <div className="space-y-2 bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs">
          <h3 className="font-bold text-xs text-[#3D2314] mb-2">Resumen</h3>
          <div className="flex justify-between text-xs text-gray-600">
            <span>Producto</span>
            <span>${subtotalProductos}</span>
          </div>
          {(servilletas || utensilios) && (
            <div className="flex justify-between text-xs text-gray-600">
              <span>Eco-extras</span>
              <span>${costoServilletas + costoUtensilios}</span>
            </div>
          )}
          <div className="flex justify-between text-xs text-gray-600 pb-2 border-b border-gray-100">
            <span>Envío</span>
            <span>${costoEnvio}</span>
          </div>
          <div className="flex justify-between text-sm font-black text-[#3D2314] pt-1">
            <span>Total</span>
            <span>${totalGeneral}</span>
          </div>
        </div>

      </main>

      {/* Botón Inferior */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-gray-100 z-30">
        <div className="max-w-md mx-auto">
          <button 
            onClick={() => navigate('/checkout/process', { state: { total: totalGeneral, producto, cantidad } })}
            className="w-full py-3.5 bg-[#3D2314] hover:bg-[#2A180D] text-white text-xs font-bold rounded-2xl transition shadow-md flex items-center justify-between px-6 cursor-pointer"
          >
            <span>Confirmar pedido</span>
            <span>${totalGeneral}</span>
          </button>
        </div>
      </div>
    </div>
  )
}