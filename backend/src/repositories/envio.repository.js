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


module.exports = { crear };