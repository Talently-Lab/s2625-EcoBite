const AppError = require("../utils/AppError");
const platoRepository = require("../repositories/plato.repository");
const restauranteRepository = require("../repositories/restaurante.respository");
const { validarUuid } = require("../validators/uuid.validator");
const { validarDatosPlato,
        validarEstadoPlato,} = require("../validators/plato.validator");
const { autorizarGestionRestaurante } = require("../utils/autorizacionRestaurante");

//Comprueba que el restaurante exista y este activo
const comprobarRestauranteActivo = async (restauranteId) => {
    const restaurante = await restauranteRepository.findById(restauranteId);
    if (!restaurante || restaurante.estado !== "activo"){
        throw new AppError("Restaurante no encontrado o no disponible", 404);
    }
};

// Consulta los platos disponibles de un restaurante activo
const listarPlatosPorRestaurante = async (restauranteId) => {
    const id = validarUuid(restauranteId, "El Id del restaurante");
    await comprobarRestauranteActivo(id);

    return platoRepository.findActivosByRestaurante(id);
}

//Autoriza, valida los permisos y los datos antes de crear un plato
const crearPlato = async (restauranteId, datos, usuarioActual) => {
    const id = autorizarGestionRestaurante(usuarioActual, restauranteId);
    const datosValidados = validarDatosPlato(datos);

    await comprobarRestauranteActivo(id);

    return platoRepository.crear({
        ...datosValidados,
        restauranteId: id,
    });
};

//comprueba que el plato pertenezca al restaurante
const comprobarPlatoDelRestaurante = async (platoId, restauranteId) =>{
    const plato = await platoRepository.findByIdYRestaurante(
        platoId, restauranteId
    );

    if (!plato) {
        throw new AppError("Plato no encontrado en este restaurante", 404);
    }
};

// Autoriza y actualiza los campos enviados
const editarPlato = async (restauranteId, platoId, datos, usuarioActual) => {
    const idRestaurante = autorizarGestionRestaurante(usuarioActual, restauranteId);
    const idPlato = validarUuid(platoId, "El ID del plato");
    const datosValidados = validarDatosPlato(datos, true);

    await comprobarRestauranteActivo(idRestaurante);
    await comprobarPlatoDelRestaurante(idPlato, idRestaurante);

    try{
        return await platoRepository.actualizar(idPlato, idRestaurante, datosValidados);
    } catch (error){
        if (error.code === "P2025"){
            throw new AppError("Plato no encontrado en este restaurante", 404);
        }
        throw error;
    }
};

//Autoriza y cambia la disponibilidad de un plato
const cambiarEstadoPlato = async (restauranteId, platoId, datos, usuarioActual) => {
    const idRestaurante = autorizarGestionRestaurante(usuarioActual, restauranteId);
    const idPlato = validarUuid(platoId, "El ID del plato");
    const activo = validarEstadoPlato(datos);

    await comprobarRestauranteActivo(idRestaurante);
    await comprobarPlatoDelRestaurante(idPlato, idRestaurante);

    try {
        return await platoRepository.actualizarEstado(idPlato, idRestaurante, activo);
    } catch (error) {
        if (error.code === "P2025") {
            throw new AppError("Plato no encontrado", 404);
        }
        throw error;
    }
};

module.exports = { listarPlatosPorRestaurante, crearPlato,
    editarPlato, cambiarEstadoPlato, };