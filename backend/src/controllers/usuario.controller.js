const usuarioService = require("../services/usuario.service");
const AppError =  require("../utils/AppError");

//
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
};

//
const perfil = (req, res) => {
    res.status(200).json({ usuario: req.usuario });
}

module.exports = { registrar, perfil };