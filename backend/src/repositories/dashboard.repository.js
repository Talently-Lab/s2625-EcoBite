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

// Define los pedidos entregados creados dentro del periodo
const filtroPedidosPeriodo = (desde, hasta) => ({
    estado: "entregado",
    fecha: {
        gte: desde, // Incluye el inicio del período
        lt: hasta, // Excluye el final para evitar solapamientos entre períodos
    },
});

// Obtiene cantidad, ventas y valores del ticket dentro del período
const obtenerResumenVentasPeriodo = (desde, hasta, db = prisma) => {
    return db.pedido.aggregate({
        where: filtroPedidosPeriodo(desde, hasta),
        _count: {
            id: true,
        },
        _sum: {
            montoTotal: true,
        },
        _avg: { // Calcula el importe promedio de los pedidos seleccionados
            montoTotal: true,
        },
        _min: { // Obtiene el importe más bajo del período
            montoTotal: true,
        },
        _max: { // Obtiene el importe más alto del período
            montoTotal: true,
        },
    });
};

// Recupera las cantidades históricas y distancias del mismo período
const obtenerPedidosParaImpactoPeriodo = (desde, hasta, db = prisma) => {
    return db.pedido.findMany({
        where: filtroPedidosPeriodo(desde, hasta),
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

// Cuenta los restaurantes por su estado actual sin filtrar por fecha
const contarRestaurantesPorEstado = (db = prisma) => {
    return db.restaurante.groupBy({
        by: ["estado"], // Agrupa los restaurantes que tienen el mismo estado
        _count: {
            _all: true, // Cuenta todos los registros de cada grupo
        },
    });
};

// Obtiene el transporte de los envíos entregados creados en el período
const obtenerTransportesPeriodo = (desde, hasta, db = prisma) => {
    return db.envio.findMany({
        where: {
            estado: "entregado",
            fechaEnvio: {
                gte: desde, // Incluye el inicio del período
                lt: hasta, // Excluye el final del período
            },
        },
        select: {
            fechaEnvio: true,
            delivery: {
                select: {
                    tipoTransporte: {
                        select: {
                            descripcion: true,
                        },
                    },
                },
            },
        },
    });
};

// Obtiene las fechas de los pedidos entregados dentro del período
const obtenerFechasPedidosPeriodo = (desde, hasta, db = prisma) => {
    return db.pedido.findMany({
        where: filtroPedidosPeriodo(desde, hasta),
        select: {
            fecha: true,
        },
        orderBy: {
            fecha: "asc",
        },
    });
};

// Obtiene fecha e importe de los pedidos entregados para el desglose diario
const obtenerPedidosParaDesgloseDiario = (desde, hasta, db = prisma) => {
    return db.pedido.findMany({
        where: filtroPedidosPeriodo(desde, hasta),
        select: {
            fecha: true,
            montoTotal: true,
        },
        orderBy: {
            fecha: "asc",
        },
    });
};

// Cuenta los pedidos con items y los pendientes que superan el umbral
const obtenerConteosAbandono = async (desde, hasta, limiteAbandono, db = prisma) => {
    const filtro = {
        fecha: {
            gte: desde,
            lt: hasta,
        },
        items: {
            some: {}, // Exige que el pedido tenga al menos un item
        },
    };

    const pedidosCreados = await db.pedido.count({
        where: filtro,
    });

    const pedidosAbandonados = await db.pedido.count({
        where: {
            ...filtro, // conserva la ventana y la condicion de tener items
            estado: "pendiente",
            fecha: {
                ...filtro.fecha,
                lt: limiteAbandono, // exige mas de una hora desde la creación
            },
        },
    });

    return { pedidosCreados, pedidosAbandonados };
};

module.exports = {
    obtenerResumenVentas,
    obtenerPedidosParaImpacto,
    obtenerResumenVentasPeriodo,
    obtenerPedidosParaImpactoPeriodo,
    contarRestaurantesPorEstado,
    obtenerTransportesPeriodo,
    obtenerFechasPedidosPeriodo,
    obtenerPedidosParaDesgloseDiario,
    obtenerConteosAbandono,
 };