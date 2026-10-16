import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { trackEvent } from '../services/analytics' // 👈 Importamos el tracker

export default function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // 1. Evento de visita a la página de registro
  useEffect(() => {
    trackEvent('visita_pagina_registro', 'cliente')
  }, [])

  // 2. Evento de clic/foco en el campo email (solo una vez)
  const handleEmailFocus = () => {
    trackEvent('click_campo_email', 'cliente')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(false)

    if (!name || !email || !password) {
      setError(true)
      return
    }

    setSubmitting(true)
    try {
      // Llamada real al backend para registrar
      await register(name, email, password)
      
      // 3. Evento exclusivo al confirmar la creación exitosa de la cuenta
      trackEvent('click_boton_crear_cuenta', 'cliente')

      navigate('/')
    } catch (err) {
      setError(true)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#333333]/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
        
        <h2 className="text-center font-bold text-base sm:text-lg text-[#3A2E2B]">
          Conéctate a EcoBite
        </h2>

        {/* ... botones sociales ... */}

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Nombre */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-gray-700">Nombre completo</label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); if (error) setError(false); }}
              placeholder="Ingresá tu nombre completo"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border bg-gray-50 border-gray-200"
            />
          </div>

          {/* Email con el evento de focus */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onFocus={handleEmailFocus} // 👈 Disparador del paso 2
              onChange={(e) => { setEmail(e.target.value); if (error) setError(false); }}
              placeholder="Ingresá tu email"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border bg-gray-50 border-gray-200"
            />
          </div>

          {/* Contraseña */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-gray-700">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); if (error) setError(false); }}
              placeholder="Ingresá tu contraseña"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border bg-gray-50 border-gray-200"
            />
          </div>

          {error && <p className="text-[11px] font-bold text-red-600">Datos no válidos. Volvé a intentarlo.</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-[#3D2314] text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-sm mt-2"
          >
            {submitting ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <div className="text-center pt-1">
          <p className="text-xs text-gray-500">
            ¿Ya tenés cuenta? <Link to="/login" className="font-bold text-[#3D2314] hover:underline">Iniciá sesión</Link>
          </p>
        </div>

      </div>
    </div>
  )
}