import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { trackEvent } from '../services/analytics'

export default function Landing() {
  const navigate = useNavigate()
  const { login, register } = useAuth()

  const [activeModal, setActiveModal] = useState(null)
  const [regNombre, setRegNombre] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [logEmail, setLogEmail] = useState('')
  const [logPassword, setLogPassword] = useState('')
  const [error, setError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (activeModal === 'register') {
      trackEvent('visita_pagina_registro', 'cliente')
    }
    setError(false)
    setErrorMessage('')
  }, [activeModal])

  const handleRegisterSubmit = async (e) => {
    e.preventDefault()
    setError(false)
    if (!regNombre || !regEmail || !regPassword) {
      setError(true)
      setErrorMessage('Por favor completa todos los campos.')
      return
    }
    setSubmitting(true)
    try {
      await register({ nombre: regNombre, email: regEmail, contrasena: regPassword })
      setLogEmail(regEmail)
      setActiveModal('login')
    } catch (err) {
      setError(true)
      setErrorMessage(err.message || 'Datos no válidos. Volvé a intentarlo.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    setError(false)
    if (!logEmail || !logPassword) {
      setError(true)
      setErrorMessage('Datos no válidos. Volvé a intentarlo.')
      return
    }
    setSubmitting(true)
    try {
      const data = await login(logEmail, logPassword)
      const userRole = data.usuario?.tipoUsuario?.nombreRol

      setActiveModal(null)

      if (userRole === 'admin') {
        navigate('/admin/dashboard', { replace: true })
      } else {
        navigate('/home', { replace: true })
      }
    } catch (err) {
      setError(true)
      setErrorMessage(err.message || 'Credenciales incorrectas')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#3D2314] font-sans relative">
      {/* Header superior limpio */}
      <header className="px-5 py-3.5 bg-[#FAFAF7] border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="font-bold text-base text-[#3D2314] tracking-tight">
            EcoBite
          </span>
        </div>
      </header>

      {/* SECCIÓN 1: HERO (Imagen de borde a borde en mobile, sin márgenes laterales) */}
      <section className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 sm:gap-8 sm:px-6 sm:py-10 items-center">
        {/* Foto de grupo comiendo: w-full y sin bordes redondeados en mobile para calcar el UX */}
        <div className="w-full h-72 sm:h-96 sm:rounded-3xl overflow-hidden m-0 p-0">
          <img
            src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=900&auto=format&fit=crop&q=80"
            alt="Grupo comiendo sustentable"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Textos y Botones principales con padding idéntico al UX */}
        <div className="px-6 py-6 sm:px-0 space-y-6">
          <div className="space-y-3 text-left">
            <h1 className="text-2xl sm:text-4xl font-bold text-[#3D2314] leading-snug">
              Estas a un paso de comer rico.
            </h1>
            <p className="text-sm sm:text-base text-[#5C493E] leading-relaxed">
              Acá vas a encontrar propuestas sustentables que vas a querer repetir.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={() => setActiveModal('register')}
              className="w-full py-4 bg-[#3D2314] hover:bg-[#2A180D] text-white font-semibold text-sm rounded-2xl transition cursor-pointer shadow-xs"
            >
              Registrate y comenzá
            </button>

            <button
              onClick={() => setActiveModal('login')}
              className="w-full py-4 bg-[#F5EFE6] hover:bg-[#EBE2D3] text-[#3D2314] font-semibold text-sm rounded-2xl transition cursor-pointer"
            >
              Iniciá sesión
            </button>
          </div>
        </div>
      </section>

      {/* SECCIÓN 2: BLOQUE MARRÓN OSCURO (Restaurantes y Deliveries) */}
      <section className="bg-[#3D2314] px-5 py-8 sm:py-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6">
          
          {/* Tarjeta Restaurantes */}
          <div className="bg-[#FAFAF7] rounded-3xl p-5 space-y-4 shadow-md flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-full h-40 rounded-2xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=700&auto=format&fit=crop&q=80"
                  alt="Platos saludables restaurantes"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-2">
                <h2 className="text-lg font-bold text-[#3D2314]">Restaurantes</h2>
                <p className="text-xs font-medium text-[#5C493E]">
                  Multiplicá tus ventas con entregas sustentables.
                </p>
                <ul className="text-[11px] text-[#6E5D53] space-y-1 pt-1">
                  <li>· 0% comisiones abusivas.</li>
                  <li>· Packaging biodegradable bonificado.</li>
                </ul>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={() => navigate('/register/store-basic')}
                className="w-full py-3.5 bg-[#3D2314] hover:bg-[#2A180D] text-white text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Sumar mi Local
              </button>
              <p className="text-center text-xs text-[#5C493E]">
                ¿Ya tenés cuenta?{' '}
                <button
                  type="button"
                  onClick={() => setActiveModal('login')}
                  className="font-bold text-[#3D2314] hover:underline cursor-pointer"
                >
                  Iniciá sesión
                </button>
              </p>
            </div>
          </div>

          {/* Tarjeta Deliveries */}
          <div className="bg-[#FAFAF7] rounded-3xl p-5 space-y-4 shadow-md flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-full h-40 rounded-2xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1617347454431-f49d7ff5c3b1?w=700&auto=format&fit=crop&q=80"
                  alt="Delivery en bicicleta"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-2">
                <h2 className="text-lg font-bold text-[#3D2314]">Deliveries</h2>
                <p className="text-xs font-medium text-[#5C493E]">
                  Generá ingresos en tu ciudad y reducí la huella de CO₂.
                </p>
                <ul className="text-[11px] text-[#6E5D53] space-y-1 pt-1">
                  <li>· Horarios 100% flexibles.</li>
                  <li>· Pagos semanales transparentes.</li>
                </ul>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setActiveModal('register')}
                className="w-full py-3.5 bg-[#3D2314] hover:bg-[#2A180D] text-white text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Sumarme como Delivery
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* MODAL SUPERPUESTO */}
      {activeModal && (
        <div
          onClick={() => setActiveModal(null)}
          className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 space-y-4 shadow-2xl max-h-[82vh] overflow-y-auto"
          >
            <h2 className="text-center font-bold text-lg text-[#3D2314]">
              Conéctate a EcoBite
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className="flex items-center justify-center gap-2 py-2.5 px-3 bg-[#FAFAF7] border border-gray-200 rounded-xl text-xs font-semibold text-[#3D2314] hover:bg-gray-100 transition cursor-pointer"
              >
                <span className="font-black">G</span> Google
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-2 py-2.5 px-3 bg-[#FAFAF7] border border-gray-200 rounded-xl text-xs font-semibold text-[#3D2314] hover:bg-gray-100 transition cursor-pointer"
              >
                <span className="text-blue-600 font-black">f</span> Facebook
              </button>
            </div>

            <div className="relative flex py-1 items-center">
              <div className="grow border-t border-gray-100"></div>
              <span className="shrink-0 mx-3 text-[11px] font-medium text-[#5C493E]">
                {activeModal === 'register' ? 'o crea tu cuenta' : 'o ingresá con tu email'}
              </span>
              <div className="grow border-t border-gray-100"></div>
            </div>

            {activeModal === 'register' ? (
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#3D2314]">Nombre completo</label>
                  <input
                    type="text"
                    value={regNombre}
                    onChange={(e) => { setRegNombre(e.target.value); if (error) setError(false) }}
                    placeholder="Ingresá tu nombre completo"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 bg-white text-[#3D2314] placeholder-gray-400 focus:outline-none focus:border-[#3D2314]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#3D2314]">Email</label>
                  <input
                    type="email"
                    value={regEmail}
                    onFocus={() => trackEvent('click_campo_email', 'cliente')}
                    onChange={(e) => { setRegEmail(e.target.value); if (error) setError(false) }}
                    placeholder="Ingresá tu email"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 bg-white text-[#3D2314] placeholder-gray-400 focus:outline-none focus:border-[#3D2314]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#3D2314]">Contraseña</label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => { setRegPassword(e.target.value); if (error) setError(false) }}
                    placeholder="Ingresá tu contraseña"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 bg-white text-[#3D2314] placeholder-gray-400 focus:outline-none focus:border-[#3D2314]"
                  />
                </div>

                {error && (
                  <p className="text-[11px] font-bold text-red-600">{errorMessage}</p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 bg-[#3D2314] hover:bg-[#2A180D] text-white text-xs font-bold rounded-xl transition cursor-pointer mt-1 disabled:opacity-50"
                >
                  {submitting ? 'Creando cuenta...' : 'Crear cuenta'}
                </button>

                <p className="text-center text-xs text-[#5C493E] pt-2 pb-2">
                  ¿Ya tenés cuenta?{' '}
                  <button
                    type="button"
                    onClick={() => setActiveModal('login')}
                    className="font-bold text-[#3D2314] hover:underline cursor-pointer"
                  >
                    Iniciá sesión
                  </button>
                </p>
              </form>
            ) : (
              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#3D2314]">Email</label>
                  <input
                    type="email"
                    value={logEmail}
                    onChange={(e) => { setLogEmail(e.target.value); if (error) setError(false) }}
                    placeholder="Ingresá tu email"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 bg-white text-[#3D2314] placeholder-gray-400 focus:outline-none focus:border-[#3D2314]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#3D2314]">Contraseña</label>
                  <input
                    type="password"
                    value={logPassword}
                    onChange={(e) => { setLogPassword(e.target.value); if (error) setError(false) }}
                    placeholder="Ingresá tu contraseña"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 bg-white text-[#3D2314] placeholder-gray-400 focus:outline-none focus:border-[#3D2314]"
                  />
                </div>

                {error && (
                  <p className="text-[11px] font-bold text-red-600">{errorMessage}</p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 bg-[#3D2314] hover:bg-[#2A180D] text-white text-xs font-bold rounded-xl transition cursor-pointer mt-1 disabled:opacity-50"
                >
                  {submitting ? 'Iniciando sesión...' : 'Iniciar sesión'}
                </button>

                <p className="text-center text-xs text-[#5C493E] pt-2 pb-2">
                  ¿No estás registrado?{' '}
                  <button
                    type="button"
                    onClick={() => setActiveModal('register')}
                    className="font-bold text-[#3D2314] hover:underline cursor-pointer"
                  >
                    Crea tu cuenta
                  </button>
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}