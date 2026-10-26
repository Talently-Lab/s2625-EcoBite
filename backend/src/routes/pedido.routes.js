const { Router } = require("express");
const pedidoController = require("../controllers/pedido.controller");
const { verificarToken } = require("../middlewares/auth.middleware");
const { cargarUsuarioActual,
    autorizarRoles, } = require("../middlewares/autorizacion.middleware");

const router = Router();

router.post("/", verificarToken, cargarUsuarioActual, autorizarRoles("cliente"), pedidoController.crear);
router.get("/restaurante", verificarToken, cargarUsuarioActual, autorizarRoles("gerente_restaurante"), pedidoController.listarRestaurante);
router.get("/:pedidoId", verificarToken, cargarUsuarioActual, autorizarRoles("cliente"), pedidoController.consultar);

module.exports = router;
