const formatoFecha = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
}); // Usa la fecha de Argentina sin depender de la zona horaria del servidor

// Obtiene una fecha con formato YYYY-MM-DD
const obtenerDia = (fecha) => {
    const partes = formatoFecha.formatToParts(fecha); // Separa año, mes y día del formato local
    const obtener = (tipo) => partes.find((parte) => parte.type === tipo).value;

    return `${obtener("year")}-${obtener("month")}-${obtener("day")}`;
};

// Convierte centavos enteros a texto con dos decimales
const formatearCentavos = (centavos) => {
    const enteros = centavos / 100n;
    const decimales = (centavos % 100n).toString().padStart(2, "0");

    return `${enteros}.${decimales}`;
};

// Agrupa pedidos y transportes por su fecha local de creación
const calcularDesgloseDiario = (pedidos, envios) => {
    const dias = new Map(); // Guarda un grupo por cada fecha

    const obtenerGrupo = (fecha) => {
        const dia = obtenerDia(fecha);

        if (!dias.has(dia)) {
            dias.set(dia, {
                dia,
                pedidos: 0,
                totalCentavos: 0n,
                minimo: null,
                maximo: null,
                entregasTotales: 0,
                entregasConTransporte: 0,
                entregasBicicleta: 0,
                sinDatosTransporte: 0,
            });
        }

        return dias.get(dia);
    };

    for (const pedido of pedidos) {
        const grupo = obtenerGrupo(pedido.fecha);
        const centavos = BigInt(
            pedido.montoTotal.toFixed(2).replace(".", "")
        ); // Convierte el Decimal de Prisma a centavos exactos

        grupo.pedidos++;
        grupo.totalCentavos += centavos;

        if (grupo.minimo === null || centavos < grupo.minimo) {
            grupo.minimo = centavos;
        }

        if (grupo.maximo === null || centavos > grupo.maximo) {
            grupo.maximo = centavos;
        }
    }

    for (const envio of envios) {
        const grupo = obtenerGrupo(envio.fechaEnvio);
        const tipo = envio.delivery?.tipoTransporte?.descripcion
            ?.trim().toLowerCase();

        grupo.entregasTotales++;

        if (!tipo) {
            grupo.sinDatosTransporte++;
            continue;
        }

        grupo.entregasConTransporte++;

        if (tipo === "bicicleta") {
            grupo.entregasBicicleta++;
        }
    }

    return Array.from(dias.values())
        .sort((a, b) => a.dia.localeCompare(b.dia)) // Ordena las fechas desde la más antigua
        .map((grupo) => {
            const cantidad = BigInt(grupo.pedidos);

            const promedio = cantidad > 0n
                ? (grupo.totalCentavos * 2n + cantidad) / (2n * cantidad)
                : null; // Redondea el promedio al centavo sin usar decimales de punto flotante

            return {
                dia: grupo.dia,
                pedidos: grupo.pedidos,
                ventasTotales: formatearCentavos(grupo.totalCentavos),
                ticketPromedio: promedio === null
                    ? null
                    : formatearCentavos(promedio),
                ticketMinimo: grupo.minimo === null
                    ? null
                    : formatearCentavos(grupo.minimo),
                ticketMaximo: grupo.maximo === null
                    ? null
                    : formatearCentavos(grupo.maximo),
                entregasTotales: grupo.entregasTotales,
                entregasConTransporte: grupo.entregasConTransporte,
                entregasBicicleta: grupo.entregasBicicleta,
                sinDatosTransporte: grupo.sinDatosTransporte,
                porcentajeBicicleta: grupo.entregasConTransporte > 0
                    ? Number((
                        grupo.entregasBicicleta * 100 /
                        grupo.entregasConTransporte
                    ).toFixed(1))
                    : null,
            };
        });
};

module.exports = { calcularDesgloseDiario };