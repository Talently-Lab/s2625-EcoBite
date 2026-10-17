const AppError = require("../utils/AppError");
const usuarioRepository = require("../repositories/usuario.repository");
const tipoUsuarioRepository = require("../repositories/tipoUsuario.repository");

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

    if (Array.from(contrasena).length < 15){
        throw new AppError("La contraseña debe tener al menos 15 caracteres", 400);
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

module.exports = { registrarUsuario };
