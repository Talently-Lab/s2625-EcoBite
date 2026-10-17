const { rateLimit } = require("express-rate-limit");

// Límite inicial por IP para el login.
const limitarLogin = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        error: "Demasiados intentos de login. Intenta más tarde.",
    },
});

// Contador independiente para crear cuentas.
const limitarRegistro = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        error: "Demasiados intentos de registro. Intenta más tarde.",
    },
});

module.exports = { limitarLogin, limitarRegistro };