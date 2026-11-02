const AppError = require("../utils/AppError");
const dashboardRepository = require("../repositories/dashboard.repository");
const { calcularImpactoHistorico } = require("../utils/impactoDashboard");
const prisma = require("../config/prisma");

// consulta ventas e impacto sobre el mismo conjunto de datos
const consultarEstadisticas = async (db) => {
    const resumen = await dashboardRepository.obtenerResumenVentas(db);
    const pedidos = await dashboardRepository.obtenerPedidosParaImpacto(db);

    return {
        alcance: "historico",
        estadoPedido: "entregado",
        pedidosEntregados: resumen._count.id,
        ventasTotales: resumen._sum.montoTotal?.toFixed(2) ?? "0.00",
        impacto: calcularImpactoHistorico(pedidos),
    };
};

// Autoriza al administrador y obtiene las estadísticas globales
const obtenerEstadisticas = async (usuarioActual) => {
    if (!usuarioActual || usuarioActual.nombreRol !== "admin") {
        throw new AppError("Solo los administradores pueden consultar las estadísticas", 403);
    }

    return prisma.$transaction(
        (tx) => consultarEstadisticas(tx),
        { isolationLevel: "RepeatableRead" } // mantiene la misma version de los datos durante las consultas
    );
};

module.exports = { obtenerEstadisticas };