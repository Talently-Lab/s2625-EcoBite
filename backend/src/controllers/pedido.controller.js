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

// Devuelve los pedidos del restaurante del gerente autenticado
const listarRestaurante = async (req, res) => {
    const resultado = await pedidoService.listarPedidosRestaurante(
        req.query,
        req.usuarioActual
    );
    res.status(200).json(resultado);
};

// Marca como listo un pedido del restaurante del gerente
const marcarListo = async (req, res) => {
    const pedido = await pedidoService.marcarPedidoListo(
        req.params.pedidoId,
        req.usuarioActual
    );

    res.status(200).json({
        message: "Pedido marcado como listo",
        pedido,
    });
};

module.exports = {
    crear,
    consultar,
    listarRestaurante,
    marcarListo,
};