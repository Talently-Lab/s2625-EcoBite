const AppError = require("../utils/AppError");
const { validarPaginacion } = require("./paginacion.validator");

const ROLES_PERMITIDOS = [
    "cliente",
    "gerente_restaurante",
    "delivery",
    "admin",
];


const CAMPOS_PERMITIDOS = ["pagina", "limite", "rol", "activo"];

//valida los filtros y la paginacion del listado de usuarios
const validarListadoUsuarios = (query) => {
    const contieneDesconocidos = Object.keys(query).some(
        (campo) => !CAMPOS_PERMITIDOS.includes(campo)); //Detecta parametros que el endpoint no admite

     if (contieneDesconocidos) {
        throw new AppError("La consulta contiene parametros no permitidos", 400);
    }

    const paginacion = validarPaginacion(query);
    const filtros = {};

    if (query.rol !== undefined) {
        if (typeof query.rol !== "string" || !ROLES_PERMITIDOS.includes(query.rol)) {
            throw new AppError("El rol indicado no es valido", 400);
        }

        filtros.rol = query.rol;
    }

    if (query.activo !== undefined) {
        if (query.activo !== "true" && query.activo !== "false") {
            throw new AppError("activo debe ser true o false", 400);
        }
        filtros.activo = query.activo === "true"; // convierte el texto de la url a booleano
    }

    return { paginacion, filtros};
};


module.exports = { validarListadoUsuarios }; 


