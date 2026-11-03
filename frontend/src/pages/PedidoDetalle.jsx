import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function PedidoDetalle() {
  const { pedidoId } = useParams()
  const [pedido, setPedido] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { token } = useAuth()

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

  useEffect(() => {
    // Petición al endpoint GET /pedidos/:pedidoId según la documentación de integración
    fetch(`${apiUrl}/api/pedidos/${pedidoId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('No se pudo obtener el estado del pedido')
        return res.json()
      })
      .then(data => {
        setPedido(data.pedido)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [pedidoId, apiUrl, token])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#FDFBF7]">
        <span className="loading loading-spinner loading-lg text-[#3D2314]"></span>
        <span className="ml-3 text-lg font-medium text-[#3D2314]">Cargando tu pedido... 🌱</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-box shadow text-center">
        <p className="text-error font-semibold">{error}</p>
      </div>
    )
  }

  const esEntregado = pedido?.estado === 'entregado'

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-10 px-4 text-[#3D2314]">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-6 border border-[#EFECE6]">
        
        {/* Cabecera */}
        <div className="flex justify-between items-center mb-6">
          <span className="text-sm font-semibold text-gray-500">EcoBite</span>
          <span className="badge badge-outline border-[#3D2314] text-[#3D2314]">
            {esEntregado ? 'Completado' : 'En proceso'}
          </span>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-2">
            {esEntregado ? '¡Tu pedido está confirmado!' : 'Confirmando pedido'}
          </h1>
          <p className="text-sm text-gray-600">
            {esEntregado 
              ? 'Gracias por elegir una forma más rica de cuidar el planeta.' 
              : 'Estamos preparando todo para que disfrutes tu próxima comida.'}
          </p>
          <div className="inline-block mt-3 px-3 py-1 bg-[#F5F2EC] rounded-full text-xs font-medium">
            ● Estado: {pedido?.estado}
          </div>
        </div>

        {/* Círculo decorativo central */}
        <div className="flex justify-center mb-8">
          <div className="w-32 h-32 rounded-full border-4 border-[#E5DEC9] flex items-center justify-center bg-[#FAF7F0]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[#3D2314]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
        </div>

        {/* Tarjeta de Progreso */}
        <div className="bg-[#FAF7F0] rounded-xl p-4 mb-6 border border-[#EFECE6]">
          <div className="flex justify-between text-xs font-semibold mb-2">
            <span>Progreso del pedido</span>
            <span>{esEntregado ? '100%' : 'En curso'}</span>
          </div>
          <progress className="progress progress-success w-full bg-gray-200" value={esEntregado ? 100 : 60} max="100"></progress>
          
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between items-center text-gray-600">
              <span>Verificando tu pago</span>
              <span className="text-xs font-bold text-success">Listo</span>
            </div>
            <div className="flex justify-between items-center text-gray-600">
              <span>Procesando pago</span>
              <span className="text-xs font-bold text-success">Listo</span>
            </div>
            <div className="flex justify-between items-center font-medium">
              <span>Confirmando pedido</span>
              <span className="text-xs font-bold text-primary">{esEntregado ? 'Listo' : 'En curso'}</span>
            </div>
          </div>
        </div>

        {/* Detalle de ítems */}
        <div className="border-t border-gray-100 pt-4">
          <h2 className="text-sm font-bold text-gray-700 mb-3">Resumen</h2>
          {pedido?.items && pedido.items.map((item, index) => (
            <div key={index} className="flex justify-between items-center text-sm">
              <div>
                <p className="font-semibold">{item.nombre || 'Plato EcoBite'}</p>
                <p className="text-xs text-gray-500">Cantidad: {item.cantidad}</p>
              </div>
              <span className="font-bold">${Number(item.subtotal || 0).toFixed(2)}</span>
            </div>
          ))}
          
          <div className="flex justify-between items-center mt-4 pt-3 border-t border-dashed border-gray-200 font-bold text-base">
            <span>Total</span>
            <span className="text-success">${Number(pedido?.montoTotal || 0).toFixed(2)}</span>
          </div>
        </div>

      </div>
    </div>
  )
}