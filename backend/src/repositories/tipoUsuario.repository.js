const prisma = require("../config/prisma");

/**
 * Busca un tipo de usuario por su nombre de rol
 */
const findByNombreRol = (nombreRol) => {
    return prisma.tipoUsuario.findUnique({ where: { nombreRol }});
};

module.exports = { findByNombreRol };