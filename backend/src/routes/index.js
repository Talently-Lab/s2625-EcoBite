const { Router } = require("express");

const authRoutes = require("./auth.routes");
const usuarioRoutes = require("./usuario.routes");
const restauranteRoutes = require("./restaurante.routes");
const pedidoRoutes = require("./pedido.routes");
const envioRoutes = require("./envio.routes");

const router = Router();

router.use("/auth", authRoutes);
router.use("/usuarios", usuarioRoutes);
router.use("/restaurantes", restauranteRoutes);
router.use("/pedidos", pedidoRoutes);
router.use("/envios", envioRoutes);

module.exports = router;