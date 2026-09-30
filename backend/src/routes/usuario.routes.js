const { Router } = require("express");
const controller = require("../controllers/usuario.controller");

const router = Router();

router.post("/registrar", controller.registrar);

module.exports = router;