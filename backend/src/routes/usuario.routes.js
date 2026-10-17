const { Router } = require("express");
const usuarioController = require("../controllers/usuario.controller");
const { verificarToken } = require("../middlewares/auth.middleware");
const { limitarRegistro } = require("../middlewares/limitesAuth.middleware");

const router = Router();

router.post("/registrar", limitarRegistro, usuarioController.registrar);
router.get("/perfil", verificarToken, usuarioController.perfil);

module.exports = router;