const { Router, json } = require("express");
const eventController = require("../controllers/evento.controller");
const { limitarEventos } = require("../middlewares/evento.middleware");
const { verificarTokenOpcional, } = require("../middlewares/auth.middleware");
const { cargarUsuarioActualOpcional, } = require("../middlewares/autorizacion.middleware");
const AppError = require("../utils/AppError");

const router = Router();

// Exige json para procesar el evento
const exigirJson = (req, res, next) => {
    if (!req.is("application/json")){
        return next(new AppError("Content-Type debe ser application/json", 415));
    }
    next();
};


router.post(
    "/", limitarEventos, exigirJson,
    json({ limit: "8kb" }),
    verificarTokenOpcional,
    cargarUsuarioActualOpcional,
    eventController.registrar
);

module.exports = router;