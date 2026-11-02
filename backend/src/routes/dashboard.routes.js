const { Router } = require("express");
const dashboardController = require("../controllers/dashboard.controller");
const { verificarToken } = require("../middlewares/auth.middleware");
const { cargarUsuarioActual, autorizarRoles } = require("../middlewares/autorizacion.middleware");
const router = Router();

router.get("/stats", verificarToken, cargarUsuarioActual, autorizarRoles("admin"), dashboardController.obtenerEstadisticas);

module.exports = router;
