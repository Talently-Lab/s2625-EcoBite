const { usuario } = require("../config/prisma");
const usuarioService = require("../services/usuario.service");
const eventoService = require("../services/evento.service");

//Crea el usuario y registra su conversión
const registrar = async (req, res) =>{
    const usuario = await usuarioService.registrarUsuario(req.body ?? {});
    res.status(201).json({
        message: "Usuario registrado con exito",
        usuario,
    });

    //Ejecución del tracking sin esperar para responder
    void eventoService.registrarCuentaCreada({
        sessionId: req.body?.session_id,
        usuarioId: usuario.id,
        rolUsuario: "cliente",
    });
};

//
const perfil = (req, res) => {
    res.status(200).json({ usuario: req.usuario });
}

module.exports = { registrar, perfil };