import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(false)

    // Validación según Figma: Si están vacíos o no cumplen requisitos muestra el estado de error
    if (!email || !password) {
      setError(true)
      return
    }

    setSubmitting(true)
    try {
      // Simulación de llamada de sesión exitosa
      const mockUser = { name: 'Juan Perez', email }
      const mockToken = 'mock-jwt-token'
      login(mockUser, mockToken)
      navigate('/')
    } catch (err) {
      setError(true)
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

        {/* Botones Sociales (Google / Facebook) */}
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

          {/* Enlace Olvidaste Contraseña */}
          <div className="text-left">
            <button type="button" className="text-[10px] text-gray-500 hover:underline">
              ¿Olvidaste la contraseña?
            </button>
          </div>

          {/* Estado de Error según Frame 219 de Figma */}
          {error && (
            <p className="text-[11px] font-bold text-red-600 text-left">
              Datos no válidos. Volvé a intentarlo.
            </p>
          )}

          {/* Botón Iniciar Sesión */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-[#3D2314] hover:bg-[#2A180D] text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-sm"
          >
            {submitting ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>

        {/* Enlace a Registro */}
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