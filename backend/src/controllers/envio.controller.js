const envioService = require("../services/envio.service");

// Devuelve los envios disponibles para el delivery autenticado
const listarDisponibles = async (req, res) => {
    const resultado = await envioService.listarEnviosDisponibles(
        req.query,
        req.usuarioActual
    );

    res.status(200).json(resultado);
};

// Asigna el envio al delivery autenticado
const aceptar = async (req, res) => {
    const envio = await envioService.aceptarEnvio(
        req.params.envioId,
        req.usuarioActual
    );

    res.status(200).json({
        message: "Envio aceptado con exito",
        envio,
    });
};

//inicia el traslado del envio asignado al delivey autenticado
const iniciar = async (req, res) => {
    const envio = await envioService.iniciarTraslado(
        req.params.envioId,
        req.usuarioActual
    );

    res.status(200).json({
        message: "Traslado iniciado con exito",
        envio,
    });
};

// confirma la entrega del envio del delivery autenticado
const entregar = async (req, res) => {
    const envio = await envioService.confirmarEntrega(
        req.params.envioId,
        req.usuarioActual
    );

    res.status(200).json({
        message: "Entrega confirmada con exito",
        envio,
    });
};


module.exports = {
    listarDisponibles,
    aceptar,
    iniciar,
    entregar,
};