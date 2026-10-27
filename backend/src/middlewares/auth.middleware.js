const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");


const verificarToken = (req, res, next) =>{
    const header = req.headers.authorization;
    
    if (!header || !header.startsWith("Bearer ")){
        return next(new AppError("Token no proporcionado", 401));
    }

    const token = header.split(" ")[1];
    try{
        req.usuario = jwt.verify(token, process.env.JWT_SECRET,{
            algorithms: ["HS256"],
        });
        next();
    }catch(error){
        if (error.name === "TokenExpiredError"){
            return next(new AppError("Token expirado", 401));
        }
        return next(new AppError("Token inválido", 401));
    }
};

const verificarTokenOpcional = (req, res, next) => {
    if (req.headers.authorization === undefined){
        return next();
    }
    return verificarToken(req, res, next);
};

module.exports = { verificarToken, verificarTokenOpcional };