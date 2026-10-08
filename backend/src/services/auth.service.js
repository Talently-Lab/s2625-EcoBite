const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");
const usuarioRepository = require("../repositories/usuario.repository");

/**
 * 
 */
const login = async({ email, contrasena })=> {
    if (typeof email !== "string" || typeof contrasena !== "string"){
        throw new AppError("Los datos deben ser texto",400);
    }

    if (!email.trim() || !contrasena){
        throw new AppError("Email y/o contraseña son obligatorios", 400);
    }

    const emailNormalizado = email.trim().toLowerCase();
    const usuario = await usuarioRepository.findByEmail(emailNormalizado);

    if (!usuario){ throw new AppError("Credenciales inválidas",401); }

    const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena);

    if (!contrasenaValida) { throw new AppError("Credenciales inválidas", 401); }

    const token = jwt.sign({
        id: usuario.id,
        email: usuario.email,
        tipoUsuarioId: usuario.tipoUsuarioId,
    },
    process.env.JWT_SECRET,
    {
        expiresIn: "2h",
    }
    );

    return {
        token,
        usuario: {
            id: usuario.id,
            nombre: usuario.nombre,
            email: usuario.email,
            tipoUsuario: usuario.tipoUsuario,
        },
    };
};

module.exports = { login };