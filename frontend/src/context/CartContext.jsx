import React, { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext()

export function CartProvider({ children }) {
  // Inicializamos desde localStorage si existe
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

  // 1. Agregar producto al carrito
  const addToCart = (product, quantity = 1) => {
    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.id === product.id)
      if (existingIndex > -1) {
        const updated = [...prevItems]
        updated[existingIndex].quantity += quantity
        return updated
      }
      return [...prevItems, { ...product, quantity }]
    })
  }

  // 2. Eliminar o decrementar producto
  const removeFromCart = (productId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId))
  }

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId)
      return
    }
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    )
  }

  // 3. Vaciar carrito
  const clearCart = () => {
    setCartItems([])
    localStorage.removeItem('ecobite_cart')
  }

  // 4. Cálculos automáticos de totales
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
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