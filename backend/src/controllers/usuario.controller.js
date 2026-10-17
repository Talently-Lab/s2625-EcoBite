const usuarioService = require("../services/usuario.service");
const eventoService = require("../services/evento.service");
const AppError = require("../utils/AppError");

//Crea el usuario y registra su conversión
const registrar = async (req, res) =>{
    const datos = req.body;
    if (datos === null ||
        typeof datos !== "object" ||
        Array.isArray(datos)
    ){
        throw new AppError("El cuerpo debe ser un objeto JSON", 400);
    }
    const usuario = await usuarioService.registrarUsuario(datos);
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