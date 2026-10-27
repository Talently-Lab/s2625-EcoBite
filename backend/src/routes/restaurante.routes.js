const { Router } = require("express");
const controller = require("../controllers/restaurante.controller");
const platoController = require("../controllers/plato.controller");
const { verificarToken } = require("../middlewares/auth.middleware");
const { cargarUsuarioActual, autorizarRoles, } = require("../middlewares/autorizacion.middleware");

const router = Router();

router.get("/", controller.listar);
router.get("/:restauranteId/platos", platoController.listarPorRestaurante);
router.post("/:restauranteId/platos", verificarToken, cargarUsuarioActual,
    autorizarRoles("admin", "gerente_restaurante"), platoController.crear);
router.patch("/:restauranteId/platos/:platoId", verificarToken, cargarUsuarioActual,
    autorizarRoles("admin", "gerente_restaurante"), platoController.editar
);
router.patch("/:restauranteId/platos/:platoId/estado", verificarToken, cargarUsuarioActual,
    autorizarRoles("admin", "gerente_restaurante"), platoController.cambiarEstado
);

module.exports = router;