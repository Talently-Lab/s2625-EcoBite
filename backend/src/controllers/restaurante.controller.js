const restauranteService = require("../services/restaurante.service");

/**
 * 
 */
const listar = async (req, res) => {
    const restaurantes = await restauranteService.listarRestaurantes();
    res.status(200).json(restaurantes);
};

// Devuelve el detalle de un restaurante por ID
const obtenerDetalle = async (req, res) => {
    const restaurante = await restauranteService.obtenerDetalleRestaurante(
        req.params.restauranteId
    );

    res.status(200).json(restaurante);
};

module.exports = {
    listar,
    obtenerDetalle,
};