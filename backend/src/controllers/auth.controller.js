const authService = require("../services/auth.service");

const login = async (req, res, next) => {
    try {
        const { email, contrasena } = req.body;
        const resultado = await authService.login({ email, contrasena });
        res.status(200).json(resultado);
    } catch (error){
        next(error);
    };
};

module.exports = { login };