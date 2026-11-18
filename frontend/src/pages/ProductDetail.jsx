import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useCart } from '../context/CartContext' 

export default function ProductDetail() {
  const navigate = useNavigate()
  const location = useLocation()
  const { addToCart } = useCart() 

  // Producto recibido estrictamente por navegación (sin fallback de mock estático)
  const producto = location.state?.producto || null

  // Estados para personalización y cantidad
  const [cantidad, setCantidad] = useState(location.state?.cantidad || 1)
  const [adicionalSeleccionado, setAdicionalSeleccionado] = useState(0) 

  // URL Base de Render para resolver las imágenes relativas del backend
  const backendUrl = import.meta.env.VITE_API_URL 
    ? import.meta.env.VITE_API_URL.replace('/api', '') 
    : 'https://s2625-ecobite.onrender.com'

  const rawImg = producto?.imagenUrl || producto?.imagen || producto?.urlImagen
  const imgUrl = rawImg 
    ? (rawImg.startsWith('http') ? rawImg : `${backendUrl}${rawImg}`)
    : 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=60'

  const nombreProd = producto?.nombre || producto?.name || 'Detalle del producto'
  const descProd = producto?.descripcion || producto?.description || 'Elaborado con ingredientes sustentables de la red.'
  
  const precioBase = Number(producto?.precio || producto?.price || 0)
  const precioTotal = (precioBase + adicionalSeleccionado) * cantidad

  // Si no viene producto por state, mostramos estado limpio para evitar fallos
  if (!producto) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center space-y-4 max-w-sm w-full">
          <span className="text-4xl">⚠️</span>
          <h2 className="font-bold text-sm text-[#3D2314]">No se encontró el producto</h2>
          <p className="text-xs text-gray-500">Selecciona un plato desde el catálogo para ver su detalle.</p>
          <button 
            onClick={() => navigate('/catalog')}
            className="w-full py-3 bg-[#3D2314] text-white text-xs font-bold rounded-xl cursor-pointer"
          >
            Ir al Catálogo
          </button>
        </div>
      </div>
    )
  }

  const handleAgregarAlCarrito = () => {
    // 3. Preparamos el objeto unificado con el precio total calculado
    const productoParaCarrito = {
      ...producto,
      price: precioTotal,
      precio: precioTotal,
      precioCalculado: precioTotal
    }

    // 4. Guardamos formalmente en el contexto global / localStorage
    addToCart(productoParaCarrito, cantidad)

    // 5. Navegamos al carrito enviando también el state por compatibilidad visual
    navigate('/cart', { 
      state: { 
        producto: productoParaCarrito,
        cantidad: cantidad 
      } 
    })
  }

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#3D2314] font-sans pb-28">
      {/* Contenedor adaptado: se ve como mobile en celulares y como una tarjeta prolija centrada en desktop */}
      <div className="max-w-md sm:max-w-xl mx-auto sm:my-6 sm:bg-white sm:rounded-3xl sm:shadow-lg sm:border sm:border-gray-100 overflow-hidden">
        
        {/* Header con botón Volver */}
        <header className="p-4 flex items-center bg-transparent">
          <button 
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center bg-white border border-gray-200 rounded-full hover:bg-gray-50 shadow-2xs transition cursor-pointer text-sm font-bold"
          >
            ←
          </button>
        </header>

        {/* Contenido principal del Detalle */}
        <main className="px-4 pb-6 space-y-6">
          
          {/* Imagen destacada */}
          <div className="w-full h-72 sm:h-80 rounded-3xl overflow-hidden bg-white shadow-xs border border-gray-100">
            <img src={imgUrl} alt={nombreProd} className="w-full h-full object-cover" />
          </div>

          {/* Título y Precio */}
          <div className="flex justify-between items-start gap-4">
            <h1 className="text-xl font-black text-[#2D2320] leading-tight">{nombreProd}</h1>
            <span className="text-xl font-black text-[#2D2320] shrink-0">${precioBase}</span>
          </div>

          {/* Sección Descripción */}
          <div className="space-y-1.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">Descripción</h2>
            <p className="text-xs text-gray-600 leading-relaxed">
              {descProd}
            </p>
          </div>

          {/* Impacto ecológico */}
          <div className="p-3 bg-[#E8F3ED] border border-emerald-200 rounded-2xl space-y-1 text-xs text-emerald-800">
            <span className="font-bold">🌱 Impacto Ecológico:</span>
            <p>Incluye recipiente reutilizable y empaque sustentable.</p>
          </div>

          {/* Sección Personalizá */}
          <div className="space-y-4 pt-2 border-t border-gray-100">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">Personalizá</h2>

            <div className="space-y-2">
              <h3 className="text-[11px] font-bold text-gray-700 uppercase">Opciones adicionales</h3>
              <div className="space-y-2 bg-gray-50/60 p-3 rounded-2xl border border-gray-100">
                {[
                  { label: 'Salsa especial artesanal', extra: 300 },
                  { label: 'Bebida mediana', extra: 800 },
                ].map((opt, idx) => (
                  <label key={idx} className="flex items-center justify-between cursor-pointer py-1">
                    <div className="flex items-center gap-2.5">
                      <input 
                        type="checkbox" 
                        checked={adicionalSeleccionado === opt.extra}
                        onChange={() => setAdicionalSeleccionado(adicionalSeleccionado === opt.extra ? 0 : opt.extra)}
                        className="accent-[#3D2314] w-4 h-4 cursor-pointer" 
                      />
                      <span className="text-xs text-gray-800 font-medium">{opt.label}</span>
                    </div>
                    <span className="text-xs font-semibold text-gray-600">+${opt.extra}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Selector de Cantidad y Total */}
          <div className="flex items-center justify-between bg-gray-50/60 p-3 rounded-2xl border border-gray-100">
            <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-3 py-1.5 bg-white">
              <button 
                onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                className="text-gray-500 font-bold px-1 hover:text-black cursor-pointer"
              >
                -
              </button>
              <span className="text-xs font-bold w-4 text-center">{cantidad}</span>
              <button 
                onClick={() => setCantidad(cantidad + 1)}
                className="text-gray-500 font-bold px-1 hover:text-black cursor-pointer"
              >
                +
              </button>
            </div>
            <span className="text-xs font-bold text-gray-800">Total: ${precioTotal}</span>
          </div>

        </main>
      </div>

      {/* Botón flotante inferior */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-gray-100 z-30">
        <div className="max-w-md sm:max-w-xl mx-auto">
          <button 
            onClick={handleAgregarAlCarrito}
            className="w-full py-3.5 bg-[#3D2314] hover:bg-[#2A180D] text-white text-xs font-bold rounded-2xl transition shadow-md flex items-center justify-between px-6 cursor-pointer"
          >
            <span>Agregar</span>
            <span>${precioTotal}</span>
          </button>
        </div>
      </div>
    </div>
  )
}