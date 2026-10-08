const { Router } = require("express");

const authRoutes = require("./auth.routes");
const usuarioRoutes = require("./usuario.routes");
const restauranteRoutes = require("./restaurante.routes");

const router = Router();

router.use("/auth", authRoutes);
router.use("/usuarios", usuarioRoutes);
router.use("/restaurantes", restauranteRoutes);

module.exports = router;