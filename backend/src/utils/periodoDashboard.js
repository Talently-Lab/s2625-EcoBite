const ZONA_HORARIA = "America/Argentina/Buenos_Aires";

const formatoFecha = new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONA_HORARIA,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
});

// Obtiene la fecha argentina sin depender de la zona del servidor
const obtenerFechaArgentina = (fecha) => {
    const partes = formatoFecha.formatToParts(fecha);
    const obtener = (tipo) =>
        partes.find((parte) => parte.type === tipo).value;

    return `${obtener("year")}-${obtener("month")}-${obtener("day")}`;
};

// Desplaza una fecha de calendario, incluso entre meses y años
const desplazarFecha = (dia, cantidadDias) => {
    const fecha = new Date(`${dia}T00:00:00.000Z`);
    fecha.setUTCDate(fecha.getUTCDate() + cantidadDias);
    return fecha.toISOString().slice(0, 10);
};

// Incluye hoy hasta el instante de consulta y los seis días anteriores
const obtenerPeriodoDashboard = (ahora = new Date()) => {
    const hasta = new Date(ahora.getTime());
    const hoy = obtenerFechaArgentina(hasta);

    const dias = Array.from(
        { length: 7 },
        (_, indice) => desplazarFecha(hoy, indice - 6)
    );

    // Medianoche argentina, UTC−03:00 para las fechas del MVP
    const desde = new Date(`${dias[0]}T00:00:00.000-03:00`);

    return {
        desde,
        hasta,
        dias,
        zonaHoraria: ZONA_HORARIA,
    };
};

module.exports = {
    obtenerPeriodoDashboard,
    desplazarFecha,
};