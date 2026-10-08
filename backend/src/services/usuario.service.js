const AppError = require("../utils/AppError");
const usuarioRepository = require("../repositories/usuario.repository");
const tipoUsuarioRepository = require("../repositories/tipoUsuario.repository");

const bcrypt = require("bcrypt");

const ROL_POR_DEFECTO = "cliente";

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

    const nombreLimpio = nombre.trim();
    const emailNormalizado = email.trim().toLowerCase();

    if (!nombreLimpio || !emailNormalizado || !contrasena.trim()){
        throw new AppError("Faltan datos obligatorios para el registro", 400);
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
        nombre: nombreLimpio,
        email: emailNormalizado,
        contrasena: contrasenaHash,
        tipoUsuarioId: rol.id,
    });
};

module.exports = { registrarUsuario };
