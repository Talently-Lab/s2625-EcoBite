import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { trackEvent } from '../services/analytics'

export default function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()

  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [error, setError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // 1. Evento de visita a la página de registro (permitido por el backend)
  useEffect(() => {
    trackEvent('visita_pagina_registro', 'cliente')
  }, [])

  // 2. Evento de clic/foco en el campo email (permitido por el backend)
  const handleEmailFocus = () => {
    trackEvent('click_campo_email', 'cliente')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(false)
    setErrorMessage('')

    if (!nombre || !email || !contrasena) {
      setError(true)
      setErrorMessage('Por favor completa todos los campos.')
      return
    }

    setSubmitting(true)
    try {
      await register({ nombre, email, contrasena })
      navigate('/login') 
    } catch (err) {
      setError(true)
      setErrorMessage(err.message || 'Datos no válidos. Volvé a intentarlo.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    /* Cambiamos items-center por items-end en mobile y quitamos padding exterior inicial */
    <div className="min-h-screen bg-[#333333]/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 font-sans">
      {/* Ajustamos los bordes a rounded-t-3xl sm:rounded-3xl para el efecto bottom sheet */}
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
        
        <h2 className="text-center font-bold text-base sm:text-lg text-[#3A2E2B]">
          Conéctate a EcoBite
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Nombre completo */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-gray-700">Nombre completo</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => { setNombre(e.target.value); if (error) setError(false); }}
              placeholder="Ingresá tu nombre completo"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border bg-gray-50 border-gray-200 focus:outline-none focus:border-[#B58252]"
            />
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onFocus={handleEmailFocus}
              onChange={(e) => { setEmail(e.target.value); if (error) setError(false); }}
              placeholder="Ingresá tu email"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border bg-gray-50 border-gray-200 focus:outline-none focus:border-[#B58252]"
            />
          </div>

          {/* Contraseña */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-gray-700">Contraseña</label>
            <input
              type="password"
              value={contrasena}
              onChange={(e) => { setContrasena(e.target.value); if (error) setError(false); }}
              placeholder="Ingresá tu contraseña"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border bg-gray-50 border-gray-200 focus:outline-none focus:border-[#B58252]"
            />
          </div>

          {error && (
            <p className="text-[11px] font-bold text-red-600">
              {errorMessage || 'Datos no válidos. Volvé a intentarlo.'}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-[#3D2314] text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-sm mt-2 disabled:opacity-50"
          >
            {submitting ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <div className="text-center pt-1 pb-4 sm:pb-0">
          <p className="text-xs text-gray-500">
            ¿Ya tenés cuenta? <Link to="/login" className="font-bold text-[#3D2314] hover:underline">Iniciá sesión</Link>
          </p>
        </div>

      </div>
    </div>
  )
}