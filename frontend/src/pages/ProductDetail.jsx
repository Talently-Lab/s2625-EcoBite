import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext' // Ajusta según tu ruta

export default function ProductDetail() {
  const navigate = useNavigate()
  const { addToCart } = useCart()

  // Estados de personalización según el Figma
  const [selectedMedallon, setSelectedMedallon] = useState('falafel')
  const [selectedPan, setSelectedPan] = useState('clasico')
  const [quantity, setQuantity] = useState(1)

  // Precios base y opcionales
  const precioBase = 16750

  const opcionesMedallon = [
    { id: 'falafel', nombre: 'Medallón de Falafel', extra: 0 },
    { id: 'girgolas', nombre: 'Medallón de Gírgolas y Porotos Negros', extra: 1200 },
    { id: 'quinoa', nombre: 'Medallón de Quinoa y Calabaza', extra: 1400 },
  ]

  const opcionesPan = [
    { id: 'clasico', nombre: 'Pan Clásico', extra: 0 },
  ]

  // Calcular precio extra acumulado
  const extraMedallon = opcionesMedallon.find(m => m.id === selectedMedallon)?.extra || 0
  const extraPan = opcionesPan.find(p => p.id === selectedPan)?.extra || 0
  const precioUnitario = precioBase + extraMedallon + extraPan
  const precioTotal = precioUnitario * quantity

  const handleAgregar = () => {
    const productoParaAgregar = {
      id: 104,
      name: 'Hamburguesa Patagónica',
      price: precioUnitario,
      quantity: quantity,
      options: {
        medallon: opcionesMedallon.find(m => m.id === selectedMedallon)?.nombre,
        pan: opcionesPan.find(p => p.id === selectedPan)?.nombre,
      },
      img: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&auto=format&fit=crop&q=60'
    }

    if (addToCart) {
      addToCart(productoParaAgregar)
    }
    navigate('/cart')
  }

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#3D2314] font-sans pb-28">
      
      {/* Botón Volver */}
      <div className="relative">
        <button 
          onClick={() => navigate(-1)} 
          className="absolute top-4 left-4 z-10 w-9 h-9 bg-white/80 backdrop-blur-xs rounded-full flex items-center justify-center text-sm font-bold shadow-sm hover:bg-white transition cursor-pointer"
        >
          ←
        </button>

        {/* Imagen Principal */}
        <div className="w-full h-72 sm:h-80 bg-white overflow-hidden flex items-center justify-center p-4">
          <img 
            src="https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&auto=format&fit=crop&q=80" 
            alt="Hamburguesa Patagónica" 
            className="w-full h-full object-contain max-w-sm"
          />
        </div>
      </div>

      <main className="max-w-md mx-auto px-4 py-4 space-y-6">
        
        {/* Título y Precio Principal */}
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-4">
          <h1 className="font-bold text-lg sm:text-xl text-[#3D2314] leading-tight">
            Hamburguesa Patagónica
          </h1>
          <span className="font-bold text-base sm:text-lg text-[#3D2314] shrink-0">
            ${precioBase.toLocaleString()}
          </span>
        </div>

        {/* Descripción */}
        <div className="space-y-1.5 border-b border-gray-100 pb-4">
          <h2 className="font-bold text-sm text-[#3D2314]">Descripción</h2>
          <p className="text-xs text-gray-500 leading-relaxed">
            Pan brioche, mayonesa vegana, medallón de falafel, salteado de hongos, cebolla morada y queso a base de almendras.
          </p>
        </div>

        {/* Sección Personalizá */}
        <div className="space-y-5">
          <h2 className="font-bold text-sm text-[#3D2314] uppercase tracking-wide">Personalizá</h2>

          {/* Opción 1: MEDALLONES */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-[#8C6D58] uppercase tracking-wider">MEDALLONES</h3>
            <div className="space-y-1">
              {opcionesMedallon.map((opcion) => (
                <label 
                  key={opcion.id}
                  onClick={() => setSelectedMedallon(opcion.id)}
                  className="flex items-center justify-between py-2 border-b border-gray-100 cursor-pointer text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedMedallon === opcion.id ? 'border-[#3D2314]' : 'border-gray-300'}`}>
                      {selectedMedallon === opcion.id && <div className="w-2 h-2 rounded-full bg-[#3D2314]" />}
                    </div>
                    <span className="text-gray-700">{opcion.nombre}</span>
                  </div>
                  <span className="font-medium text-gray-600">
                    ${opcion.extra}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Opción 2: PAN */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-[#8C6D58] uppercase tracking-wider">PAN</h3>
            <div className="space-y-1">
              {opcionesPan.map((opcion) => (
                <label 
                  key={opcion.id}
                  onClick={() => setSelectedPan(opcion.id)}
                  className="flex items-center justify-between py-2 border-b border-gray-100 cursor-pointer text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedPan === opcion.id ? 'border-[#3D2314]' : 'border-gray-300'}`}>
                      {selectedPan === opcion.id && <div className="w-2 h-2 rounded-full bg-[#3D2314]" />}
                    </div>
                    <span className="text-gray-700">{opcion.nombre}</span>
                  </div>
                  <span className="font-medium text-gray-600">
                    ${opcion.extra}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Contador de Cantidad y Subtotal */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-2xl px-3 py-1.5 shadow-2xs">
            <button 
              onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
              className="w-6 h-6 flex items-center justify-center text-sm font-bold text-gray-600 hover:text-black cursor-pointer"
            >
              –
            </button>
            <span className="text-xs font-bold text-gray-800">{quantity}</span>
            <button 
              onClick={() => setQuantity(prev => prev + 1)}
              className="w-6 h-6 flex items-center justify-center text-sm font-bold text-gray-600 hover:text-black cursor-pointer"
            >
              +
            </button>
          </div>

          <div className="text-right">
            <span className="text-xs font-bold text-[#3D2314]">Total: ${precioTotal.toLocaleString()}</span>
          </div>
        </div>

      </main>

      {/* Botón Agregar Fijo Inferior estilo Figma */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-100 p-4 z-30">
        <div className="max-w-md mx-auto">
          <button
            onClick={handleAgregar}
            className="w-full py-3.5 bg-[#3D2314] hover:bg-[#2A180D] text-white font-semibold rounded-2xl shadow-md transition flex items-center justify-between px-6 cursor-pointer"
          >
            <span>Agregar</span>
            <span className="text-base">${precioTotal.toLocaleString()}</span>
          </button>
        </div>
      </div>

    </div>
  )
}