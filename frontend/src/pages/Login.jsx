import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(false)

    if (!email || !password) {
      setError(true)
      setErrorMessage('Datos no válidos. Volvé a intentarlo.')
      return
    }

    setSubmitting(true)
    try {
      // 1. Petición REAL al backend en Docker (usando la variable VITE_API_URL de tu .env)
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
     const response = await fetch(`${apiUrl}/api/auth/login`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ email,contrasena: password }),
})

      if (!response.ok) {
        throw new Error('Credenciales incorrectas')
      }

      // 2. Leemos la respuesta real que envía el backend
      const data = await response.json()
      
      // 3. Guardamos los datos reales y el token devuelto por el servidor
      login(data.user, data.token)
      navigate('/')

    } catch (err) {
      setError(true)
      setErrorMessage(err.message || 'Error al conectar con el servidor')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#333333]/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans">    
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 space-y-5 shadow-xl animate-in slide-in-from-bottom duration-300">
        
        <h2 className="text-center font-bold text-base sm:text-lg text-[#3A2E2B]">
          Conéctate a EcoBite
        </h2>

        {/* Botones Sociales */}
        <div className="grid grid-cols-2 gap-3">
          <button type="button" className="flex items-center justify-center gap-2 py-2 px-3 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 transition cursor-pointer">
            <span>G</span> Google
          </button>
          <button type="button" className="flex items-center justify-center gap-2 py-2 px-3 border border-gray-200 rounded-xl text-xs font-semibold text-blue-600 hover:bg-gray-50 transition cursor-pointer">
            <span>f</span> Facebook
          </button>
        </div>

        <div className="relative flex py-1 items-center">
          <div className="grow border-t border-gray-200"></div>
          <span className="shrink-0 mx-3 text-[11px] text-gray-400">o ingresá con tu email</span>
          <div className="grow border-t border-gray-200"></div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (error) setError(false)
              }}
              placeholder="Ingresá tu email"
              className={`w-full px-3.5 py-2.5 text-xs rounded-xl border focus:outline-none transition ${
                error 
                  ? 'bg-red-50 border-red-400 text-red-900 placeholder-red-400' 
                  : 'bg-gray-50 border-gray-200 text-gray-800 focus:border-[#B58252]'
              }`}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-gray-700">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (error) setError(false)
              }}
              placeholder="Ingresá tu contraseña"
              className={`w-full px-3.5 py-2.5 text-xs rounded-xl border focus:outline-none transition ${
                error 
                  ? 'bg-red-50 border-red-400 text-red-900 placeholder-red-400' 
                  : 'bg-gray-50 border-gray-200 text-gray-800 focus:border-[#B58252]'
              }`}
            />
          </div>

          <div className="text-left">
            <button type="button" className="text-[10px] text-gray-500 hover:underline">
              ¿Olvidaste la contraseña?
            </button>
          </div>

          {error && (
            <p className="text-[11px] font-bold text-red-600 text-left">
              {errorMessage || 'Datos no válidos. Volvé a intentarlo.'}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-[#3D2314] hover:bg-[#2A180D] text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-sm"
          >
            {submitting ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>

        <div className="text-center pt-1">
          <p className="text-xs text-gray-500">
            ¿No estás registrado?{' '}
            <Link to="/register" className="font-bold text-[#3D2314] hover:underline">
              Crea tu cuenta
            </Link>
          </p>
        </div>

      </div>
    </div>
  )
}