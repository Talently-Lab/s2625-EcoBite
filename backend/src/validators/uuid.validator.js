const validator = require("validator");
const AppError = require("../utils/AppError");

//valida un UUID y lo devuelve en minúsculas
const validarUuid = (valor, campo = "ID") => {
    if (typeof valor !== "string" || !validator.isUUID(valor)){
        throw new AppError(`${campo} debe ser un UUID válido`, 400);
    }

    return valor.toLowerCase();
};

module.exports = { validarUuid };