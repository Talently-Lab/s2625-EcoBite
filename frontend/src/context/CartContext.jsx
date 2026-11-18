import React, { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext()

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('ecobite_cart')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // Guardar en localStorage cada vez que cambian los productos
  useEffect(() => {
    localStorage.setItem('ecobite_cart', JSON.stringify(cartItems))
  }, [cartItems])

  // 1. Agregar producto al carrito (Normalizando id y _id)
  const addToCart = (product, quantity = 1) => {
    const productId = product.id || product._id
    
    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => (item.id || item._id) === productId)
      
      if (existingIndex > -1) {
        const updated = [...prevItems]
        updated[existingIndex].quantity += quantity
        return updated
      }
      
      // Aseguramos que el ítem guardado tenga un 'id' estándar unificado
      return [...prevItems, { ...product, id: productId, quantity }]
    })
  }

  // 2. Eliminar producto
  const removeFromCart = (productId) => {
    setCartItems((prevItems) => prevItems.filter((item) => (item.id || item._id) !== productId))
  }

  // 3. Actualizar cantidad
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId)
      return
    }
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        (item.id || item._id) === productId ? { ...item, quantity: newQuantity } : item
      )
    )
  }

  // 4. Vaciar carrito
  const clearCart = () => {
    setCartItems([])
    localStorage.removeItem('ecobite_cart')
  }

  // 5. Cálculos automáticos de totales
  const subtotal = cartItems.reduce((acc, item) => acc + (Number(item.price || item.precio || 0) * item.quantity), 0)
  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        subtotal,
        totalItemsCount,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)