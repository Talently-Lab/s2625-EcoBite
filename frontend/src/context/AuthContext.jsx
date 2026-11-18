import React, { createContext, useContext, useState, useEffect } from 'react'
import { apiFetch } from '../services/api'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('ecobite_token') || localStorage.getItem('token') || null)
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('ecobite_user')
    if (savedUser) {
      try {
        return JSON.parse(savedUser)
      } catch (e) {
        console.error('Error al parsear el usuario guardado:', e)
        return null
      }
    }
    return null
  })
  const [loading, setLoading] = useState(false)

  const login = async (email, password) => {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: { 
        email, 
        password: password, 
        contrasena: password 
      }
    })

    const authToken = data.token || data.accessToken || data.access_token
    const userData = data.user || data.usuario || data.data

    if (!authToken) {
      throw new Error(data.message || 'Credenciales incorrectas o token no recibido')
    }

    setUser(userData)
    setToken(authToken)
    localStorage.setItem('ecobite_token', authToken)
    localStorage.setItem('token', authToken)
    if (userData) {
      localStorage.setItem('ecobite_user', JSON.stringify(userData))
    }

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

    const data = await apiFetch('/usuarios/registrar', {
      method: 'POST',
      body: { 
        nombre, 
        email, 
        password: password,
        contrasena: password 
      }
    })

    const authToken = data.token || data.accessToken || data.access_token
    const userData = data.user || data.usuario || data.data

    if (authToken && userData) {
      setUser(userData)
      setToken(authToken)
      localStorage.setItem('ecobite_token', authToken)
      localStorage.setItem('token', authToken)
      localStorage.setItem('ecobite_user', JSON.stringify(userData))
    }

    return data
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('ecobite_token')
    localStorage.removeItem('token')
    localStorage.removeItem('ecobite_user')
  }

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)