require("dotenv/config");

const assert = require("node:assert/strict");
const prisma = require("../src/config/prisma");
const { obtenerPeriodoDashboard } = require("../src/utils/periodoDashboard");
const { calcularDistanciaKm } = require("../src/utils/distancia");

const APLICAR = process.argv.includes("--aplicar");
const LIMPIAR = process.argv.includes("--limpiar");
const HORA = 60 * 60 * 1000;
const DIA = 24 * HORA;
const MARCA = "[DEMO-DASHBOARD-V1]";

const EMAILS_CLIENTES = [
    "cliente1@demo.ecobite.test",
    "cliente2@demo.ecobite.test",
];

const EMAILS_DELIVERIES = [
    "delivery1@demo.ecobite.test",
    "delivery2@demo.ecobite.test",
];

const EMAILS_RESTAURANTES = [
    "contacto@verdevivo.test",
    "hola@raizorganica.test",
    "contacto@elhornito.test",
    "info@cocinacerrada.test",
];

const PLATOS_POR_RESTAURANTE = {
    "contacto@verdevivo.test": [1, 4],
    "hola@raizorganica.test": [2, 9],
    "contacto@elhornito.test": [3, 6],
    "info@cocinacerrada.test": [10, 14],
};

const idPlatoCatalogo = (numero) =>
    `a43c7d21-6b58-4e91-9c20-${String(numero).padStart(12, "0")}`;

const ENVASES = [
    "cantidadVasos",
    "cantidadPlatos",
    "cantidadCubiertos",
    "cantidadRecipiente",
];

const DESTINO = {
    domicilio: "Av. Corrientes y Av. 9 de Julio, Buenos Aires",
    latitud: -34.603851,
    longitud: -58.381775,
};

// Identificadores reservados para este conjunto de pruebas
const idDemo = (tipo, numero) =>
    `d45b000${tipo}-2026-4000-8000-${String(numero).padStart(12, "0")}`;

const exigir = (condicion, mensaje) => {
    if (!condicion) throw new Error(mensaje);
};

// Esta primera versión permite únicamente la base local
function comprobarDestino() {
    const conexion = new URL(process.env.DATABASE_URL);
    const locales = ["localhost", "127.0.0.1", "[::1]", "postgres"];

    exigir(
        locales.includes(conexion.hostname),
        "Este script solo permite la base local; no se ejecutó ninguna escritura"
    );

    console.log(`Destino: ${conexion.hostname}${conexion.pathname}`);
}

// Define casos con fechas relativas a un único instante
function prepararCasos(ahora) {
    const periodo = obtenerPeriodoDashboard(ahora);
    const casos = [];

    const agregar = (estado, fecha) => {
        casos.push({
            numero: casos.length + 1,
            estado,
            fecha,
        });
    };

    // Cuatro días con tres entregas; deja libre el cuarto día del período
    for (const indiceDia of [0, 1, 2, 4]) {
        for (const hora of [10, 13, 18]) {
            agregar(
                "entregado",
                new Date(
                    `${periodo.dias[indiceDia]}T${hora}:00:00.000-03:00`
                )
            );
        }
    }

    // Antiguos: superan claramente una hora
    for (const horas of [5, 4, 3]) {
        agregar("pendiente", new Date(ahora.getTime() - horas * HORA));
    }

    // Recientes: dejarán de ser recientes con el paso del tiempo
    for (const minutos of [10, 20]) {
        agregar("pendiente", new Date(ahora.getTime() - minutos * 60000));
    }

    agregar("listo", new Date(ahora.getTime() - 2 * HORA));
    agregar("aceptado", new Date(ahora.getTime() - 2 * HORA));
    agregar("en_transito", new Date(ahora.getTime() - 2 * HORA));

    // Dos entregas por cada período anterior
    for (let semana = 1; semana <= 7; semana++) {
        const inicio = periodo.desde.getTime() - semana * 7 * DIA;

        agregar("entregado", new Date(inicio + DIA + 12 * HORA));
        agregar("entregado", new Date(inicio + 3 * DIA + 12 * HORA));
    }

    return { periodo, casos };
}

