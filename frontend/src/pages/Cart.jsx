import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext' // Conectamos con el contexto global

export default function Cart() {
  const navigate = useNavigate()
  const { cartItems, updateQuantity, removeFromCart, clearCart, subtotal } = useCart()

  const [servilletas, setServilletas] = useState(false)
  const [utensilios, setUtensilios] = useState(false)

  // URL Base de Render para resolver las imágenes relativas del backend
  const backendUrl = import.meta.env.VITE_API_URL 
    ? import.meta.env.VITE_API_URL.replace('/api', '') 
    : 'https://s2625-ecobite.onrender.com'

  const resolveImageUrl = (item) => {
    const rawPath = item?.imagenUrl || item?.imagen || item?.urlImagen || item?.img || item?.image
    if (!rawPath) {
      return 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=60'
    }
    if (rawPath.startsWith('http')) return rawPath
    return `${backendUrl}${rawPath}`
  }

  const costoServilletas = servilletas ? 500 : 0
  const costoUtensilios = utensilios ? 1500 : 0
  const costoEnvio = cartItems.length > 0 ? 1950 : 0

  const totalGeneral = subtotal + costoServilletas + costoUtensilios + costoEnvio
  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0)

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
        
        {/* Carrito Vacío o Listado */}
        {cartItems.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-2xs text-center space-y-4 my-10">
            <span className="text-4xl">🛒</span>
            <div className="space-y-1">
              <h2 className="font-bold text-base text-[#3D2314]">Tu carrito está vacío</h2>
              <p className="text-xs text-gray-400">No tienes productos seleccionados en este momento.</p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="mt-2 px-5 py-3 bg-[#3D2314] hover:bg-[#2A180D] text-white text-xs font-bold rounded-xl transition cursor-pointer inline-block"
            >
              Explorar restaurantes
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h2 className="font-bold text-sm text-[#3D2314]">Tu pedido</h2>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 font-medium">{totalItemsCount} productos</span>
                  <button 
                    onClick={clearCart}
                    className="text-xs font-bold text-red-600 hover:underline cursor-pointer"
                  >
                    Vaciar carrito
                  </button>
                </div>
              </div>

              {cartItems.map((item) => {
                const itemId = item.id || item._id
                const itemName = item.nombre || item.name || 'Producto'
                const itemPrice = Number(item.price || item.precio || 0)
                const itemImg = resolveImageUrl(item)

                return (
                  <div key={itemId} className="bg-white p-3 rounded-2xl border border-gray-100 shadow-2xs flex items-center gap-3">
                    <img 
                      src={itemImg} 
                      alt={itemName} 
                      className="w-16 h-16 rounded-xl object-cover"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=60'
                      }}
                    />
                    <div className="flex-1">
                      <h3 className="font-bold text-xs text-gray-900">{itemName}</h3>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-2 py-0.5 bg-gray-50">
                          <button 
                            onClick={() => updateQuantity(itemId, item.quantity - 1)} 
                            className="text-gray-500 font-bold text-xs cursor-pointer"
                          >
                            -
                          </button>
                          <span className="text-xs font-bold w-3 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(itemId, item.quantity + 1)} 
                            className="text-gray-500 font-bold text-xs cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-xs font-bold text-[#3D2314]">${itemPrice * item.quantity}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
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
                <span>${subtotal}</span>
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
          </>
        )}

      </main>

      {/* Botón Inferior (Solo si hay productos) */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-gray-100 z-30">
          <div className="max-w-md mx-auto">
            <button 
              onClick={() => navigate('/checkout/process', { state: { total: totalGeneral, items: cartItems } })}
              className="w-full py-3.5 bg-[#3D2314] hover:bg-[#2A180D] text-white text-xs font-bold rounded-2xl transition shadow-md flex items-center justify-between px-6 cursor-pointer"
            >
              <span>Confirmar pedido</span>
              <span>${totalGeneral}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}