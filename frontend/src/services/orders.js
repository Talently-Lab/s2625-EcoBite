import { apiFetch } from './api';

export async function createOrder(cartItems, total, token) {
  try {
    // Debe apuntar a '/pedidos' ya que así está registrado en el backend
    const response = await apiFetch('/pedidos', {
      method: 'POST',
      body: {
        items: cartItems,
        total: total,
      },
    });

    return {
      success: true,
      message: '¡Pedido creado exitosamente!',
      orderId: response.id || response.orderId,
    };
  } catch (error) {
    console.error('Error al crear la orden en el backend:', error);
    throw error;
  }
}

export async function getOrderById(orderId) {
  try {
    const response = await apiFetch(`/pedidos/${orderId}`);
    return response;
  } catch (error) {
    console.error(`Error al obtener el pedido ${orderId}:`, error);
    throw error;
  }
}