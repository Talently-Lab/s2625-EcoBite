import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'

export default function RegistrarRestaurante() {
  const navigate = useNavigate()
  const location = useLocation()

  // Determinamos el paso actual según la URL exacta
  const getStepFromPath = (pathname) => {
    if (pathname.includes('store-details')) return 2
    if (pathname.includes('store-validation')) return 3
    if (pathname.includes('success')) return 4
    return 1 // Por defecto: /register/store-basic
  }

  const currentStep = getStepFromPath(location.pathname)

  // Recuperamos datos previos si venimos del paso anterior
  const savedData = location.state?.formData || {
    nombreTitular: '',
    email: '',
    password: '',
    confirmPassword: '',
    razonSocial: '',
    direccion: '',
    categoria: '',
    telefono: '',
    archivoEnvases: null,
    archivoComprobante: null
  }

  const [formData, setFormData] = useState(savedData)
  const [errorPassword, setErrorPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Referencias para los inputs de tipo file reales
  const envasesInputRef = useRef(null)
  const comprobanteInputRef = useRef(null)

  useEffect(() => {
    if (location.state?.formData) {
      setFormData(location.state.formData)
    }
  }, [location.state])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (name === 'password' || name === 'confirmPassword') {
      setErrorPassword('')
    }
  }

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0]
    if (file) {
      setFormData((prev) => ({ ...prev, [fieldName]: file.name }))
    }
  }

  // Navegación Paso 1 -> Paso 2
  const handleNextStep1 = (e) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      setErrorPassword('Las contraseñas no coinciden. Volvé a intentarlo.')
      return
    }
    navigate('/register/store-details', { state: { formData } })
  }

  // Navegación Paso 2 -> Paso 3
  const handleNextStep2 = (e) => {
    e.preventDefault()
    navigate('/register/store-validation', { state: { formData } })
  }

  // Navegación Paso 3 -> Paso 4 (Éxito)
  const handleFinalSubmit = (e) => {
    e.preventDefault()
    if (isSubmitting) return
    setIsSubmitting(true)

    setTimeout(() => {
      setIsSubmitting(false)
      navigate('/register/success', { state: { formData } })
    }, 800)
  }

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#3D2314] font-sans flex flex-col justify-between py-6 px-4">
      
      {/* Header común */}
      <header className="max-w-md w-full mx-auto flex items-center justify-between">
        {currentStep > 1 && currentStep < 4 ? (
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-full text-xs font-bold hover:bg-gray-50 transition cursor-pointer"
          >
            ←
          </button>
        ) : (
          <div className="w-8" />
        )}

        <h1 className="text-base font-black text-[#2D2320]">
          {currentStep === 1 && 'Registrá tu restaurante'}
          {currentStep === 2 && 'Datos del restaurante'}
          {currentStep === 3 && 'Validá tu restaurante'}
          {currentStep === 4 && 'EcoBite'}
        </h1>

        <div className="w-8" />
      </header>

      {/* Contenedor central */}
      <main className="max-w-md w-full mx-auto my-auto bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-5">
        
        {/* PASO 1: /register/store-basic */}
        {currentStep === 1 && (
          <form onSubmit={handleNextStep1} className="space-y-4">
            <button
              type="button"
              onClick={() => navigate('/register/store-details', { state: { formData } })}
              className="w-full py-2.5 px-4 bg-[#FAF8F5] border border-[#EBE3D5] rounded-xl text-xs font-semibold text-[#3D2314] flex items-center justify-center gap-2 hover:bg-[#F3EFE8] transition cursor-pointer"
            >
              <span className="font-bold">G</span> Google
            </button>

            <div className="relative flex py-1 items-center">
              <div className="grow border-t border-gray-100"></div>
              <span className="shrink mx-4 text-[10px] text-gray-400">o crea tu cuenta</span>
              <div className="grow border-t border-gray-100"></div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-700">Nombre completo de titular</label>
              <input
                type="text"
                name="nombreTitular"
                value={formData.nombreTitular}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#EBE3D5] rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#3D2314]"
                placeholder="Ingresá tu nombre completo"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-700">Email corporativo</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#EBE3D5] rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#3D2314]"
                placeholder="Ingresá tu email"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-700">Contraseña</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none ${
                  errorPassword
                    ? 'bg-red-50 border border-red-400 text-red-700'
                    : 'bg-[#FAF8F5] border border-[#EBE3D5] focus:ring-1 focus:ring-[#3D2314]'
                }`}
                placeholder="Ingresá tu contraseña"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-700">Confirmar contraseña</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none ${
                  errorPassword
                    ? 'bg-red-50 border border-red-400 text-red-700'
                    : 'bg-[#FAF8F5] border border-[#EBE3D5] focus:ring-1 focus:ring-[#3D2314]'
                }`}
                placeholder="Ingresá nuevamente tu contraseña"
              />
              {errorPassword && (
                <p className="text-[10px] text-red-500 font-medium pt-0.5">{errorPassword}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#3D2314] hover:bg-[#2A180D] text-white text-xs font-bold rounded-xl transition shadow-md cursor-pointer mt-2"
            >
              Continuar
            </button>
          </form>
        )}

        {/* PASO 2: /register/store-details */}
        {currentStep === 2 && (
          <form onSubmit={handleNextStep2} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-700">Razón social</label>
              <input
                type="text"
                name="razonSocial"
                value={formData.razonSocial}
                onChange={handleChange}
                required
                placeholder="Ingresá tu razón social"
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#EBE3D5] rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#3D2314]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-700">Dirección física</label>
              <input
                type="text"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                required
                placeholder="Ingresá la dirección"
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#EBE3D5] rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#3D2314]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-700">Categoría</label>
              <input
                type="text"
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
                required
                placeholder="Ej.: Orgánica, Vegana, Saludable, General"
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#EBE3D5] rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#3D2314]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-700">Teléfono</label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                required
                placeholder="Ingresá un número de teléfono"
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#EBE3D5] rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#3D2314]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#3D2314] hover:bg-[#2A180D] text-white text-xs font-bold rounded-xl transition shadow-md cursor-pointer mt-2"
            >
              Continuar
            </button>
          </form>
        )}

        {/* PASO 3: /register/store-validation */}
        {currentStep === 3 && (
          <form onSubmit={handleFinalSubmit} className="space-y-4">
            <p className="text-[11px] text-gray-600 leading-relaxed italic text-center">
              Protegemos nuestra comunidad. Esta documentación nos permite garantizar que todos los locales de la red cumplen con el compromiso ambiental.
            </p>

            {/* Input 1: Envases */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[11px] font-bold text-gray-700 block">
                Cargá imágenes de tus envases y/o utensilios <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                ref={envasesInputRef}
                accept=".svg,.png,.jpg,.jpeg,.gif"
                onChange={(e) => handleFileChange(e, 'archivoEnvases')}
                className="hidden"
              />
              <div className="flex items-center border border-[#EBE3D5] rounded-xl overflow-hidden bg-[#FAF8F5]">
                <button
                  type="button"
                  onClick={() => envasesInputRef.current?.click()}
                  className="px-3 py-2.5 bg-[#EBE3D5] hover:bg-[#DFD4C2] text-[#3D2314] text-[11px] font-semibold cursor-pointer shrink-0 transition"
                >
                  Seleccionar archivo
                </button>
                <span className="text-[11px] text-gray-500 px-3 truncate flex-1">
                  {formData.archivoEnvases || 'Archivos no seleccionados'}
                </span>
              </div>
              <p className="text-[9px] text-gray-400">SVG, PNG, JPG o GIF (MAX. 800x400px).</p>
            </div>

            {/* Input 2: Comprobantes */}
            <div className="space-y-1.5 pt-2">
              <label className="text-[11px] font-bold text-gray-700 block">
                Cargá los comprobantes de compra de envases <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                ref={comprobanteInputRef}
                accept=".doc,.docx,.pdf"
                onChange={(e) => handleFileChange(e, 'archivoComprobante')}
                className="hidden"
              />
              <div className="flex items-center border border-[#EBE3D5] rounded-xl overflow-hidden bg-[#FAF8F5]">
                <button
                  type="button"
                  onClick={() => comprobanteInputRef.current?.click()}
                  className="px-3 py-2.5 bg-[#EBE3D5] hover:bg-[#DFD4C2] text-[#3D2314] text-[11px] font-semibold cursor-pointer shrink-0 transition"
                >
                  Seleccionar archivo
                </button>
                <span className="text-[11px] text-gray-500 px-3 truncate flex-1">
                  {formData.archivoComprobante || 'Archivos no seleccionados'}
                </span>
              </div>
              <p className="text-[9px] text-gray-400">DOC o PDF (MAX. 1 mb).</p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-[#3D2314] hover:bg-[#2A180D] disabled:opacity-60 text-white text-xs font-bold rounded-xl transition shadow-md cursor-pointer mt-4 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Creando cuenta...</span>
                </>
              ) : (
                'Crear cuenta'
              )}
            </button>
          </form>
        )}

        {/* PASO 4: /register/success */}
        {currentStep === 4 && (
          <div className="text-center space-y-5 py-6">
            <div className="w-20 h-20 rounded-full border-4 border-[#3D2314] text-[#3D2314] flex items-center justify-center mx-auto">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
              </svg>
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-black text-[#2D2320]">¡Recibimos tu solicitud!</h2>
              <p className="text-xs text-gray-600 leading-relaxed px-2">
                Nuestro equipo está revisando tu documentación para asegurar el compromiso ambiental de toda la red.
              </p>
              <p className="text-xs text-gray-600 leading-relaxed px-2">
                Te enviaremos un email apenas tu local esté aprobado para que puedas iniciar sesión y empezar a vender.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full py-3 bg-[#FAF8F5] hover:bg-[#F0ECE4] border border-[#EBE3D5] text-[#3D2314] text-xs font-bold rounded-xl transition cursor-pointer mt-2"
            >
              Volver al inicio
            </button>
          </div>
        )}

        {/* Enlace inferior en pasos 1 a 3 */}
        {currentStep < 4 && (
          <div className="text-center pt-2">
            <p className="text-[11px] text-gray-500">
              ¿Ya tenés cuenta?{' '}
              <Link to="/login" className="text-[#9E5B32] font-bold hover:underline">
                Iniciá sesión
              </Link>
            </p>
          </div>
        )}
      </main>

      <div className="h-4" />
    </div>
  )
}