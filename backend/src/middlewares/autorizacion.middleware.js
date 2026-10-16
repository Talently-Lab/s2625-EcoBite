const AppError = require("../utils/AppError");
const usuarioRepository = require("../repositories/usuario.repository");

/**
 * Obtiene los datos actuales del usuario autenticado desde la base de datos
 * Debe ejecutarse después de verificarToken
 * Asigna los datos necesarios del usuario a req.usuarioActual
 * 
 * @param {Object} req - Solicitud HTTP de Express
 * @param {Object} res - Respuesta HTTP de express
 * @param {Function} next - funcion para continuar con el siguiente middleware
 * @returns {Promise<void>} No devuelve datos; continúa o lanza un error
 * @throws {AppError} 401 si el usuario no existe
 * @throws {AppError} 403 si la cuenta está desactivada
 */
const cargarUsuarioActual = async (req, res, next) => {
    const usuario = await usuarioRepository.findByIdConRol(req.usuario.id);

    if (!usuario){
        throw new AppError("Token invalido", 401);
    }

    if (!usuario.activo){
        throw new AppError("Cuenta desactivada", 403);
    }
    
    req.usuarioActual = {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        nombreRol: usuario.tipoUsuario.nombreRol,
        restauranteId: usuario.restauranteId,
    };
    next();
};

/**
 * Carga los datos del usuario si está autenticado
 * Si no hay usuario, continua sin generar un error
 *
 * @param {object} req - solicitud http
 * @param {object} res - respuesta http
 * @param {Function} next - continua al siguiente middleware
 */
const cargarUsuarioActualOpcional = (req, res, next) => {
    if (!req.usuario){
        return next();
    }
    return cargarUsuarioActual(req, res, next);
}


/**
 * Restringe el acceso a los roles especificados
 * debe ejecutarse despues de cargarUsuarioActual
 * 
 * @param  {...string} rolesPermitidos - Roles autorizados para acceder
 * @returns {Function} Middleware de express que valida los permisos
 * @throws {AppError} 403 si el usuario no tiene un rol autorizado
 */
const autorizarRoles = (...rolesPermitidos) => (req, res, next) => {
    if (!req.usuarioActual || !rolesPermitidos.includes(req.usuarioActual.nombreRol)){
        throw new AppError("No tienes permisos para esta accion", 403);
    }
    next();
};


module.exports = { cargarUsuarioActual, autorizarRoles, cargarUsuarioActualOpcional };

