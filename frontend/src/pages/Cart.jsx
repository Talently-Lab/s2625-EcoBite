import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext' // Ajusta según tu estructura

export default function Cart() {
  const navigate = useNavigate()
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart()

  // Estados opcionales para los utensilios y servilletas
  const [servilletas, setServilletas] = useState(true)
  const [utensilios, setUtensilios] = useState(false)

  // Costos de los opcionales
  const PRECIO_SERVILLETAS = 500
  const PRECIO_UTENSILIOS = 1500
  const PRECIO_ENVIO = 1950

  // Cálculo del subtotal de productos
  const subtotalProductos = cart ? cart.reduce((acc, item) => {
    const precioNumerico = typeof item.price === 'number' 
      ? item.price 
      : Number(item.price.replace(/[^0-9.-]+/g, ''))
    return acc + (precioNumerico * item.quantity)
  }, 0) : 0

  // Extras
  const costoServilletas = servilletas ? PRECIO_SERVILLETAS : 0
  const costoUtensilios = utensilios ? PRECIO_UTENSILIOS : 0

  // Total final
  const totalPedido = subtotalProductos + PRECIO_ENVIO + costoServilletas + costoUtensilios

  // Cantidad total de productos
  const totalProductosCount = cart ? cart.reduce((acc, item) => acc + item.quantity, 0) : 0

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-gray-800 font-sans pb-28">
      {/* Header superior discreto */}
      <header className="bg-[#FAFAF7] border-b border-gray-100 p-4 max-w-md mx-auto flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="text-gray-700 text-sm flex items-center gap-1 cursor-pointer">
          ← Volver
        </button>
        <h1 className="font-bold text-sm text-[#3A2E2B]">Tu pedido</h1>
        <span className="text-xs text-gray-500 font-medium">
          {totalProductosCount} {totalProductosCount === 1 ? 'producto' : 'productos'}
        </span>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-5">
        
        {/* Lista de productos en el carrito */}
        <div className="space-y-3">
          {cart && cart.length > 0 ? (
            cart.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-3 border border-gray-100 shadow-2xs flex items-center justify-between gap-3"
              >
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                  <img
                    src={item.img || item.image || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60'}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold text-xs sm:text-sm text-gray-900 leading-tight">
                    {item.name}
                  </h3>
                  
                  {/* Selector de cantidad (- 1 +) */}
                  <div className="flex items-center gap-3 mt-3 bg-gray-50 border border-gray-200 rounded-full px-2 py-1 w-max">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-5 h-5 flex items-center justify-center text-xs font-bold text-gray-600 hover:text-black cursor-pointer"
                    >
                      –
                    </button>
                    <span className="text-xs font-bold text-gray-800">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-5 h-5 flex items-center justify-center text-xs font-bold text-gray-600 hover:text-black cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-2xs space-y-3">
              <span className="text-3xl">🛒</span>
              <p className="text-xs text-gray-500 font-medium">Tu carrito está vacío</p>
              <Link
                to="/"
                className="inline-block px-4 py-2 bg-[#3D2314] text-white text-xs font-medium rounded-full"
              >
                Explorar el menú
              </Link>
            </div>
          )}
        </div>

        {/* Utensilios y servilletas biodegradables */}
        <section className="space-y-3 pt-2">
          <div>
            <h2 className="font-bold text-sm text-[#2D2320]">Utensilios y servilletas biodegradables</h2>
            <p className="text-[11px] text-gray-400 mt-0.5">Pedilos solo si realmente los necesitas.</p>
          </div>

          <div className="space-y-2 bg-white rounded-2xl p-3 border border-gray-100">
            {/* Opción Servilletas */}
            <label className="flex items-center justify-between cursor-pointer py-1">
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={servilletas}
                  onChange={(e) => setServilletas(e.target.checked)}
                  className="w-4 h-4 accent-[#3D2314] rounded cursor-pointer"
                />
                <span className="text-xs text-gray-700">Servilletas de papel</span>
              </div>
              <span className="text-xs font-semibold text-gray-800">${PRECIO_SERVILLETAS}</span>
            </label>

            <hr className="border-gray-50" />

            {/* Opción Utensilios */}
            <label className="flex items-center justify-between cursor-pointer py-1">
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={utensilios}
                  onChange={(e) => setUtensilios(e.target.checked)}
                  className="w-4 h-4 accent-[#3D2314] rounded cursor-pointer"
                />
                <span className="text-xs text-gray-700">Utensilios (tenedor + cuchillo)</span>
              </div>
              <span className="text-xs font-semibold text-gray-800">${PRECIO_UTENSILIOS}</span>
            </label>
          </div>
        </section>

        {/* Tarjeta de Impacto Ecológico (Huella de CO2) */}
        <div className="bg-[#F5EFE6] border border-[#E8DFC8] rounded-2xl p-3.5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#3D2314]/10 flex items-center justify-center shrink-0">
            <span className="text-lg">🍃</span>
          </div>
          <div>
            <h4 className="font-bold text-xs text-[#3D2314]">3.4 kg CO₂</h4>
            <p className="text-[10px] text-[#6B5A4B] leading-tight mt-0.5">
              Al elegir nuestra app, ayudás a mantener el aire de tu ciudad más limpio.
            </p>
          </div>
        </div>

        {/* Resumen de Costos */}
        <section className="space-y-2 pt-2">
          <h2 className="font-bold text-sm text-[#2D2320]">Resumen</h2>

          <div className="bg-white rounded-2xl p-3.5 border border-gray-100 space-y-2 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Producto</span>
              <span className="font-semibold text-gray-800">${subtotalProductos.toLocaleString()}</span>
            </div>

            <div className="flex justify-between">
              <span>Envío</span>
              <span className="font-semibold text-gray-800">${PRECIO_ENVIO.toLocaleString()}</span>
            </div>

            {servilletas && (
              <div className="flex justify-between">
                <span>Servilletas</span>
                <span className="font-semibold text-gray-800">${PRECIO_SERVILLETAS}</span>
              </div>
            )}

            {utensilios && (
              <div className="flex justify-between">
                <span>Utensilios</span>
                <span className="font-semibold text-gray-800">${PRECIO_UTENSILIOS}</span>
              </div>
            )}
          </div>
        </section>

      </main>

      {/* Botón inferior fijo para Confirmar Pedido */}
      {cart && cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-100 p-4 z-30">
          <div className="max-w-md mx-auto">
            <button
              onClick={() => {
                alert('¡Pedido confirmado! Redirigiendo a tu impacto...')
                clearCart()
                navigate('/profile')
              }}
              className="w-full py-3.5 bg-[#3D2314] hover:bg-[#2A180D] text-white font-semibold rounded-2xl shadow-md transition flex items-center justify-between px-6 cursor-pointer"
            >
              <span>Confirmar pedido</span>
              <span className="text-base">${totalPedido.toLocaleString()}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}