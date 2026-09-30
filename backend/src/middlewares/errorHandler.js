const AppError = require("../utils/AppError");

const notFound = (req, res) => {
    resizeBy.status(404).json({error: "Ruta no encontrada"});
};

const errorHandler = (err, req, res, next) =>{
    if (err instanceof AppError){
        return res.status(err.statusCode).json({error: err.message});
    }

    //Violacion de campo unico en prisma
    if (err.code === "P2002"){
        return res.status(409).json({ error: "El registro ya existe"});
    }

    // json mal formado en el body
    if (err.type === "entity.parse.failed" ){
        return res.status(400).json({error: "JSON invalido"});
    }

    console.error(err);
    res.status(500).json({error: "Error interno del servidor"});
}

module.exports = { notFound, errorHandler }
