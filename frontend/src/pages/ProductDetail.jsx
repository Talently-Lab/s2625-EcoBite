import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { restaurantesService } from '../services/restaurantesService'

export default function ProductDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { addToCart } = useCart()

  // Estados para los datos reales del producto
  const [producto, setProducto] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Estados de personalización
  const [selectedMedallon, setSelectedMedallon] = useState('falafel')
  const [selectedPan, setSelectedPan] = useState('clasico')
  const [quantity, setQuantity] = useState(1)

  const opcionesMedallon = [
    { id: 'falafel', nombre: 'Medallón de Falafel', extra: 0 },
    { id: 'girgolas', nombre: 'Medallón de Gírgolas y Porotos Negros', extra: 1200 },
    { id: 'quinoa', nombre: 'Medallón de Quinoa y Calabaza', extra: 1400 },
  ]

  const opcionesPan = [
    { id: 'clasico', nombre: 'Pan Clásico', extra: 0 },
  ]

  // Cargar el producto real desde el backend usando la API de restaurantes/productos
  useEffect(() => {
    async function fetchProductDetail() {
      try {
        setLoading(true)
        setError(null)
        
        // Verificamos si existe el método en el servicio o usamos apiFetch directo si fuera necesario
        const data = await restaurantesService.getProductById ? 
                     await restaurantesService.getProductById(id) : 
                     await restaurantesService.getStoreProducts(id) // Ajuste de respaldo si el servicio varía

        const prodData = data?.data || data
        setProducto(prodData)
      } catch (err) {
        console.error('Error al cargar el detalle del producto:', err)
        setError('No se pudo cargar el producto desde el servidor.')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchProductDetail()
    }
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center text-xs text-gray-500 font-medium">
        Cargando detalle del producto...
      </div>
    )
  }

  if (error || !producto) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] flex flex-col items-center justify-center p-4 text-center space-y-3">
        <p className="text-xs text-amber-800">{error || 'Producto no encontrado.'}</p>
        <button onClick={() => navigate(-1)} className="px-4 py-2 bg-[#3D2314] text-white text-xs rounded-xl cursor-pointer">
          Volver
        </button>
      </div>
    )
  }

  // Precios y cálculos basados estrictamente en propiedades de la API
  const precioBase = Number(producto.precio || producto.price || 0)
  const extraMedallon = opcionesMedallon.find(m => m.id === selectedMedallon)?.extra || 0
  const extraPan = opcionesPan.find(p => p.id === selectedPan)?.extra || 0
  const precioUnitario = precioBase + extraMedallon + extraPan
  const precioTotal = precioUnitario * quantity

  const handleAgregar = () => {
    const productoParaAgregar = {
      id: producto.id || producto._id,
      nombre: producto.nombre || producto.name,
      precio: precioUnitario,
      cantidad: quantity,
      opciones: {
        medallon: opcionesMedallon.find(m => m.id === selectedMedallon)?.nombre,
        pan: opcionesPan.find(p => p.id === selectedPan)?.nombre,
      },
      imagen: producto.imagen || producto.img || producto.image || producto.urlImagen || ''
    }

    if (addToCart) {
      addToCart(productoParaAgregar)
    }
    navigate('/cart')
  }

  const imagenReal = producto.imagen || producto.img || producto.image || producto.urlImagen

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

        {/* Imagen del plato */}
        <div className="w-full h-72 sm:h-80 bg-white overflow-hidden flex items-center justify-center p-4">
          {imagenReal ? (
            <img 
              src={imagenReal} 
              alt={producto.nombre || producto.name} 
              className="w-full h-full object-contain max-w-sm"
            />
          ) : (
            <div className="text-xs text-gray-400">Sin imagen disponible</div>
          )}
        </div>
      </div>

      <main className="max-w-md mx-auto px-4 py-4 space-y-6">
        
        {/* Título y Precio */}
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-4">
          <h1 className="font-bold text-lg sm:text-xl text-[#3D2314] leading-tight">
            {producto.nombre || producto.name}
          </h1>
          <span className="font-bold text-base sm:text-lg text-[#3D2314] shrink-0">
            ${precioBase.toLocaleString()}
          </span>
        </div>

        {/* Descripción */}
        <div className="space-y-1.5 border-b border-gray-100 pb-4">
          <h2 className="font-bold text-sm text-[#3D2314]">Descripción</h2>
          <p className="text-xs text-gray-500 leading-relaxed">
            {producto.descripcion || producto.description || 'Sin descripción disponible.'}
          </p>
        </div>

        {/* Sección Personalizá */}
        <div className="space-y-5">
          <h2 className="font-bold text-sm text-[#3D2314] uppercase tracking-wide">Personalizá</h2>

          {/* Opción Medallones */}
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
                  <span className="font-medium text-gray-600">${opcion.extra}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Opción Pan */}
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
                  <span className="font-medium text-gray-600">${opcion.extra}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Contador y Subtotal */}
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

      {/* Botón Agregar Fijo Inferior */}
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