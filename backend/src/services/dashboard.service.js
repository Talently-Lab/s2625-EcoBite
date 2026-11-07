const AppError = require("../utils/AppError");
const dashboardRepository = require("../repositories/dashboard.repository");
const { calcularImpactoHistorico } = require("../utils/impactoDashboard");
const prisma = require("../config/prisma");
const { calcularDesgloseDiario } = require("../utils/desgloseDashboard");

const DIAS_RESUMEN = 7;
const MILISEGUNDOS_POR_DIA = 24 * 60 * 60 * 1000;
const SEMANAS_GRAFICO = 8;

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

// Organiza los conteos y calcula los porcentajes por estado
const resumirRestaurantes = (grupos) => {
    const activos = grupos.find(
        (grupo) => grupo.estado === "activo"
    )?._count._all ?? 0; // Busca el grupo y usa cero si no existe

    const inactivos = grupos.find(
        (grupo) => grupo.estado === "inactivo"
    )?._count._all ?? 0;

    const total = activos + inactivos;

    return {
        alcance: "actual",
        total,
        activos,
        inactivos,
        porcentajeActivos: total > 0
            ? Number((activos * 100 / total).toFixed(1)) // Redondea a un decimal y devuelve un número
            : 0,
        porcentajeInactivos: total > 0
            ? Number((inactivos * 100 / total).toFixed(1))
            : 0,
    };
};

// Agrupa las entregas por transporte y cuenta los datos faltantes
const resumirTransportes = (envios) => {
    const conteos = new Map(); // Guarda la cantidad de entregas por nombre de transporte
    let sinDatosTransporte = 0;

    for (const envio of envios) {
        const tipo = envio.delivery?.tipoTransporte?.descripcion
            ?.trim().toLowerCase(); // Unifica espacios exteriores y mayúsculas

        if (!tipo) {
            sinDatosTransporte++;
            continue; // Pasa al siguiente envío cuando falta el transporte
        }

        conteos.set(tipo, (conteos.get(tipo) ?? 0) + 1);
    }

    const entregasConTransporte = envios.length - sinDatosTransporte;

    const distribucion = Array.from(
        conteos,
        ([tipoTransporte, cantidad]) => ({
            tipoTransporte,
            cantidad,
            porcentaje: Number(
                (cantidad * 100 / entregasConTransporte).toFixed(1)
            ),
        })
    ); // Convierte los grupos en un arreglo para la respuesta JSON

    distribucion.sort(
        (a, b) =>
            b.cantidad - a.cantidad ||
            a.tipoTransporte.localeCompare(b.tipoTransporte)
    ); // Ordena por cantidad descendente y luego por nombre

    const entregasBicicleta = conteos.get("bicicleta") ?? 0;

    return {
        campoFecha: "fechaEnvio",
        entregasTotales: envios.length,
        entregasConTransporte,
        sinDatosTransporte,
        entregasBicicleta,
        porcentajeBicicleta: entregasConTransporte > 0
            ? Number(
                (entregasBicicleta * 100 / entregasConTransporte).toFixed(1))
            : null,
        distribucion,
    };
};

// Construye ocho períodos semanales desde el más antiguo al más reciente
const resumirPedidosPorSemana = (pedidos, hasta) => {
    const duracionSemana = DIAS_RESUMEN * MILISEGUNDOS_POR_DIA;
    const fin = hasta.getTime(); // Convierte la fecha a milisegundos para calcular los límites

    return Array.from({ length: SEMANAS_GRAFICO }, (_, indice) => {
        const semanasAtras = SEMANAS_GRAFICO - 1 - indice;
        const finSemana = fin - semanasAtras * duracionSemana;
        const inicioSemana = finSemana - duracionSemana;

        const cantidad = pedidos.filter((pedido) => {
            const fecha = pedido.fecha.getTime();
            return fecha >= inicioSemana && fecha < finSemana;
        }).length; // Cuenta solo los pedidos dentro de este período

        return {
            semanasAtras,
            desde: new Date(inicioSemana).toISOString(),
            hasta: new Date(finSemana).toISOString(),
            pedidosEntregados: cantidad,
        };
    }); // Genera las ocho semanas, incluidas las que no tienen pedidos
};

// Consulta ventas e impacto usando el mismo período
const consultarResumenSemanal = async (desde, hasta, db) => {
    const resumen = await dashboardRepository.obtenerResumenVentasPeriodo(desde,hasta,db);
    const pedidos = await dashboardRepository.obtenerPedidosParaImpactoPeriodo(desde,hasta,db);
    const gruposRestaurantes = await dashboardRepository.contarRestaurantesPorEstado(db);
    const envios = await dashboardRepository.obtenerTransportesPeriodo(desde, hasta, db);

    const desdeGrafico = new Date(
        hasta.getTime() -
        SEMANAS_GRAFICO * DIAS_RESUMEN * MILISEGUNDOS_POR_DIA
    ); // Calcula el inicio de los últimos 56 días

    const fechasPedidos = await dashboardRepository.obtenerFechasPedidosPeriodo(desdeGrafico, hasta, db);
    const pedidosDiarios =  await dashboardRepository.obtenerPedidosParaDesgloseDiario(desde, hasta, db);

    return {
        alcance: "ultimos_7_dias",
        estadoPedido: "entregado",
        periodo: {
            desde: desde.toISOString(), // Devuelve la fecha en UTC con formato ISO
            hasta: hasta.toISOString(),
            campoFecha: "fecha",
        },
        pedidosEntregados: resumen._count.id,
        ventasTotales: resumen._sum.montoTotal?.toFixed(2) ?? "0.00",
        ticketPromedio: resumen._avg.montoTotal?.toFixed(2) ?? null,
        ticketMinimo: resumen._min.montoTotal?.toFixed(2) ?? null,
        ticketMaximo: resumen._max.montoTotal?.toFixed(2) ?? null,
        impacto: calcularImpactoHistorico(pedidos),
        restaurantes: resumirRestaurantes(gruposRestaurantes),
        transportes: resumirTransportes(envios),
        pedidosPorSemana: resumirPedidosPorSemana(fechasPedidos, hasta),
        desgloseDiario: calcularDesgloseDiario(pedidosDiarios, envios),
    };
};

// Autoriza al administrador y establece una ventana de siete días
const obtenerResumenSemanal = async (usuarioActual) => {
    if (!usuarioActual || usuarioActual.nombreRol !== "admin") {
        throw new AppError("Solo los administradores pueden consultar las estadísticas",403);
    }

    const hasta = new Date();
    const desde = new Date( hasta.getTime() - DIAS_RESUMEN * MILISEGUNDOS_POR_DIA); // Resta siete días exactos al instante de consulta

    return prisma.$transaction(
        (tx) => consultarResumenSemanal(desde, hasta, tx),
        { isolationLevel: "RepeatableRead" } // Mantiene la misma versión de los datos durante las consultas
    );
};

module.exports = {
    obtenerEstadisticas,
    obtenerResumenSemanal,
};