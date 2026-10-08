const { usuario } = require("../config/prisma");
const usuarioService = require("../services/usuario.service");

//
const registrar = async (req, res) =>{
    const usuario = await usuarioService.registrarUsuario(req.body ?? {});
    res.status(201).json({
        message: "Usuario registrado con exito",
        usuario,
    });
};

//
const perfil = (req, res) => {
    res.status(200).json({ usuario: req.usuario });
}

module.exports = { registrar, perfil };