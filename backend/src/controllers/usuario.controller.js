const usuarioService = require("../services/usuario.service");

/**
 * 
 */
const registrar = async (req, res) =>{
    const usuario = await usuarioService.registrarUsuario(req.body ?? {});
    res.status(201).json({
        message: "Usuario registrado con exito",
        usuario,
    });
};

module.exports = { registrar };