const prisma = require("../config/prisma");

/**
 * Busca un usuario por su email e incluye su tipo de usuario
 * 
 * @param {string} email - correo electrónico del usuario
 * @returns 
 */
const findByEmail = (email) => {
    return prisma.usuario.findUnique({ 
        where: { email },
        include: { tipoUsuario: true },
    });
};

/**
 * Crea un usuario en la base de datos
 * 
 * @param {Object} data - Datos necesarios para crear el usuario
 * @returns {Promise<Object>} Usuario creado con su rol
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

/**
 * Busca un usuario por ID e incluye el nombre de su rol
 * Selecciona unicamente los campos necesarios para evitar
 * recuperar información sensible, como la contraseña
 * 
 * @param {string} id - Id del usuario que se desea consultar
 * @returns {Promise<object|null>} Usuario encontrado o null si no existe
 */
const findByIdConRol = (id) => {
    return prisma.usuario.findUnique({
        where: { id },
        select: {
            id: true,
            email: true,
            nombre: true,
            activo: true,
            restauranteId: true,
            tipoUsuario: { select: { nombreRol: true } },
        },
    });
};

module.exports = { findByEmail, create, findByIdConRol };