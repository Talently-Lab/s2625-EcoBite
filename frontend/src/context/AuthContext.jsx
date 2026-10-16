import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('ecobite_token') || null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Si hay un token guardado, recuperamos la sesión
    const savedUser = localStorage.getItem('ecobite_user')
    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (e) {
        console.error('Error al parsear el usuario guardado:', e)
      }
    }
    setLoading(false)
  }, [token])

  const login = (userData, userToken) => {
    setUser(userData)
    setToken(userToken)
    localStorage.setItem('ecobite_token', userToken)
    localStorage.setItem('ecobite_user', JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('ecobite_token')
    localStorage.removeItem('ecobite_user')
  }

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)