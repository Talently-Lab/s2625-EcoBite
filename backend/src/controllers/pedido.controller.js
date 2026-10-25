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

// Devuelve un pedido del cliente autenticado
const consultar = async (req, res) => {
    const pedido = await pedidoService.consultarPedido(
        req.params.pedidoId,
        req.usuarioActual
    );

    res.status(200).json({ pedido });
};

module.exports = { crear, consultar, };