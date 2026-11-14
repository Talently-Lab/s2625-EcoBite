import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

export default function CheckoutSuccess() {
  const navigate = useNavigate()
  const location = useLocation()
  const producto = location.state?.producto || { nombre: 'Hamburguesa Patagónica', precio: 16750 }
  const total = location.state?.total || 18700

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#3D2314] font-sans p-4 flex flex-col justify-between pb-8">
      {/* Header */}
      <header className="flex items-center justify-between">
        <span className="font-bold text-sm text-[#3D2314]">EcoBite</span>
        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">Completado</span>
      </header>

      {/* Contenido */}
      <main className="max-w-md w-full mx-auto space-y-6 text-center py-4">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Pedido confirmado</h2>
          <p className="text-xs text-gray-500">UN PASITO MÁS</p>
        </div>

        {/* Círculo Éxito */}
        <div className="relative w-40 h-40 mx-auto rounded-full border-4 border-[#EBE3D5] flex flex-col items-center justify-center p-4 shadow-sm bg-white">
          <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2 text-xl font-bold">
            ✓
          </div>
          <span className="text-[10px] text-emerald-700 font-bold">Completado en 00:10</span>
        </div>

        <div className="space-y-1">
          <h1 className="text-lg font-black text-[#2D2320]">¡Tu pedido está confirmado!</h1>
          <p className="text-xs text-gray-500 leading-relaxed">Gracias por elegir una forma más rica de cuidar el planeta.</p>
        </div>

        {/* Tarjeta Detalle */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs space-y-3 text-left">
          <div className="flex justify-between items-center text-xs font-bold border-b border-gray-100 pb-2">
            <span className="text-gray-700">Confirmación completada</span>
            <span className="text-emerald-700">100%</span>
          </div>

          <div className="space-y-2 text-xs text-gray-500">
            <div className="flex justify-between"><span>Verificando tu pago</span><span className="text-emerald-700 font-medium">Listo</span></div>
            <div className="flex justify-between"><span>Procesando pago</span><span className="text-emerald-700 font-medium">Listo</span></div>
            <div className="flex justify-between"><span>Confirmando pago</span><span className="text-emerald-700 font-medium">Listo</span></div>
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img 
                src={producto.imagenUrl || producto.imagen || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60'} 
                alt="" 
                className="w-10 h-10 rounded-lg object-cover"
              />
              <div>
                <p className="text-[10px] text-gray-400">Tu pedido</p>
                <p className="text-xs font-bold text-gray-800">1 {producto.nombre}</p>
              </div>
            </div>
            <span className="text-xs font-bold text-gray-900">${total}</span>
          </div>
        </div>

        <button 
          onClick={() => navigate('/')}
          className="w-full py-3 bg-[#3D2314] hover:bg-[#2A180D] text-white text-xs font-bold rounded-2xl transition shadow-md cursor-pointer"
        >
          Volver al Inicio
        </button>
      </main>
    </div>
  )
}