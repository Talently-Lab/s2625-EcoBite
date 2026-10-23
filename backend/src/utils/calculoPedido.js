const AppError = require("./AppError");

// Maximo que admite montoTotal: Decimal(10, 2)
const MAX_TOTAL_CENTAVOS = 9999999999n;

// convierte un precio decimal de la BD a centavos enteros
const convertirACentavos = (precio) => {
    const texto = precio.toString();
    if (!/^\d{1,8}(\.\d{1,2})?$/.test(texto)) {
        throw new AppError("Un plato tiene un precio inválido en la base de datos", 500);
    }

    // Separa el texto en parte entera y decimal ("12.5" -> "12" y "5"), si noo hay punto decimales queda asi: ""
    const [enteros, decimales = ""] = texto.split(".");
    // Trabaja en centavos con BigInt (enteros exactos) para evitar errores de redondeo de los float
    const centavos = BigInt(enteros) * 100n + BigInt(decimales.padEnd(2, "0"));

    if (centavos <= 0n) {
        throw new AppError("Un plato tiene un precio inválido en la base de datos", 500);
    }

    return centavos;
};

// Convierte centavos a texto decimal con dos posiciones
const convertirADecimal = (centavos) => {
    // División entre BigInt descarta el residuo: 1250n / 100n = 12n (parte entera en pesos)
    const enteros = centavos / 100n;
    // % da el residup (los centavos sobrantes), pdstart rellena con cero a la izquierda: 5n -> "05"
    const decimales = (centavos % 100n).toString().padStart(2, "0");

    return `${enteros}.${decimales}`; //Reconstruye el texto con formato moetario: "12.05"
};

// Calcula el total y prepara los detalles con precios de la BD
const calcularPedido = (items, platos) => {
    const platosPorId =  new Map(platos.map((plato) => [plato.id, plato]));
    let totalCentavos = 0n;

    // map que recorre el carrito y decuelve un arreglo nuevo con un detalle por item (mismo orden), sin modificar "items"
    const detalles = items.map((item) => {
        const plato = platosPorId.get(item.platoId);

        if (!plato) {
            throw new AppError("Uno o más platos no están disponibles en este restaurante", 400);
        }

        const precioCentavos = convertirACentavos(plato.precio);
        totalCentavos += precioCentavos * BigInt(item.cantidad);

        return {
            platoId: plato.id,
            cantidad: item.cantidad,
            precioUnitario: convertirADecimal(precioCentavos),
            cantidadVasos: plato.cantidadVasos,
            cantidadPlatos: plato.cantidadPlatos,
            cantidadCubiertos: plato.cantidadCubiertos,
            cantidadRecipiente: plato.cantidadRecipiente,
        };
    });

    if (totalCentavos > MAX_TOTAL_CENTAVOS) {
        throw new AppError("El total del pedido supera el importe permitido", 400);
    }

    return {
        montoTotal: convertirADecimal(totalCentavos),
        items: detalles,
    };
};


module.exports = { calcularPedido };