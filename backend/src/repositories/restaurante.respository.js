const prisma = require("../config/prisma");

/**
 * Obtiene los restaurantes activos ordenados alfabéticamente
 * Solo retorna los campos necesarios para el listado
 */
const findAllActive = () => {
    return prisma.restaurante.findMany({
        where: {estado:"activo"},
        select: {
            id: true,
            nombre: true,
            imagenUrl: true,
            domicilio: true,
            latitude: true,
            longitude: true,
        },
        orderBy: { nombre: "asc"},
    });
};

//Busca un restaurante por su identificador
const findById = (id) =>{
    return prisma.restaurante.findUnique({
        where: { id },
        select: {
            id: true,
            estado: true,
        },
    });
};

module.exports = { findAllActive, findById };