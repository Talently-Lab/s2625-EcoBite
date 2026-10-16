const { rateLimit } = require("express-rate-limit");

//Controla las peticiones por direccion IP
const limitarEventos = rateLimit({
    windowMs: 60 * 1000,
    limit: 30,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    statusCode: 429,
    message: {
        error: "Demasiados eventos. Intenta nuevamente más tarde.",
    },
});

module.exports = { limitarEventos };