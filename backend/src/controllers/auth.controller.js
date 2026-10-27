const authService = require("../services/auth.service");
const AppError = require("../utils/AppError");

const login = async (req, res, next) => {
    try {
        const datos = req.body;
        if(datos === null ||
            typeof datos !== "object"
            || Array.isArray(datos)){
            throw new AppError("El cuerpo debe ser un objeto JSON", 400);
        }
        const resultado = await authService.login(datos);
        res.status(200).json(resultado);
    } catch (error){
        next(error);
    };
};

module.exports = { login };