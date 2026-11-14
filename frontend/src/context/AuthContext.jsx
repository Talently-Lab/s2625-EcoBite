import React, { createContext, useContext, useState, useEffect } from 'react'
import { apiFetch } from '../services/api'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('ecobite_token') || null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
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

  const login = async (email, password) => {
    // Usamos apiFetch apuntando a /auth/login (apiFetch ya incluye el /api inicial)
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: { email, contrasena: password }
    })

    const userData = data.user || data.usuario
    
    setUser(userData)
    setToken(data.token)
    localStorage.setItem('ecobite_token', data.token)
    localStorage.setItem('ecobite_user', JSON.stringify(userData))

    return data
  }

  const register = async (nombreArg, emailArg, passwordArg) => {
    let nombre = nombreArg
    let email = emailArg
    let password = passwordArg

    if (typeof nombreArg === 'object' && nombreArg !== null) {
      nombre = nombreArg.nombre
      email = nombreArg.email || emailArg
      password = nombreArg.contrasena || nombreArg.password || passwordArg
    }

    // Usamos apiFetch apuntando a /usuarios/registrar sin duplicar el /api
    const data = await apiFetch('/usuarios/registrar', {
      method: 'POST',
      body: { 
        nombre, 
        email, 
        contrasena: password
      }
    })

    if (data.token && (data.user || data.usuario)) {
      const userData = data.user || data.usuario
      setUser(userData)
      setToken(data.token)
      localStorage.setItem('ecobite_token', data.token)
      localStorage.setItem('ecobite_user', JSON.stringify(userData))
    }

    return data
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('ecobite_token')
    localStorage.removeItem('ecobite_user')
  }

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)