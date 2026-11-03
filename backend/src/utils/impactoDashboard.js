const {
    calcularAhorroEnvasesGramos,
    calcularAhorroTransporteGramos,
} = require("./impactoPedido");

//const centesimas de gramo a kg con tres decimales
const convertirAKilogramos = (centesimasGramo) => {
    const gramos = (centesimasGramo + 50n) / 100n;  // redondea a gramos enteros usando BigInt
    const enteros = gramos / 1000n;
    const decimales = (gramos % 1000n).toString().padStart(3,"0"); // obtiene el resto y completa tres posiciones con ceros

    return `${enteros}.${decimales}`;
};

// Suma el impacto de los pedidos y detecta información incompleta
const calcularImpactoHistorico = (pedidos) => {
    let envasesCentesimas = 0n;
    let transporteCentesimas = 0n;
    let pedidosSinDatosEnvases = 0;
    let pedidosSinDatosTransporte = 0;

    for (const pedido of pedidos) {
        const ahorroEnvases = pedido.items.length > 0
            ? calcularAhorroEnvasesGramos(pedido.items)
            : null;

        if (ahorroEnvases === null) {
            pedidosSinDatosEnvases++;
        } else {
            envasesCentesimas += BigInt(ahorroEnvases) * 100n;
        }

        if (!pedido.envio || pedido.envio.distanciaKm == null) {
            pedidosSinDatosTransporte++;
        } else {
            const ahorroTransporte = calcularAhorroTransporteGramos(
                pedido.envio.distanciaKm
            );

            // la función devuelve gramos con exactamente dos decimales
            transporteCentesimas += BigInt(ahorroTransporte.replace(".", ""));
        }
    }

    const envasesCompletos = pedidosSinDatosEnvases === 0;
    const transporteCompleto = pedidosSinDatosTransporte === 0;

    return {
        ahorroEnvasesKg: envasesCompletos
            ? convertirAKilogramos(envasesCentesimas)
            : null,
        ahorroTransporteKg: transporteCompleto
            ? convertirAKilogramos(transporteCentesimas)
            : null,
        ahorroTotalKg: envasesCompletos && transporteCompleto
            ? convertirAKilogramos(
                envasesCentesimas + transporteCentesimas
            )
            : null,
        pedidosSinDatosEnvases,
        pedidosSinDatosTransporte,
    };
};

module.exports = { calcularImpactoHistorico };