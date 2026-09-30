const { Router } = require("express");
const controller = require("../controllers/restaurante.controller");

const router = Router();

router.get("/", controller.listar);

module.exports = router;