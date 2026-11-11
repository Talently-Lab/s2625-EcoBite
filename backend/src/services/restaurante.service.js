const restauranteRepository = require("../repositories/restaurante.respository");
const AppError = require("../utils/AppError");
const { validarUuid } = require("../validators/uuid.validator");

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

// Obtiene el detalle de un restaurante activo
const obtenerDetalleRestaurante = async (restauranteId) => {
    const id = validarUuid(restauranteId, "El ID del restaurante");

    const restaurante = await restauranteRepository.findActivoById(id);

    if (!restaurante) {
        throw new AppError("Restaurante no encontrado o no disponible", 404);
    }

    return {
        ...restaurante,
        calificacionPromedio:
            restaurante.calificacionPromedio === null
                ? null
                : Number(restaurante.calificacionPromedio),
    };
};

module.exports = {
    listarRestaurantes,
    obtenerDetalleRestaurante,
};