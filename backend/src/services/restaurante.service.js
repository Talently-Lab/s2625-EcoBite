const restauranteRepository = require("../repositories/restaurante.respository");

/**
 *  Servicio que obtiene todos los restaurantes activos
 */
const listarRestaurantes = async () => {
    return restauranteRepository.findAllActive();
};

module.exports = { listarRestaurantes };