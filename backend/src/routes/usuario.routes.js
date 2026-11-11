const { Router } = require("express");
const usuarioController = require("../controllers/usuario.controller");
const { verificarToken } = require("../middlewares/auth.middleware");
const { limitarRegistro } = require("../middlewares/limitesAuth.middleware");
const { cargarUsuarioActual, autorizarRoles, } = require("../middlewares/autorizacion.middleware");

const router = Router();

router.post("/registrar", limitarRegistro, usuarioController.registrar);
router.get("/perfil", verificarToken, usuarioController.perfil);
router.get("/", verificarToken, cargarUsuarioActual, autorizarRoles("admin"), usuarioController.listar);


module.exports = router;