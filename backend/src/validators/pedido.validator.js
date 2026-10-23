const AppError = require("../utils/AppError");
const { validarUuid } = require("./uuid.validator");

// Compureba que los datos sean un objeto con campos permitidos
const validarCampos = (datos, camposPermitidos, contexto) => {
    if (datos === null || typeof datos !== "object" || Array.isArray(datos)) {
        throw new AppError(`${contexto} debe ser un objeto JSON`, 400);
    }

    const tieneExtras = Object.keys(datos).some(
        (campo) => !camposPermitidos.includes(campo)
    );

    if (tieneExtras) {
        throw new AppError(`${contexto} contiene campos no permitidos`, 400);
    }
};

// Valida las unidades solicitadas de un plato
const validarCantidad = (cantidad) => {
    if (!Number.isInteger(cantidad) ||
        cantidad < 1 ||
        cantidad > 2147483647 ) {
        throw new AppError("La cantidad debe ser un entero entre 1 y 2147483647", 400);
    }
    return cantidad;
};

// Valida y normaliza un elemento del carrito
const validarItem = (item) => {
    validarCampos(item, ["platoId", "cantidad"], "Cada elemento del carrito");
    return {
        platoId: validarUuid(item.platoId, "El ID del plato"),
        cantidad: validarCantidad(item.cantidad),
    };
};

// valida el carrito y rechaza platos repetidos
const validarItems = (items) => {
    if (!Array.isArray(items) || items.length === 0) {
        throw new AppError("items debe ser un arreglo con al menos un plato", 400);
    }

    const validados = items.map(validarItem);
    const identificadores =  new Set(validados.map((item) => item.platoId));

    if (identificadores.size !== validados.length) {
        throw new AppError("No repitas platos en el carrito; indica sus unidades en cantidad", 400);
    }

    return validados;
};

// Normaliza y valida el domicilio de entrega
const validaDomicilioDestino = (valor) => {
    if (typeof valor !== "string") {
        throw new AppError("El domicilio de entrega es obligatorio y debe ser texto", 400);
    }

    const domicilio = valor.trim().replace(/\s+/g, " ");
    if (!domicilio || Array.from(domicilio).length > 500) {
        throw new AppError("El domicilio de entrega debe tener entre 1 y 500 caracteres", 400);
    }
    return domicilio;
};

// Valida los datos del carrito para crear un pedido
const validarDatosPedido = (datos) => {
    validarCampos(datos, ["restauranteId", "items", "domicilioDestino"], "El pedido");

    return {
        restauranteId: validarUuid(
            datos.restauranteId,
            "El ID del restaurante"
        ),
        items: validarItems(datos.items),
        domicilioDestino: validaDomicilioDestino(datos.domicilioDestino),
    };
};

module.exports = { validarItems, validarDatosPedido, };