const { Router } = require("express");
const envioController = require("../controllers/envio.controller");
const { verificarToken } = require("../middlewares/auth.middleware");
const { cargarUsuarioActual,
        autorizarRoles,
} = require("../middlewares/autorizacion.middleware");

const router = Router();

router.get("/disponibles", verificarToken, cargarUsuarioActual, autorizarRoles("delivery"), envioController.listarDisponibles);
router.patch("/:envioId/aceptar", verificarToken, cargarUsuarioActual, autorizarRoles("delivery"), envioController.aceptar);
router.patch("/:envioId/iniciar", verificarToken, cargarUsuarioActual, autorizarRoles("delivery"), envioController.iniciar);
router.patch("/:envioId/entregar", verificarToken, cargarUsuarioActual, autorizarRoles("delivery"), envioController.entregar);

module.exports = router;