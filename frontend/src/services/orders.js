export async function createOrder(cartItems, total, token) {
  console.log('Simulando envío de orden al backend:', { cartItems, total, token });
  
  // Simulamos una respuesta exitosa del servidor tras 1 segundo
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ 
        success: true, 
        message: '¡Pedido creado exitosamente (modo simulación)!',
        orderId: 'ORD-' + Math.floor(Math.random() * 100000)
      });
    }, 1000);
  });
}