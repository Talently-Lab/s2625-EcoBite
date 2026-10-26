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

// Consulta una pagina de pedidos del restaurante indicado
const findPorRestaurante = (
    restauranteId, { limite, desplazamiento }, db = prisma) => {
        return db.pedido.findMany({
            where: { restauranteId },
            skip: desplazamiento,
            take: limite,
            orderBy: [
                { fecha: "desc" },
                { id: "desc" },
            ],
            select: {
                id: true,
                restauranteId: true,
                fecha: true,
                estado: true,
                montoTotal: true,
                items: {
                    select: {
                        platoId: true,
                        cantidad: true,
                        precioUnitario: true,
                        plato: {
                            select: {
                                nombre: true,
                            },
                        },
                    },
                },
            },
        });
};

// Cuenta los pedidos del mismo restaurante para calcular las paginas
const contarPorRestaurante = (restauranteId, db = prisma) => {
    return db.pedido.count({
        where: { restauranteId },
    });
};

module.exports = { crear, findByIdYUsuario,
                   findPorRestaurante, contarPorRestaurante,
};