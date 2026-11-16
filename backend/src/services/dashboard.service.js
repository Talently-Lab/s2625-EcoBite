const AppError = require("../utils/AppError");
const dashboardRepository = require("../repositories/dashboard.repository");
const { calcularImpactoHistorico } = require("../utils/impactoDashboard");
const prisma = require("../config/prisma");
const { calcularDesgloseDiario } = require("../utils/desgloseDashboard");
const { obtenerPeriodoDashboard } = require("../utils/periodoDashboard");

const DIAS_RESUMEN = 7;
const MILISEGUNDOS_POR_DIA = 24 * 60 * 60 * 1000;
const SEMANAS_GRAFICO = 8;
const HORAS_ABANDONO = 1;
const MILISEGUNDOS_POR_HORA = 60 * 60 * 1000;

// Convierte valores decimales para la respuesta sin transformar null en cero
const numeroONull = (valor) =>
    valor == null ? null : Number(valor);

// Conserva los contadores y convierte únicamente los importes del impacto
const convertirImpactoANumeros = (impacto) => ({
    ...impacto,
    ahorroEnvasesKg: numeroONull(impacto.ahorroEnvasesKg),
    ahorroTransporteKg: numeroONull(impacto.ahorroTransporteKg),
    ahorroTotalKg: numeroONull(impacto.ahorroTotalKg),
});

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

// Construye períodos consecutivos y mantiene el actual igual al resumen
const resumirPedidosPorSemana = (pedidos, desde, hasta) => {
    const duracionSemana = DIAS_RESUMEN * MILISEGUNDOS_POR_DIA;
    const inicioActual = desde.getTime();

    return Array.from({ length: SEMANAS_GRAFICO }, (_, indice) => {
        const semanasAtras = SEMANAS_GRAFICO - 1 - indice;
        const inicioSemana = inicioActual - semanasAtras * duracionSemana;

        // El período actual termina ahora; los anteriores son completos
        const finSemana = semanasAtras === 0
            ? hasta.getTime()
            : inicioSemana + duracionSemana;

        const cantidad = pedidos.filter((pedido) => {
            const fecha = pedido.fecha.getTime();
            return fecha >= inicioSemana && fecha < finSemana;
        }).length;

        return {
            semanasAtras,
            desde: new Date(inicioSemana).toISOString(),
            hasta: new Date(finSemana).toISOString(),
            pedidosEntregados: cantidad,
        };
    });
};

// Consulta ventas e impacto usando el mismo período
const consultarResumenSemanal = async (periodo, db) => {
    const { desde, hasta, dias, zonaHoraria } = periodo;
    const resumen = await dashboardRepository.obtenerResumenVentasPeriodo(desde,hasta,db);
    const pedidos = await dashboardRepository.obtenerPedidosParaImpactoPeriodo(desde,hasta,db);
    const gruposRestaurantes = await dashboardRepository.contarRestaurantesPorEstado(db);
    const envios = await dashboardRepository.obtenerTransportesPeriodo(desde, hasta, db);

    const desdeGrafico = new Date(
        desde.getTime() -
        (SEMANAS_GRAFICO - 1) * DIAS_RESUMEN * MILISEGUNDOS_POR_DIA
    ); // Incluye siete períodos anteriores al período actual

    const fechasPedidos = await dashboardRepository.obtenerFechasPedidosPeriodo(desdeGrafico, hasta, db);
    const pedidosDiarios =  await dashboardRepository.obtenerPedidosParaDesgloseDiario(desde, hasta, db);
    const limiteAbandono = new Date(
        hasta.getTime() - HORAS_ABANDONO * MILISEGUNDOS_POR_HORA
    ); // Calcula el umbral usando el mismo instante final del resumen

    const abandono = await dashboardRepository.obtenerConteosAbandono(
        desde,
        hasta,
        limiteAbandono,
        db
    );

    const ultimosPedidos = await dashboardRepository.obtenerUltimosPedidos(db);

    return {
        alcance: "ultimos_7_dias",
        estadoPedido: "entregado",
        periodo: {
            desde: desde.toISOString(),
            hasta: hasta.toISOString(),
            campoFecha: "fecha",
            zonaHoraria,
        },
        pedidosEntregados: resumen._count.id,
        ventasTotales: numeroONull(resumen._sum.montoTotal?.toFixed(2)) ?? 0,
        ticketPromedio: numeroONull(resumen._avg.montoTotal?.toFixed(2)),
        ticketMinimo: numeroONull(resumen._min.montoTotal?.toFixed(2)),
        ticketMaximo: numeroONull(resumen._max.montoTotal?.toFixed(2)),
        impacto: convertirImpactoANumeros(calcularImpactoHistorico(pedidos)),
        restaurantes: resumirRestaurantes(gruposRestaurantes),
        transportes: resumirTransportes(envios),
        pedidosPorSemana: resumirPedidosPorSemana(fechasPedidos, desde, hasta),
        desgloseDiario: calcularDesgloseDiario(
            pedidosDiarios,
            envios,
            dias
        ).map((dia) => ({
            ...dia,
            ventasTotales: numeroONull(dia.ventasTotales),
            ticketPromedio: numeroONull(dia.ticketPromedio),
            ticketMinimo: numeroONull(dia.ticketMinimo),
            ticketMaximo: numeroONull(dia.ticketMaximo),
        })),
        ultimosPedidos: ultimosPedidos.map((pedido) => ({
            id: pedido.id,
            cliente: pedido.usuario.nombre,
            plato: pedido.items
                .map((item) => `${item.cantidad} x ${item.plato.nombre}`)
                .join(", "),
            estado: pedido.estado,
            montoTotal: Number(pedido.montoTotal),
            fecha: pedido.fecha.toISOString(),
        })),
        abandono: {
            estadoPedido: "pendiente",
            umbralHoras: HORAS_ABANDONO,
            pedidosCreados: abandono.pedidosCreados,
            pedidosAbandonados: abandono.pedidosAbandonados,
            tasaAbandonoPorcentaje: abandono.pedidosCreados > 0
                ? Number(
                    (
                        abandono.pedidosAbandonados * 100 /
                        abandono.pedidosCreados
                    ).toFixed(2) // Redondea el porcentaje completo a dos decimales
                )
                : null,
        },
    };
};

// Autoriza al administrador y consulta siete fechas argentinas
const obtenerResumenSemanal = async (usuarioActual) => {
    if (!usuarioActual || usuarioActual.nombreRol !== "admin") {
        throw new AppError(
            "Solo los administradores pueden consultar las estadísticas",
            403
        );
    }

    const periodo = obtenerPeriodoDashboard();

    return prisma.$transaction(
        (tx) => consultarResumenSemanal(periodo, tx),
        { isolationLevel: "RepeatableRead" }
    );
};

module.exports = {
    obtenerEstadisticas,
    obtenerResumenSemanal,
};