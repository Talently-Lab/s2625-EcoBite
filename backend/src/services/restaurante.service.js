const restauranteRepository = require("../repositories/restaurante.respository");

/**
 *  Servicio que obtiene todos los restaurantes activos
 */
const listarRestaurantes = async () => {
    const restaurantes = await restauranteRepository.findAllActive();

    return restaurantes.map((restaurante) => ({
        ...restaurante,
        calificacionPromedio:
            restaurante.calificacionPromedio === null
                ? null
                : Number(restaurante.calificacionPromedio),
    }));
};

module.exports = { listarRestaurantes };