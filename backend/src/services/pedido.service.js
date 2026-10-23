const AppError = require("../utils/AppError");
const pedidoRepository = require("../repositories/pedido.repository");
const platoRepository = require("../repositories/plato.repository");
const restauranteRepository = require("../repositories/restaurante.respository");
const { validarDatosPedido } = require("../validators/pedido.validator");
const { calcularPedido } = require("../utils/calculoPedido");
const { calcularAhorroEnvasesGramos,
        calcularAhorroTransporteGramos, } = require("../utils/impactoPedido");
const envioRepository = require("../repositories/envio.repository");
const prisma = require("../config/prisma");

// Comprueba el permiso antes de procesar los datos
const autorizarCrecion = (usuarioActual) => {
    if (!usuarioActual || usuarioActual.nombreRol !== "cliente") {
        throw new AppError("Solo los clientes pueden crear pedidos", 403);
    }
};

// Comprueba que el restaurante pueda recibir pedidos
const comprobarRestauranteActivo = async (restauranteId, db) => {
    const restaurante = await restauranteRepository.findById(restauranteId, db);
    if (!restaurante || restaurante.estado !== "activo") {
        throw new AppError("Restaurante no encontrado o no disponible", 404);
    }
};

// Guarda el pedido y su envio usandoo la misma transaccion
const crearPedidoConEnvio = async (datos, usuarioId, calculo, db) => {
    const pedido = await pedidoRepository.crear({
        usuarioId,
        restauranteId: datos.restauranteId,
        montoTotal: calculo.montoTotal,
        items: calculo.items,
    },db );

    const envio = await envioRepository.crear({
        pedidoId: pedido.id,
        restauranteId: pedido.restauranteId,
        domicilioDestino: datos.domicilioDestino,
    }, db);

    return {
        ...pedido,
        envio,
        impactoEstimado: {
            ahorroEnvasesGramos: calcularAhorroEnvasesGramos(pedido.items),
            ahorroTransporteGramos: calcularAhorroTransporteGramos(envio.distanciaKm),
        },
    };
};

// Consulta precios, calcula el total y guarda dentro de la transacción
const guardarPedido = async (datos, usuarioId, db) => {
    await comprobarRestauranteActivo(datos.restauranteId, db);

    const platoIds = datos.items.map((item) => item.platoId);
    const platos = await platoRepository.findDisponiblesParaPedido(
        datos.restauranteId,
        platoIds,
        db
    );

    const calculo = calcularPedido(datos.items, platos);

    return crearPedidoConEnvio(datos, usuarioId, calculo, db);
};

// Autoriza, valida y crea un pedido con sus detalles
const crearPedido = async (datos, usuarioActual) => {
    autorizarCrecion(usuarioActual);
    const datosValidados = validarDatosPedido(datos);

    return prisma.$transaction((tx) =>
        guardarPedido(datosValidados, usuarioActual.id, tx));
};

module.exports = { crearPedido };