async function cargarReferencias(db) {
    const clientes = [];

    for (const email of EMAILS_CLIENTES) {
        const usuario = await db.usuario.findUnique({
            where: { email },
            select: {
                id: true,
                activo: true,
                tipoUsuario: { select: { nombreRol: true } },
            },
        });

        exigir(
            usuario?.activo && usuario.tipoUsuario.nombreRol === "cliente",
            `Falta un cliente activo válido: ${email}`
        );

        clientes.push(usuario);
    }

    const deliveries = [];

    for (const email of EMAILS_DELIVERIES) {
        const usuario = await db.usuario.findUnique({
            where: { email },
            select: {
                activo: true,
                tipoUsuario: { select: { nombreRol: true } },
                delivery: {
                    include: {
                        tipoTransporte: true,
                        deliveryRestaurantes: true,
                    },
                },
            },
        });

        exigir(
            usuario?.activo &&
            usuario.tipoUsuario.nombreRol === "delivery" &&
            usuario.delivery,
            `Falta un delivery activo con perfil: ${email}`
        );

        deliveries.push(usuario.delivery);
    }

    const restaurantes = [];

    for (const email of EMAILS_RESTAURANTES) {
        const restaurante = await db.restaurante.findUnique({
            where: { email },
            include: {
                platos: {
                    where: {
                        activo: true,
                        id: {
                            in: PLATOS_POR_RESTAURANTE[email].map(idPlatoCatalogo),
                        },
                    },
                    orderBy: { id: "asc" },
                },
            },
        });

        exigir(
            restaurante?.estado === "activo" &&
            restaurante.platos.length === 2,
            `El restaurante debe estar activo y tener dos platos: ${email}`
        );

        for (const delivery of deliveries) {
            exigir(
                delivery.deliveryRestaurantes.some(
                    (relacion) => relacion.restauranteId === restaurante.id
                ),
                `Falta asociación del delivery ${delivery.id} con ${email}`
            );
        }

        restaurantes.push(restaurante);
    }

    return { clientes, deliveries, restaurantes };
}

// Calcula dinero con centavos enteros
function aCentavos(valor) {
    return BigInt(valor.toFixed(2).replace(".", ""));
}

function textoImporte(centavos) {
    return `${centavos / 100n}.${String(centavos % 100n).padStart(2, "0")}`;
}

function construirPedido(caso, referencias, ahora) {
    const indice = caso.numero - 1;
    const restaurante = referencias.restaurantes[indice % 4];
    const cliente = referencias.clientes[indice % 2];

    // Alterna repartidor independientemente del restaurante
    const delivery = referencias.deliveries[Math.floor(indice / 4) % 2];

    const asignado = ["aceptado", "en_transito", "entregado"]
        .includes(caso.estado);

    const items = restaurante.platos.map((plato, posicion) => {
        const cantidades = {};

        for (const campo of ENVASES) {
            exigir(
                Number.isInteger(plato[campo]) && plato[campo] >= 0,
                `El plato ${plato.id} tiene datos incompletos de ${campo}`
            );
            cantidades[campo] = plato[campo];
        }

        exigir(aCentavos(plato.precio) > 0n, "El precio debe ser positivo");

        return {
            id: idDemo(3, indice * 2 + posicion + 1),
            platoId: plato.id,
            cantidad: posicion === 0 ? (indice % 3) + 1 : 1,
            precioUnitario: plato.precio.toFixed(2),
            ...cantidades,
        };
    });

    const total = items.reduce(
        (suma, item) =>
            suma +
            BigInt(item.precioUnitario.replace(".", "")) *
            BigInt(item.cantidad),
        0n
    );

    exigir(total <= 9999999999n, "El total supera Decimal(10, 2)");

    const fechaAceptacion = asignado
        ? new Date(caso.fecha.getTime() + 15 * 60000)
        : null;

    const fechaEntrega = caso.estado === "entregado"
        ? new Date(caso.fecha.getTime() + 45 * 60000)
        : null;

    exigir(caso.fecha < ahora, "La creación no puede ser futura");

    if (fechaAceptacion) {
        exigir(
            fechaAceptacion > caso.fecha && fechaAceptacion < ahora,
            "Fecha de aceptación incoherente"
        );
    }

    if (fechaEntrega) {
        exigir(
            fechaEntrega > fechaAceptacion && fechaEntrega < ahora,
            "Fecha de entrega incoherente"
        );
    }

    return {
        id: idDemo(1, caso.numero),
        usuarioId: cliente.id,
        restauranteId: restaurante.id,
        fecha: caso.fecha,
        estado: caso.estado === "aceptado" ? "listo" : caso.estado,
        montoTotal: textoImporte(total),
        items: { create: items },
        envio: {
            create: {
                id: idDemo(2, caso.numero),
                restauranteId: restaurante.id,
                domicilioDestino: `${MARCA} ${DESTINO.domicilio}`,
                latitudDestino: DESTINO.latitud,
                longitudDestino: DESTINO.longitud,
                distanciaKm: calcularDistanciaKm(
                    restaurante.latitude,
                    restaurante.longitude,
                    DESTINO.latitud,
                    DESTINO.longitud
                ),
                deliveryId: asignado ? delivery.id : null,
                fechaEnvio: caso.fecha,
                fechaAceptacion,
                fechaEntrega,
                estado: caso.estado === "entregado"
                    ? "entregado"
                    : caso.estado === "en_transito"
                        ? "en_transito"
                        : "pendiente",
            },
        },
    };
}

