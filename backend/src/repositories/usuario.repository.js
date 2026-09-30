const prisma = require("../config/prisma");

/**
 * Metodo Busca un usuario por su email
 */
const findByEmail = (email) => {
    return prisma.usuario.findUnique({ where: { email }});
};

/**
 * Metodo que crea un usuario y retorna únicamente los datos necesarios
 */
const create = (data) => {
    return prisma.usuario.create({
        data,
        select: {
            id: true,
            email: true,
            nombre: true,
            tipoUsuario: true,
        },
    });
};

module.exports = { findByEmail, create};