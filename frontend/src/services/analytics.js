function getSessionId() {
  let id = sessionStorage.getItem('session_id')
  if (!id) {
    id = crypto.randomUUID()
    sessionStorage.setItem('session_id', id)
  }
  return id
}

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export function trackEvent(nombre_evento, rol_usuario, propiedades = {}) {
  const body = JSON.stringify({
    id: crypto.randomUUID(), // Requerido por el backend en formato UUID v4
    nombre_evento,
    rol_usuario,
    session_id: getSessionId(),
    fecha_cliente: new Date().toISOString(),
    propiedades,
  })
  
  const endpoint = `${apiUrl}/api/eventos`

  fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => {})
}