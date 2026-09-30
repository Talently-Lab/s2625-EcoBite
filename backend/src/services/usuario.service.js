const AppError = require("../utils/AppError");
const usuarioRepository = require("../repositories/usuario.repository");
const tipoUsuarioRepository = require("../repositories/tipoUsuario.repository");
const { tipoUsuario } = require("../config/prisma");

const ROL_POR_DEFECTO = "cliente";

/**
 * 
 */
const registrarUsuario = async({name, email, password}) =>{
    if(!name || !email || !password) {
        throw new AppError("Faltan datos obligatorios para el registro", 400);
    }
    const emailNormalizado = email.trim().toLowerCase();

    const existente = await usuarioRepository.findByEmail(emailNormalizado);
    if (existente){
        throw new AppError("El email ya esta registrado", 409);
    }

    const rol = await tipoUsuarioRepository.findByNombreRol(ROL_POR_DEFECTO);
    if(!rol){
        throw new AppError("Rol por defecto no configurado", 500);
    }

    return {
        name: name.trim(),
        email: emailNormalizado,
        tipoUsuarioId: rol.id,
    };
};


module.exports = { registrarUsuario };
