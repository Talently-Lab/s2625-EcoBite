const prisma = require("../config/prisma");

// Cuenta y suma los pedidos entregados de toda la plataforma
const obtenerResumenVentas = ( db=prisma ) => {
    return db.pedido.aggregate({
        where: {
            estado: "entregado",
        },
        _count: {
            id: true,
        },
        _sum: {
            montoTotal: true,
        },
    });
};

// Obtiene los datos históricos necesarios para calcular el impacto.
const obtenerPedidosParaImpacto = (db = prisma) => {
    return db.pedido.findMany({
        where: {
            estado: "entregado",
        },
        select: {
            id: true,
            items: {
                select: {
                    cantidad: true,
                    cantidadVasos: true,
                    cantidadPlatos: true,
                    cantidadCubiertos: true,
                    cantidadRecipiente: true,
                },
            },
            envio: {
                select: {
                    distanciaKm: true,
                },
            },
        },
    });
};

module.exports = {
    obtenerResumenVentas,
    obtenerPedidosParaImpacto,
 };