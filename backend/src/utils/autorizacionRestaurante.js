const AppError = require("./AppError");
const { validarUuid } = require("../validators/uuid.validator");

//comprueba si el usuario puede gestionar el restaurante
const autorizarGestionRestaurante = (usuarioActual, restauranteId) => {
    const rolesPermitidos = ["admin", "gerente_restaurante"];

    if (!usuarioActual || !rolesPermitidos.includes(usuarioActual.nombreRol)){
        throw new AppError("No tienes permisos para esta acción", 403);
    }

    const id = validarUuid(restauranteId, "El ID del restaurante");
    if (usuarioActual.nombreRol === "gerente_restaurante" &&
         usuarioActual.restauranteId?.toLowerCase() !== id){
        throw  new AppError("No puedes gestionar este restaurante", 403);
    }

    return id;
};

module.exports = { autorizarGestionRestaurante };