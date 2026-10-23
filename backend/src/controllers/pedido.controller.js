const pedidoService = require("../services/pedido.service");

// Crea un pedido para el cliente autenticado
const crear = async (req, res) => {
    const pedido = await pedidoService.crearPedido(
        req.body,
        req.usuarioActual
    );

    res.status(201).json({
        message: "Pedido creado con éxito",
        pedido,
    });
};

module.exports = { crear };