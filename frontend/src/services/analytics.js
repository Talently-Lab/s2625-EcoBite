function getSessionId() {
  let id = sessionStorage.getItem('session_id')
  if (!id) {
    id = crypto.randomUUID()
    sessionStorage.setItem('session_id', id)
  }
  return id
}

export function trackEvent(nombre_evento, rol_usuario, propiedades = {}) {
  const body = JSON.stringify({
    nombre_evento,
    rol_usuario,
    session_id: getSessionId(),
    fecha_cliente: new Date().toISOString(),
    propiedades,
  })
  
  const headers = { 'Content-Type': 'application/json' }
  const endpoint = '/eventos' // O la URL completa de tu backend si no usas proxy de Vite

  // Envío seguro sin bloquear la interfaz
  if (navigator.sendBeacon) {
    navigator.sendBeacon(endpoint, new Blob([body], headers))
  } else {
    fetch(endpoint, {
      method: 'POST',
      headers,
      body,
      keepalive: true,
    }).catch(() => {})
  }
}