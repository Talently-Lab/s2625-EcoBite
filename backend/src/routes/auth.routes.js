const { Router } = require("express");
const authController = require("../controllers/auth.controller");
const { limitarLogin } = require("../middlewares/limitesAuth.middleware");

const router = Router();
router.post("/login",limitarLogin ,authController.login);

module.exports = router;