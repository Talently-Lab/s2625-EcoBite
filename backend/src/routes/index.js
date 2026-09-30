const { Router } = require("express");

const router = Router();

router.use("/restaurantes", require("./restaurante.routes"));
router.use("/usuarios", require("./usuario.routes"));

module.exports = router;