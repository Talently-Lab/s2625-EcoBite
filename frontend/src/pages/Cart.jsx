import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function Cart() {
  const { cart, removeFromCart, clearCart, totalPrice } = useCart()
  const navigate = useNavigate()

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] flex flex-col items-center justify-center p-4 text-center">
        <div className="text-4xl mb-3">🛒</div>
        <h2 className="text-base font-bold text-gray-800 mb-1">Tu carrito está vacío</h2>
        <p className="text-xs text-gray-500 mb-4">Agrega productos sustentables desde los locales para comenzar.</p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-[#BA8B5C] text-white rounded-xl text-xs font-semibold cursor-pointer"
        >
          Explorar locales
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-gray-800 font-sans pb-24">
      <div className="max-w-2xl mx-auto px-4 py-4">
        <h1 className="text-lg font-bold text-gray-900 mb-4">Tu Carrito EcoBite</h1>

        <div className="space-y-3 mb-6">
          {cart.map((item) => (
            <div key={item.id} className="bg-white p-3 rounded-xl border border-gray-100 flex items-center justify-between gap-3 shadow-2xs">
              <img src={item.img || item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover bg-gray-100 shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-xs text-gray-900 line-clamp-1">{item.name}</h3>
                <p className="text-[11px] text-gray-400">Cantidad: {item.quantity}</p>
                <span className="font-bold text-xs text-gray-900">{item.price}</span>
              </div>
              <button
                onClick={() => removeFromCart(item.id)}
                className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 cursor-pointer"
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>

        {/* Resumen de costos */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 space-y-2 text-xs">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>${totalPrice.toLocaleString('es-AR')}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Envio eco-friendly</span>
            <span className="text-emerald-600 font-medium">Gratis</span>
          </div>
          <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-sm text-gray-900">
            <span>Total</span>
            <span>${totalPrice.toLocaleString('es-AR')}</span>
          </div>
        </div>
      </div>

      {/* Botones de acción fija */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 shadow-lg">
        <div className="max-w-2xl mx-auto flex gap-3">
          <button
            onClick={clearCart}
            className="px-4 py-3 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
          >
            Vaciar
          </button>
          <button
            onClick={() => alert('¡Pedido realizado con éxito! Gracias por elegir EcoBite 🌱')}
            className="flex-1 py-3 bg-[#BA8B5C] hover:bg-[#a67a4e] text-white rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Finalizar Pedido (${totalPrice.toLocaleString('es-AR')})
          </button>
        </div>
      </div>
    </div>
  )
}