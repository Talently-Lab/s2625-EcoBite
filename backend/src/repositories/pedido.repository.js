const prisma = require("../config/prisma");

// Guarda un pedido y sus detalles
const crear = (datos, db=prisma) => {
    return db.pedido.create({
        data: {
            usuarioId: datos.usuarioId,
            restauranteId: datos.restauranteId,
            montoTotal: datos.montoTotal,
            estado: "pendiente",
            items: {
                create: datos.items.map((item) => ({
                    platoId: item.platoId,
                    cantidad: item.cantidad,
                    precioUnitario: item.precioUnitario,
                    cantidadVasos: item.cantidadVasos,
                    cantidadPlatos: item.cantidadPlatos,
                    cantidadCubiertos: item.cantidadCubiertos,
                    cantidadRecipiente: item.cantidadRecipiente,
                })),
            },
        },
        select: {
            id: true,
            usuarioId: true,
            restauranteId: true,
            fecha: true,
            estado: true,
            montoTotal: true,
            items: {
                select: {
                    id: true,
                    platoId: true,
                    cantidad: true,
                    precioUnitario: true,
                    cantidadVasos: true,
                    cantidadPlatos: true,
                    cantidadCubiertos: true,
                    cantidadRecipiente: true,
                },
            },
        },
    });
};

// Busca un pedido unicamente dentro de los pedidos del cliente
const findByIdYUsuario = ( pedidoId, usuarioId, db = prisma) => {
    return db.pedido.findFirst({
        where: {
            id: pedidoId,
            usuarioId,
        },
        include: {
            items: true,
            envio: true,
        },
    });
};

module.exports = { crear, findByIdYUsuario, };