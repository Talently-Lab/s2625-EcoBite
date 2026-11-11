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
            descripcion: true,
            imagenUrl: true,
            domicilio: true,
            latitude: true,
            longitude: true,
            categoriaComida: true,
            ceroResiduos: true,
            envioVerde: true,
            recomendado: true,
            calificacionPromedio: true,
            totalValoraciones: true,
        },
        orderBy: { nombre: "asc"},
    });
};

//Busca un restaurante por su identificador
const findById = (id, db = prisma) =>{
    return db.restaurante.findUnique({
        where: { id },
        select: {
            id: true,
            estado: true,
            latitude: true,
            longitude: true,
        },
    });
};

// Obtiene el detalle de un restaurante activo por ID
const findActivoById = (id) => {
    return prisma.restaurante.findFirst({
        where: {
            id,
            estado: "activo",
        },
        select: {
            id: true,
            nombre: true,
            descripcion: true,
            imagenUrl: true,
            domicilio: true,
            latitude: true,
            longitude: true,
            categoriaComida: true,
            ceroResiduos: true,
            envioVerde: true,
            recomendado: true,
            calificacionPromedio: true,
            totalValoraciones: true,
        },
    });
};

module.exports = {
    findAllActive,
    findById,
    findActivoById,
};