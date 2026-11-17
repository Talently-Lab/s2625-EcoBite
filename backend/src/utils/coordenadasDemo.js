// TEMPORAL: eliminar cuando Frontend implemente la geolocalización.
const COORDENADAS_DEMO = {
    "cliente1@demo.ecobite.test": {
        latitudDestino: -34.6037,
        longitudDestino: -58.3816,
    },
    "cliente2@demo.ecobite.test": {
        latitudDestino: -34.6158,
        longitudDestino: -58.4333,
    },
};

const resolverCoordenadasDemo = (datos, usuarioActual) => {
    // Respetar las coordenadas que envíe Frontend.
    if (datos.latitudDestino != null && datos.longitudDestino != null) {
        return datos;
    }

    const email = usuarioActual.email?.toLowerCase();
    const coordenadas = COORDENADAS_DEMO[email];

    // Los usuarios normales mantienen sus coordenadas ausentes.
    if (!coordenadas) return datos;

    return { ...datos, ...coordenadas };
};

module.exports = { resolverCoordenadasDemo };