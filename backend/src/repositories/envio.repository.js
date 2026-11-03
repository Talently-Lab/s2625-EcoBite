const prisma = require("../config/prisma");

// Guarda un envío pendiente
const crear = (datos, db=prisma) => {
    return db.envio.create({
        data: {
            pedidoId: datos.pedidoId,
            restauranteId: datos.restauranteId,
            domicilioDestino: datos.domicilioDestino,
            deliveryId: null,
            distanciaKm: "1.50",
            estado: "pendiente",
        },
        select: {
            pedidoId: true,
            restauranteId: true,
            domicilioDestino: true,
            deliveryId: true,
            distanciaKm: true,
            estado: true,
            fechaEnvio: true,
        },
    });
};

// Define los envíos disponibles para los restaurantes del delivery
const filtroDisponibles = (deliveryId) => ({
    estado: "pendiente",
    deliveryId: null,
    pedido: {
        estado: "listo",
    },
    restaurante: {
        deliveryRestaurantes: {
            some: {
                deliveryId,
            },
        },
    },
});

// Consulta una pagina de envios disponibles
const findDisponibles = (deliveryId, { limite, desplazamiento }, db=prisma ) => {
    return db.envio.findMany({
        where: filtroDisponibles(deliveryId),
        skip: desplazamiento,
        take: limite,
        orderBy: [
            { fechaEnvio: "asc"},
            { id: "asc" },
        ],
        select: {
            id: true,
            pedidoId: true,
            restauranteId: true,
            distanciaKm: true,
            estado: true,
            fechaEnvio: true,
            restaurante: {
                select: {
                    nombre: true,
                    domicilio: true,
                },
            },
        },
    });
};

// Cuenta los envios usando los mismos criterios del listado
const contarDisponibles = (deliveryId, db = prisma) => {
    return db.envio.count({
        where: filtroDisponibles(deliveryId),
    });
};

// Asigna el envío únicamente si sigue disponible para ese delivery
const aceptarSiDisponible = (envioId, deliveryId, db = prisma) => {
    return db.envio.updateMany({
        where: {
            id: envioId,
            ...filtroDisponibles(deliveryId),
        },
        data: {
            deliveryId,
            fechaAceptacion: new Date(),
        },
    });
};

// Consulta un envío únicamente si está adignado al delivery
const findByIdDelivery = (envioId, deliveryId, db = prisma) => {
    return db.envio.findFirst({
        where: {
            id: envioId,
            deliveryId,
        },
        select: {
            id: true,
            pedidoId: true,
            restauranteId: true,
            deliveryId: true,
            domicilioDestino: true,
            distanciaKm: true,
            estado: true,
            fechaEnvio: true,
            fechaAceptacion: true,
            fechaEntrega: true,
            restaurante: {
                select: {
                    nombre: true,
                    domicilio: true,
                },
            },
        },
    });
};

// inicia el traslado solo si el envio esta pendiente y asignado al delivery
const iniciarSiAsignado = (envioId, deliveryId, db = prisma) => {
    return db.envio.updateMany({
        where: {
            id: envioId,
            deliveryId,
            estado: "pendiente",
            fechaAceptacion: { not: null },
            pedido: {
                estado: "listo",
            },
        },
        data: {
            estado: "en_transito",
        },
    });
};

// marca como entregado el envio en transito del delivery asignado
const entregarSiEnTransito = (envioId, deliveryId, db =prisma) => {
    return db.envio.updateMany({
        where: {
            id: envioId,
            deliveryId,
            estado: "en_transito",
            fechaEntrega: null,
            pedido: {
                estado: "en_transito",
            },
        },
        data: {
            estado: "entregado",
            fechaEntrega: new Date(),
        },
    });

};


module.exports = {
    crear,
    findDisponibles,
    contarDisponibles,
    aceptarSiDisponible,
    findByIdDelivery,
    iniciarSiAsignado,
    entregarSiEnTransito,
};