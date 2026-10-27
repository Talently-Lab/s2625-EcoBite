const restauranteService = require("../services/restaurante.service");

/**
 * 
 */
const listar = async (req, res) => {
    const restaurantes = await restauranteService.listarRestaurantes();
    res.status(200).json(restaurantes);
};

module.exports = {listar};