import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

export default function CheckoutProcess() {
  const navigate = useNavigate()
  const location = useLocation()
  const data = location.state || {}

  const [paso, setPaso] = useState(1) // 1: Verificando, 2: Procesando, 3: Confirmando

  useEffect(() => {
    const timer1 = setTimeout(() => setPaso(2), 3000)
    const timer2 = setTimeout(() => setPaso(3), 6000)
    const timer3 = setTimeout(() => {
      navigate('/checkout/success', { state: data })
    }, 9000)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }, [navigate, data])

  const porcentaje = paso === 1 ? 33 : paso === 2 ? 66 : 100

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#3D2314] font-sans p-4 flex flex-col justify-between">
      {/* Header */}
      <header className="flex items-center justify-between">
        <span className="font-bold text-sm text-[#3D2314]">EcoBite</span>
        <span className="text-xs font-semibold text-gray-500">En proceso</span>
      </header>

      {/* Contenido Central */}
      <main className="max-w-md w-full mx-auto space-y-6 text-center py-6">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Confirmación de pedido</h2>
          <p className="text-xs text-gray-500">UN PASITO MÁS</p>
        </div>

        {/* Círculo Animado */}
        <div className="relative w-44 h-44 mx-auto rounded-full border-4 border-[#EBE3D5] flex flex-col items-center justify-center p-4 shadow-sm bg-white">
          <div className="w-16 h-16 rounded-full bg-[#F8F5F0] flex items-center justify-center mb-2">
            <span className="text-2xl">🛍️</span>
          </div>
          <span className="text-[10px] text-gray-400 font-medium">Tiempo transcurrido</span>
          <span className="text-xs font-bold text-[#3D2314]">00:0{paso * 3}</span>
        </div>

        <div className="space-y-1">
          <h1 className="text-lg font-black text-[#2D2320]">Verificando tu pedido</h1>
          <p className="text-xs text-gray-500">Estamos preparando todo para que disfrutes tu próxima comida.</p>
        </div>

        {/* Tarjeta de Progreso */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs space-y-4 text-left">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-gray-700">Estamos con tu pedido...</span>
            <span className="text-gray-900">{porcentaje}%</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className={paso >= 1 ? 'font-bold text-[#3D2314]' : 'text-gray-400'}>Verificando tu pago</span>
              <span className="text-[10px] text-amber-700 font-semibold">{paso === 1 ? 'En curso' : 'Listo'}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className={paso >= 2 ? 'font-bold text-[#3D2314]' : 'text-gray-400'}>Procesando pago</span>
              <span className="text-[10px] text-gray-400">{paso > 2 ? 'Listo' : ''}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className={paso >= 3 ? 'font-bold text-[#3D2314]' : 'text-gray-400'}>Confirmando pedido</span>
              <span className="text-[10px] text-gray-400"></span>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-gray-400">No cierres la app ni vuelvas atrás mientras procesamos tu orden.</p>
      </main>

      <div className="h-6"></div>
    </div>
  )
}