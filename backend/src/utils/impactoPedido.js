const AppError =  require("./AppError");

const GRAMOS_POR_ENVASE = 50n;

const CAMPOS_ENVASES = [
    "cantidadVasos",
    "cantidadPlatos",
    "cantidadCubiertos",
    "cantidadRecipiente",
];

// Obtiene los envases por unidad, null indica información incompleta
const contarEnvasesPorUnidad = (item) => {
    let total = 0n;

    for (const campo of CAMPOS_ENVASES){
        const cantidad = item[campo];

        if (cantidad === null || cantidad === undefined) {
            return null;
        }

        if (!Number.isInteger(cantidad) || cantidad < 0) {
            throw new AppError("El pedido contiene cantidades de envases invalidas", 500);
        }

        total += BigInt(cantidad);
    }
    return total;
};

// Calcula el ahorro usando las cantidades históricas del pedido
const calcularAhorroEnvasesGramos = (items) => {
    let totalEnvases = 0n;

    for (const item of items){
        const envasesPorUnidad = contarEnvasesPorUnidad(item);
        if (envasesPorUnidad === null) {
            return null;
        }

        totalEnvases += envasesPorUnidad * BigInt(item.cantidad);
    }

    return (totalEnvases * GRAMOS_POR_ENVASE).toString();
};

// Calcula el ahorro de transporte
const calcularAhorroTransporteGramos = (distaciaKm) => {
    const distacia = Number(distaciaKm);

    if (distaciaKm === null || distaciaKm === undefined ||
        !Number.isFinite(distacia) || distacia < 0) {
        throw new AppError("El envio contiene una distancia inválida", 500);
    }
    // convierte la distancia a centesimas y lo redondea
    const distanciaCentesimas = Math.round(distacia * 100);
    // Resta los primeros 1.5 km, sin permitir negativos
    const diferenciaCentesimas = Math.max(distanciaCentesimas - 150, 0);

    //aplica el factor 80 y devuelve un texto con 2 decimales
    return ((diferenciaCentesimas * 80) / 100).toFixed(2);
};

module.exports = { calcularAhorroEnvasesGramos, calcularAhorroTransporteGramos, };