// Elimina únicamente el conjunto identificado de este script
async function limpiarPedidosDemo(tx) {
    const ids = Array.from(
        { length: 34 },
        (_, indice) => idDemo(1, indice + 1)
    );

    const pedidos = await tx.pedido.findMany({
        where: { id: { in: ids } },
        include: { envio: true, items: true },
    });

    for (const pedido of pedidos) {
        const numero = ids.indexOf(pedido.id) + 1;

        exigir(
            pedido.envio?.id === idDemo(2, numero) &&
            pedido.envio.domicilioDestino ===
                `${MARCA} ${DESTINO.domicilio}`,
            `El pedido ${pedido.id} no tiene la identificación esperada`
        );

        const idsItems = [
            idDemo(3, (numero - 1) * 2 + 1),
            idDemo(3, (numero - 1) * 2 + 2),
        ];

        exigir(
            pedido.items.length === 2 &&
            pedido.items.every((item) => idsItems.includes(item.id)),
            `Los ítems del pedido ${pedido.id} no coinciden con el conjunto`
        );
    }

    // Solo borra después de verificar todos los registros encontrados
    const resultado = await tx.pedido.deleteMany({
        where: { id: { in: pedidos.map((pedido) => pedido.id) } },
    });

    console.log(
        `Eliminados ${resultado.count} pedidos demo y sus ítems y envíos`
    );
}

async function main() {
    exigir(
        !(APLICAR && LIMPIAR),
        "Usa --aplicar o --limpiar, nunca ambos juntos"
    );
    comprobarDestino();

    const ahora = new Date();
    const { periodo, casos } = prepararCasos(ahora);

    await prisma.$transaction(async (tx) => {
        if (LIMPIAR) {
            await limpiarPedidosDemo(tx);
            return;
        }

        const referencias = await cargarReferencias(tx);
        const pedidos = casos.map(
            (caso) => construirPedido(caso, referencias, ahora)
        );

        const ids = pedidos.map((pedido) => pedido.id);
        const existentes = await tx.pedido.count({
            where: { id: { in: ids } },
        });

        exigir(
            existentes === 0,
            `Ya existen ${existentes} pedidos con los IDs de esta prueba. ` +
            "No se duplicaron ni modificaron; primero debemos revisar ese conjunto"
        );

        console.log("Referencia UTC:", ahora.toISOString());
        console.log("Período argentino:", periodo.dias.join(", "));

        const conteos = {};
        for (const caso of casos) {
            conteos[caso.estado] = (conteos[caso.estado] ?? 0) + 1;
        }
        console.table(conteos);

        const actuales = pedidos.filter(
            (pedido) => pedido.fecha >= periodo.desde &&
                pedido.fecha < periodo.hasta
        );

        const entregados = actuales.filter(
            (pedido) => pedido.estado === "entregado"
        );

        const ventasCentavos = entregados.reduce(
            (suma, pedido) =>
                suma + BigInt(pedido.montoTotal.replace(".", "")),
            0n
        );

        // Valores del conjunto nuevo, sin sumar pedidos anteriores de tu base
        assert.equal(pedidos.length, 34);
        assert.equal(actuales.length, 20);
        assert.equal(entregados.length, 12);

        console.log("Resultados esperados del conjunto al crearlo:");
        console.log({
            pedidosCreados: 20,
            pedidosEntregados: 12,
            pedidosAbandonados: 3,
            tasaAbandonoPorcentaje: 15,
            ventasTotales: textoImporte(ventasCentavos),
            pedidosPorSemana: [2, 2, 2, 2, 2, 2, 2, 12],
        });

        console.table(referencias.deliveries.map((delivery) => ({
            deliveryId: delivery.id,
            transporte: delivery.tipoTransporte.descripcion,
        })));

        if (!APLICAR) {
            console.log("VISTA PREVIA: no se guardó ningún pedido");
            return;
        }

        for (const pedido of pedidos) {
            await tx.pedido.create({ data: pedido });
        }

        const guardados = await tx.pedido.findMany({
            where: { id: { in: ids } },
            include: { items: true, envio: true },
        });

        assert.equal(guardados.length, 34);

        for (const pedido of guardados) {
            assert.equal(pedido.items.length, 2);
            assert.ok(pedido.envio);
            assert.equal(pedido.envio.restauranteId, pedido.restauranteId);

            const suma = pedido.items.reduce(
                (total, item) =>
                    total + aCentavos(item.precioUnitario) *
                    BigInt(item.cantidad),
                0n
            );

            assert.equal(aCentavos(pedido.montoTotal), suma);

            for (const item of pedido.items) {
                for (const campo of ENVASES) {
                    assert.notEqual(item[campo], null);
                }
            }

            if (pedido.estado === "entregado") {
                assert.equal(pedido.envio.estado, "entregado");
                assert.ok(pedido.envio.deliveryId);
                assert.ok(pedido.envio.fechaAceptacion);
                assert.ok(pedido.envio.fechaEntrega);
            }
        }

        console.log("Guardados y verificados: 34 pedidos, 68 ítems y 34 envíos");
    }, { timeout: 60000 });
}

main()
    .catch((error) => {
        console.error(error.message);
        process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());