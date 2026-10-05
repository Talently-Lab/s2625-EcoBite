import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { productsService } from '../services/productsService'
import { useCart } from '../context/CartContext' // <-- Importamos el contexto

// Datos mock de respaldo si falla el backend
const PRODUCT_MOCK = {
  id: 101,
  name: 'Cuarto de Libra con Queso + Papas medianas',
  store: "McDonald's",
  price: '$12.460',
  originalPrice: '$14.000',
  rating: '4.3',
  shipping: 'Gratis',
  description: 'Hamburguesa con medallón de carne, queso cheddar, cebolla y pepinillos. Incluye papas medianas en empaque 100% compostable.',
  img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=60',
  category: 'Hamburguesas & Papas'
}

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart() // <-- Usamos la función para guardar en el carrito

  const [product, setProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true)
        setError(null)

        const data = await productsService.getProductById(id)
        if (data) {
          setProduct(data)
        } else {
          setProduct(PRODUCT_MOCK)
        }
      } catch (err) {
        console.warn('Error al cargar producto, usando mock:', err)
        setError('Cargando información guardada...')
        setProduct(PRODUCT_MOCK)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchProduct()
    }
  }, [id])

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity) // <-- Guarda el producto con la cantidad seleccionada
      setAdded(true)
      setTimeout(() => setAdded(false), 2000)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center text-sm text-gray-500 font-medium">
        Cargando producto...
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] flex flex-col items-center justify-center p-4">
        <p className="text-gray-600 mb-4">No se encontró el producto.</p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-[#BA8B5C] text-white rounded-xl text-sm font-medium"
        >
          Volver al Inicio
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-gray-800 font-sans pb-24">
      {/* Botón Volver */}
      <div className="max-w-3xl mx-auto px-4 py-3">
        <button
          onClick={() => navigate(-1)}
          className="text-xs font-semibold text-gray-600 hover:text-gray-900 flex items-center gap-1 cursor-pointer"
        >
          ← Volver
        </button>
      </div>

      <main className="max-w-3xl mx-auto px-4 space-y-6">
        {/* Imagen principal */}
        <div className="h-64 sm:h-80 rounded-2xl overflow-hidden bg-gray-100 border border-gray-100 shadow-2xs">
          <img
            src={product.img || product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Detalle del Producto */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-xs text-amber-800 font-medium bg-amber-50 px-2 py-0.5 rounded-md">
                {product.store || 'Restaurante'}
              </span>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 mt-1">{product.name}</h1>
            </div>
            <div className="text-right shrink-0">
              <span className="text-lg font-bold text-gray-900 block">
                {typeof product.price === 'number' ? `$${product.price}` : product.price}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-gray-400 line-through block">{product.originalPrice}</span>
              )}
            </div>
          </div>

          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            {product.description || 'Sin descripción disponible.'}
          </p>

          <div className="flex items-center gap-4 text-xs text-gray-500 pt-2 border-t border-gray-100">
            <span className="text-amber-500 font-bold">★ {product.rating || '4.5'}</span>
            <span>•</span>
            <span className="text-emerald-600 font-medium">Envío {product.shipping || 'Gratis'}</span>
            <span>•</span>
            <span>🌱 Empaque Compostable</span>
          </div>
        </div>

        {/* Selector de Cantidad */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-700">Cantidad</span>
          <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="text-gray-600 hover:text-gray-900 font-bold text-base px-1 cursor-pointer"
            >
              -
            </button>
            <span className="text-sm font-bold w-4 text-center">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="text-gray-600 hover:text-gray-900 font-bold text-base px-1 cursor-pointer"
            >
              +
            </button>
          </div>
        </div>
      </main>

      {/* Barra fija inferior para Añadir al Carrito */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 shadow-lg z-20">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold block">Total</span>
            <span className="text-base font-bold text-gray-900">
              ${(
                (parseFloat(
                  typeof product.price === 'string'
                    ? product.price.replace(/[^0-9.]/g, '')
                    : product.price
                ) || 0) * quantity
              ).toLocaleString('es-AR')}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            className={`flex-1 max-w-xs py-3 rounded-xl font-bold text-sm text-white transition cursor-pointer ${
              added ? 'bg-emerald-600' : 'bg-[#BA8B5C] hover:bg-[#a67a4e]'
            }`}
          >
            {added ? '✓ Añadido al Carrito' : 'Agregar al Carrito'}
          </button>
        </div>
      </div>
    </div>
  )
}