const AppError = require("../utils/AppError");
const usuarioRepository = require("../repositories/usuario.repository");
const tipoUsuarioRepository = require("../repositories/tipoUsuario.repository");
const prisma = require("../config/prisma");
const { validarListadoUsuarios } = require("../validators/usuarioListado.validator");
const { calcularAhorroEnvasesGramos, calcularAhorroTransporteGramos, } = require("../utils/impactoPedido");

const bcrypt = require("bcrypt");
const validator = require("validator");

const ROL_POR_DEFECTO = "cliente";
const DOMINIOS_PERMITIDOS = ["gmail.com", "outlook.com", "hotmail.com"];

//
const capitalizarNombre = (texto) =>
    texto
        .trim()
        .replace(/\s+/g, " ")
        .toLocaleLowerCase("es")
        .replace(/(^|\s)\S/g, (m) => m.toLocaleUpperCase("es"));
    

/**
 * 
 */
const registrarUsuario = async({nombre, email, contrasena}) =>{
    if(!nombre || !email || !contrasena) {
        throw new AppError("Faltan datos obligatorios para el registro", 400);
    }
    if(typeof nombre !== "string" || typeof email !== "string" || typeof contrasena !== "string"){
        throw new AppError("Los datos deben ser texto", 400);
    }

    const nombreNormalizado = capitalizarNombre(nombre);
    if (!nombreNormalizado){
        throw new AppError("El nombre no puede estar vacío", 400);
    }

    if (Array.from(nombreNormalizado).length > 200){
        throw new AppError("El nombre no puede superar 200 caracteres", 400);
    }

    if (!contrasena.trim()){
        throw new AppError("La contraseña no puede contener solo espacios", 400);
    }

    if (Array.from(contrasena).length < 10){
        throw new AppError("La contraseña debe tener al menos 10 caracteres", 400);
    }

    if (Buffer.byteLength(contrasena, "utf8") > 72) {
        throw new AppError("La contraseña no puede superar 72 bytes", 400);
    }

    const emailNormalizado = email.trim().toLowerCase();

    if (emailNormalizado.length > 200 || !validator.isEmail(emailNormalizado)){
        throw new AppError("El email no es válido", 400);
    }

    const dominio = emailNormalizado.split("@")[1];
    if (!DOMINIOS_PERMITIDOS.includes(dominio)){
        throw new AppError("El dominio del correo no está permitido", 400);
    }


    const existente = await usuarioRepository.findByEmail(emailNormalizado);
    if (existente){
        throw new AppError("El email ya esta registrado", 409);
    }

    const rol = await tipoUsuarioRepository.findByNombreRol(ROL_POR_DEFECTO);
    if(!rol){
        throw new AppError("Rol por defecto no configurado", 500);
    }

    const contrasenaHash = await bcrypt.hash(contrasena, 10);

    return usuarioRepository.create({
        nombre: nombreNormalizado,
        email: emailNormalizado,
        contrasena: contrasenaHash,
        tipoUsuarioId: rol.id,
    });
};

// Autoriza al administrador y consulta usuarios con filtros y paginación
const listarUsuarios = async (query, usuarioActual) => {
    if (!usuarioActual || usuarioActual.nombreRol !== "admin") {
        throw new AppError("Solo los administradores pueden listar usuarios", 403);
    }

    const { filtros, paginacion } = validarListadoUsuarios(query);

    return prisma.$transaction(async (tx) => {
        const usuarios = await usuarioRepository.listarParaAdmin(
            filtros,
            paginacion,
            tx
        );

        const total = await usuarioRepository.contarParaAdmin(filtros, tx);

        return {
            usuarios,
            paginacion: {
                pagina: paginacion.pagina,
                limite: paginacion.limite,
                total,
                totalPaginas: Math.ceil(total / paginacion.limite), // Redondea hacia arriba para incluir la última página incompleta
            },
        };
    }, {
        isolationLevel: "RepeatableRead", // Mantiene el listado y el conteo sobre la misma versión de los datos
    });
};

// Obtiene las métricas acumuladas del cliente autenticado
const obtenerPerfilCliente = async (usuarioActual) => {
    if (!usuarioActual || usuarioActual.nombreRol !== "cliente") {
        throw new AppError("Solo los clientes pueden consultar estas métricas", 403);
    }

    const usuarioId = usuarioActual.id;

    return prisma.$transaction(async (tx) => {
        const pedidosSustentables =
            await usuarioRepository.contarPedidosCliente(usuarioId, tx);

        const entregados =
            await usuarioRepository.obtenerPedidosEntregadosCliente(usuarioId, tx);

        const recientes =
            await usuarioRepository.obtenerPedidosRecientesCliente(usuarioId, tx);

        let ahorroEnvases = 0;
        let ahorroTransporte = 0;

        let datosEnvasesCompletos = true;
        let datosTransporteCompletos = true;

        for (const pedido of entregados) {
            const ahorro = calcularAhorroEnvasesGramos(pedido.items);

            if (ahorro === null) {
                datosEnvasesCompletos = false;
            } else {
                ahorroEnvases += Number(ahorro);
            }

            if (pedido.envio?.distanciaKm == null) {
                datosTransporteCompletos = false;
            } else {
                ahorroTransporte += Number(
                    calcularAhorroTransporteGramos(pedido.envio.distanciaKm)
                );
            }
        }

        return {
            pedidosSustentables,

            co2Ahorrado: datosEnvasesCompletos && datosTransporteCompletos
                ? Number(((ahorroEnvases + ahorroTransporte) / 1000).toFixed(3))
                : null,

            // Cada envase biodegradable representa 50 gramos de CO2
            envasesReutilizados: datosEnvasesCompletos
                ? ahorroEnvases / 50
                : null,

            pedidosRecientes: recientes.map((pedido) => ({
                id: pedido.id,
                fecha: pedido.fecha.toISOString(),
                restaurante: pedido.restaurante.nombre,
                total: Number(pedido.montoTotal),
                estado: pedido.estado,
            })),
        };
    }, {
        isolationLevel: "RepeatableRead",
    });
};

module.exports = {
    registrarUsuario,
    listarUsuarios,
    obtenerPerfilCliente,
};
