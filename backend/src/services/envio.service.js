const AppError = require("../utils/AppError");
const deliveryRepository = require("../repositories/delivery.repository");
const envioRespository = require("../repositories/envio.repository");
const { validarPaginacion } = require("../validators/paginacion.validator");
const prisma = require("../config/prisma");
const { validarUuid } = require("../validators/uuid.validator");
const pedidoRepository = require("../repositories/pedido.repository");

// Comprueba el rol y obtiene el perfil delivery del usuario
const obtenerDeliveryActual = async (usuarioActual) => {
    if (!usuarioActual || usuarioActual.nombreRol !== "delivery") {
        throw new AppError("Solo los deliveries pueden realizar esta accion", 403);
    }

    const delivery = await deliveryRepository.findByUsuarioId( usuarioActual.id );

    if (!delivery) {
        throw new AppError("No tienes un perfil delivery registrado", 403);
    }

    return delivery;
};

// Lista los envios disponibles para los restaurantes del delivery
const listarEnviosDisponibles = async (query, usuarioActual) => {
    const delivery = await obtenerDeliveryActual(usuarioActual);
    const paginacion = validarPaginacion(query);

    const envios = await envioRespository.findDisponibles(
        delivery.id,
        paginacion
    );

    const total = await envioRespository.contarDisponibles(delivery.id);

    return {
        envios,
        paginacion: {
            pagina: paginacion.pagina,
            limite: paginacion.limite,
            total,
            totalPaginas: Math.ceil(total / paginacion.limite),
        },
    };
};

// Asigna y recupera el envio dentro de la misma transaccion
const asignarEnvio = async (envioId, deliveryId, db) => {
    const resultado = await envioRespository.aceptarSiDisponible(envioId, deliveryId, db);

    if (resultado.count !== 1) {
        throw new AppError("El envio no esta disponible para tu cuenta", 409);
    }

    const envio = await envioRespository.findByIdDelivery(envioId, deliveryId, db);
    if (!envio) {
        throw new AppError("No se pudo recuperar el envio asignado", 500);
    }

    return envio;
};

// Autoriza el delivery y acepta un envio disponible
const aceptarEnvio = async (envioId, usuarioActual) => {
    const delivery = await obtenerDeliveryActual(usuarioActual);
    const id = validarUuid(envioId, "El ID del envio");

    return prisma.$transaction((tx) =>
        asignarEnvio(id, delivery.id, tx)
    );
};

// Actualiza el envio y su pedido dentro de la misma transaccion
const iniciarTrasladoAsignado = async (envioId, deliveryId, db = prisma) => {
    const resultadoEnvio = await envioRespository.iniciarSiAsignado(envioId, deliveryId, db);

    if (resultadoEnvio.count !== 1) {
        throw new AppError("El envio no esta disponible para iniciar el traslado", 409);
    }

    const envio = await envioRespository.findByIdDelivery(envioId, deliveryId, db);

    if (!envio) {
        throw new AppError("No se pudo recuperar el envio asignado", 500);
    }

    const resultadoPedido = await pedidoRepository.marcarEnTransitoSiListo(envio.pedidoId, deliveryId, db);

    if (resultadoPedido.count !== 1) {
        throw new AppError("El pedido no esta disponible para iniciar el transito", 409);
    }

    return envio;
};

// Autoriza al delivery e inicia el traslado de su envio
const iniciarTraslado = async (envioId, usuarioActual) => {
    const delivery = await obtenerDeliveryActual(usuarioActual);
    const id = validarUuid(envioId, "El ID del envio");

    return prisma.$transaction((tx) =>
        iniciarTrasladoAsignado(id, delivery.id, tx)
    );
};

// Actualiza el envio y pedido como entregados en la misma transaccion
const entregarEnvioAsignado = async (envioId, deliveryId, db) => {
    const resultadoEnvio = await envioRespository.entregarSiEnTransito(envioId, deliveryId, db);

    if (resultadoEnvio.count !== 1) {
        throw new AppError("El envio no esta disponible para confirmar la entrega", 409);
    }
    const envio = await envioRespository.findByIdDelivery(envioId, deliveryId, db);

    if (!envio) {
        throw new AppError("No se pudo recuperar el envio asigando", 500);
    }

    const resultadoPedido = await pedidoRepository.marcarEntregadoSiEnTransito(envio.pedidoId, deliveryId, db);

    if (resultadoPedido.count !== 1) {
        throw new AppError("El pedido no esta disponible para confirmar la entrega", 409);
    }

    return envio;
};

// Autoriza al delivery y confirma la entrega de su envio
const confirmarEntrega = async (envioId, usuarioActual) => {
    const delivery = await obtenerDeliveryActual(usuarioActual);
    const id = validarUuid(envioId, "El ID del envio");

    return prisma.$transaction((tx) =>
        entregarEnvioAsignado(id, delivery.id, tx)
    );
};

module.exports = {
    listarEnviosDisponibles,
    aceptarEnvio,
    iniciarTraslado,
    confirmarEntrega,
};