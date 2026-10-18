const platoService = require("../services/plato.service");

// Responde con los platos disponibles del restaurante
const listarPorRestaurante = async (req, res) => {
    const platos = await platoService.listarPlatosPorRestaurante(
        req.params.restauranteId
    );
    res.status(200).json(platos);
};

//Crea un plato en el restaurante indicado
const crear = async (req, res) => {
    const plato = await platoService.crearPlato(
        req.params.restauranteId,
        req.body,
        req.usuarioActual,
    );

    res.status(201).json({
        message: "Plato creado con éxito",
        plato,
    });
};

// Actualiza los campos enviados de un plato
const editar = async (req, res) => {
    const plato = await platoService.editarPlato(
        req.params.restauranteId,
        req.params.platoId,
        req.body,
        req.usuarioActual
    );

    res.status(200).json({
        message: "Plato actualizado con éxito",
        plato,
    });
};

// Cambia la disponibilidad de un plato
const cambiarEstado = async (req, res) => {
    const plato = await platoService.cambiarEstadoPlato(
        req.params.restauranteId,
        req.params.platoId,
        req.body,
        req.usuarioActual
    );

    res.status(200).json({
        message: "Estado del plato actualizado con éxito",
        plato,
    });
};

module.exports = { listarPorRestaurante, crear,
    editar, cambiarEstado, };