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
const { validarUuid } = require("../validators/uuid.validator");
const { validarPaginacion } = require("../validators/paginacion.validator");

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

// Calcula el impacto con los datos historicos del pedido
const obtenerImpactoEstimado = (pedido) => ({
    ahorroEnvasesGramos: calcularAhorroEnvasesGramos(pedido.items),
    ahorroTransporteGramos: pedido.envio ? calcularAhorroTransporteGramos(pedido.envio.distanciaKm): null,
});

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
    const pedidoConEnvio = { ...pedido, envio };

    return {
        ...pedidoConEnvio,
        impactoEstimado: obtenerImpactoEstimado(pedidoConEnvio),
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

// consulta un pedido perteneciente al cliente autenticado
const consultarPedido = async (pedidoId, usuarioActual) => {
    if (!usuarioActual || usuarioActual.nombreRol !== "cliente") {
        throw new AppError("Solo los clientes pueden consultar sus pedidos", 403);
    }

    const id = validarUuid(pedidoId, "El ID del pedido");
    const pedido = await pedidoRepository.findByIdYUsuario(
        id,
        usuarioActual.id,
    );

    if (!pedido) {
        throw new AppError("Pedido no encontrado", 404);
    }

    return { ...pedido, impactoEstimado: obtenerImpactoEstimado(pedido), };
};

// Comprueba el rol y obtiene el restaurante asignado al gerente
const obtenerRestauranteDelGerente = (usuarioActual) => {
    if (!usuarioActual || usuarioActual.nombreRol !== "gerente_restaurante") {
        throw new AppError("Solo los gerentes pueden consultar los pedidos del restaurante", 403);
    }

    if (!usuarioActual.restauranteId) {
        throw new AppError("No tienes un restaurante asignado", 403);
    }
    return usuarioActual.restauranteId;
};

// Consultar los pedidos del restaurante con paginacion
const listarPedidosRestaurante = async (query, usuarioActual) => {
    const restauranteId = obtenerRestauranteDelGerente(usuarioActual);
    const paginacion = validarPaginacion(query);

    // Se obtienen los pedidos de la pagina soliictada
    const pedidos = await pedidoRepository.findPorRestaurante(restauranteId, paginacion);

    // cuenta todos los pedidos del restaurante, sin limitar por pagina
    const total = await pedidoRepository.contarPorRestaurante(restauranteId);

    return {
        pedidos,
        paginacion: {
            pagina: paginacion.pagina,
            limite: paginacion.limite,
            total,
            // redondea hacia arriba para incluir la ultima pagina incompleta
            totalPaginas: Math.ceil(total / paginacion.limite),
        },
    };
};

module.exports = { crearPedido, consultarPedido, listarPedidosRestaurante, };