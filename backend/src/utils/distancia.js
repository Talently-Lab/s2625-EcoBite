const AppError = require("./AppError");

const RADIO_TIERRA_KM = 6371;

// Convierte grados a radianes para las funciones trigonométricas
const aRadianes = (grados) => grados * Math.PI / 180;

// Comprueba las coordenadas usadas en el cálculo
const esCoordenadaValida = (valor, limite) =>
    Number.isFinite(valor) && Math.abs(valor) <= limite;

// Calcula la distancia estimada mediante la fórmula de Haversine
const calcularDistanciaKm = (
    latitude,
    longitude,
    latitudDestino,
    longitudDestino
) => {
    const latitudOrigen = latitude == null ? NaN : Number(latitude); // Convierte el Decimal de Prisma a número
    const longitudOrigen = longitude == null ? NaN : Number(longitude);

    if (!esCoordenadaValida(latitudOrigen, 90) || !esCoordenadaValida(longitudOrigen, 180)) {
        throw new AppError("El restaurante no tiene coordenadas válidas", 500);
    }

    if (!esCoordenadaValida(latitudDestino, 90) || !esCoordenadaValida(longitudDestino, 180)) {
        throw new AppError("Las coordenadas del destino son inválidas", 400);
    }

    const diferenciaLatitud = aRadianes(latitudDestino - latitudOrigen);
    const diferenciaLongitud = aRadianes(longitudDestino - longitudOrigen);

    const a =
        Math.sin(diferenciaLatitud / 2) ** 2 + // Calcula el componente de separación por latitud
        Math.cos(aRadianes(latitudOrigen)) *
        Math.cos(aRadianes(latitudDestino)) *
        Math.sin(diferenciaLongitud / 2) ** 2;

    const valorAjustado = Math.min(1, Math.max(0, a)); // Evita errores de precisión fuera del rango de 0 a 1
    const angulo = 2 * Math.atan2(
        Math.sqrt(valorAjustado),
        Math.sqrt(1 - valorAjustado)
    ); // Obtiene el ángulo entre ambos puntos sobre la Tierra

    const distancia = RADIO_TIERRA_KM * angulo;

    if (distancia > 999.99) {
        throw new AppError("La distancia al destino supera el máximo admitido", 400);
    }

    return distancia.toFixed(2); // Devuelve kilómetros como texto decimal compatible con Prisma
};

module.exports = { calcularDistanciaKm };