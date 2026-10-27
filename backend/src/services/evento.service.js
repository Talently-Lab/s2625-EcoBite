const { randomUUID } = require("node:crypto");
const validator = require("validator");
const AppError = require("../utils/AppError");
const eventoRepository = require("../repositories/evento.repository");

const EVENTOS_PUBLICOS = [
    "visita_pagina_registro",
    "click_campo_email",
];

const ROLES_PERMITIDOS = [
    "cliente",
    "gerente_restaurante",
    "admin",
    "delivery",
];

const CAMPOS_PERMITIDOS = [
    "id",
    "nombre_evento",
    "rol_usuario",
    "session_id",
    "fecha_cliente",
    "propiedades",
];

/**
 * Comprueba que sea un objeto y no un arreglo
 * @param {*} valor - Valor recibido
 */
const esObjeto = (valor) => {
    return valor !== null &&
        typeof valor === "object" &&
        !Array.isArray(valor);
};

/**
 * Comprueba que sea un UUID version cuatro
 * @param {*} valor - identificador recibido
 */
const esUuidV4 = (valor) => {
    return typeof valor === "string" &&
        validator.isUUID(valor, "4");
};

/**
 * Convierte una fecha ISO con zona horaria.
 * @param {string} valor - Fecha recibida.
 * @returns {Date} Fecha validada.
 * @throws {AppError} 400 si la fecha es inválida.
 */
const parsearFechaCliente = (valor) => {
    if ( typeof valor !== "string" || 
        !validator.isISO8601(valor, {
            strict: true,
            strictSeparator: true,
        }) ||
        !/(Z|[+-]\d{2}:\d{2})$/.test(valor)
    ) {
        throw new AppError("fecha_cliente debe ser ISO 8601 con zona horaria", 400);
    }
    
    const fecha = new Date(valor);
    if (!Number.isFinite(fecha.getTime())){
        throw new AppError("fecha_cliente no es valida", 400);
    }
    return fecha;
};

/**
 * Valida y guarda un evento enviado por el frontend.
 * @param {Object} datos - Cuerpo de la petición.
 * @param {Object} [usuarioActual] - Usuario validado por middleware.
 * @returns {Promise<Object|null>} Evento creado o null si existe.
 * @throws {AppError} 400 si los datos son inválidos.
 */
const registrarEventoPublico = async (datos, usuarioActual) => {
    if (!esObjeto(datos)) {
        throw new AppError("El cuerpo debe ser un objeto JSON", 400);
    }

    const tieneCamposExtra = Object.keys(datos).some(
        (campo) => !CAMPOS_PERMITIDOS.includes(campo)
    );

    if (tieneCamposExtra) {
        throw new AppError("El evento contiene campos no permitidos", 400);
    }

    const {
        id,
        nombre_evento,
        rol_usuario,
        session_id,
        fecha_cliente,
        propiedades = {},
    } = datos;

    if (!esUuidV4(id) || !esUuidV4(session_id)) {
        throw new AppError("id y session_id deben ser UUID v4", 400);
    }

    if (!EVENTOS_PUBLICOS.includes(nombre_evento)) {
        throw new AppError("Evento público no permitido", 400);
    }

    if (!ROLES_PERMITIDOS.includes(rol_usuario)) {
        throw new AppError("Perfil de registro no permitido", 400);
    }

    const fechaCliente = parsearFechaCliente(fecha_cliente);

    if (!esObjeto(propiedades)) {
        throw new AppError("propiedades debe ser un objeto JSON", 400);
    }

    return eventoRepository.crear({
        id,
        nombreEvento: nombre_evento,
        rolUsuario: rol_usuario,
        sessionId: session_id,
        fechaCliente,
        usuarioId: usuarioActual?.id ?? null,
        propiedades,
    });
};

/**
 * Registra una cuenta creada sin propagar fallos de tracking.
 * @param {Object} datos - Datos proporcionados por el backend.
 * @param {string} datos.sessionId - Sesión recibida del frontend.
 * @param {string} datos.usuarioId - Identificador del usuario creado.
 * @param {string} datos.rolUsuario - Perfil analítico del usuario.
 * @returns {Promise<void>} Finaliza sin propagar errores.
 */
const registrarCuentaCreada = async ({
    sessionId,
    usuarioId,
    rolUsuario,
} = {}) => {
    // Los clientes existentes pueden no enviar tracking.
    if (sessionId === undefined || sessionId === null) {
        return;
    }

    try {
        if (!esUuidV4(sessionId) || !esUuidV4(usuarioId)) {
            throw new Error("Identificadores de tracking inválidos");
        }

        if (!ROLES_PERMITIDOS.includes(rolUsuario)) {
            throw new Error("Perfil analítico inválido");
        }

        await eventoRepository.crear({
            id: randomUUID(),
            nombreEvento: "click_boton_crear_cuenta",
            rolUsuario,
            sessionId,
            usuarioId,
            // Este evento se origina en el servidor.
            fechaCliente: new Date(),
            propiedades: {},
        });
    } catch (error) {
        console.error(
            "Tracking: no se pudo registrar la cuenta creada",
            { codigo: error.code, mensaje: error.message }
        );
    }
};

module.exports = { registrarEventoPublico, registrarCuentaCreada };