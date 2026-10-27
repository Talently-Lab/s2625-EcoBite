const eventoService = require("../services/evento.service");

/**
 * Procesa un evento publico de tracking
 * @param {Object} req - solicitud http
 * @param {Object} res - respuesta http
 * @returns {Promise<void>} Responde cuando termina el guardado
 */
const registrar = async (req, res) => {
    await eventoService.registrarEventoPublico(
        req.body,
        req.usuarioActual,
    );
    
    res.status(202).json({
        message: "Evento aceptado",
    });
};

module.exports = { registrar };