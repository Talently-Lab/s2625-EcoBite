import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('ecobite_token') || null)
  const [loading, setLoading] = useState(true)

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

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
    const response = await fetch(`${apiUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, contrasena: password }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.mensaje || errorData.message || errorData.error || 'Credenciales incorrectas')
    }

    const data = await response.json()
    const userData = data.user || data.usuario
    
    setUser(userData)
    setToken(data.token)
    localStorage.setItem('ecobite_token', data.token)
    localStorage.setItem('ecobite_user', JSON.stringify(userData))

    return data
  }

  const register = async (nombreArg, emailArg, passwordArg) => {
    // Si la función recibe un objeto anidado como primer argumento, extraemos sus valores
    let nombre = nombreArg
    let email = emailArg
    let password = passwordArg

    if (typeof nombreArg === 'object' && nombreArg !== null) {
      nombre = nombreArg.nombre
      email = nombreArg.email || emailArg
      password = nombreArg.contrasena || nombreArg.password || passwordArg
    }

    const response = await fetch(`${apiUrl}/api/usuarios/registrar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        nombre, 
        email, 
        contrasena: password
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.mensaje || errorData.message || errorData.error || 'Error al registrar la cuenta')
    }

    const data = await response.json()

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