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

// Construye el filtro compartido por el listado y su conteo
const construirFiltroListado = (filtros) => {
    const where = {};

    if (filtros.rol !== undefined) {
        where.tipoUsuario = {
            nombreRol: filtros.rol,
        }; // Filtra por el nombre del rol relacionado
    }

    if (filtros.activo !== undefined) {
        where.activo = filtros.activo;
    }

    return where;
};

// Obtiene una página de usuarios sin recuperar contraseñas
const listarParaAdmin = (filtros, paginacion, db = prisma) => {
    return db.usuario.findMany({
        where: construirFiltroListado(filtros),
        skip: paginacion.desplazamiento, // Omite los registros de las páginas anteriores
        take: paginacion.limite, // Limita la cantidad de usuarios devueltos
        orderBy: [
            { nombre: "asc" },
            { id: "asc" }, // Desempata nombres iguales para mantener un orden estable
        ],
        select: {
            id: true,
            nombre: true,
            email: true,
            imagenUri: true,
            activo: true,
            restauranteId: true,
            tipoUsuario: {
                select: {
                    nombreRol: true,
                },
            },
        },
    });
};

// Cuenta todos los usuarios que cumplen los mismos filtros
const contarParaAdmin = (filtros, db = prisma) => {
    return db.usuario.count({
        where: construirFiltroListado(filtros),
    });
};

module.exports = {
    findByEmail,
    create,
    findByIdConRol,
    listarParaAdmin,
    contarParaAdmin,
};