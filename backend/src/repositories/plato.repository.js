const prisma = require("../config/prisma");

//obtiene los platos activos de un restaurante activo
const findActivosByRestaurante = (restauranteId) => {
    return prisma.plato.findMany({
        where: {
            restauranteId,
            activo: true,
            restaurante: {
                estado: "activo",
            },
        },
        select: {
            id: true,
            restauranteId: true,
            nombre: true,
            imagenUrl: true,
            precio: true,
            cantidadVasos: true,
            cantidadPlatos: true,
            cantidadCubiertos: true,
            cantidadRecipiente: true,
        },
        orderBy: [
            { nombre: "asc" },
            { id: "asc" },
        ],
    });
};

// Guarda un plato con los datos validos por el servicio
const crear = (datos) => {
    return prisma.plato.create({
        data: {
            restauranteId: datos.restauranteId,
            nombre: datos.nombre,
            imagenUrl: datos.imagenUrl,
            precio: datos.precio,
            cantidadVasos: datos.cantidadVasos,
            cantidadPlatos: datos.cantidadPlatos,
            cantidadCubiertos: datos.cantidadCubiertos,
            cantidadRecipiente: datos.cantidadRecipiente,
        },
        select: {
            id: true,
            restauranteId: true,
            nombre: true,
            imagenUrl: true,
            precio: true,
            activo: true,
            cantidadVasos: true,
            cantidadPlatos: true,
            cantidadCubiertos: true,
            cantidadRecipiente: true,
        },
    });
};

// Busca un plato dentro del restaurante indicado
const findByIdYRestaurante = (platoId, restauranteId) => {
    return prisma.plato.findFirst({
        where: {
            id: platoId,
            restauranteId,
        },
        select: {
            id: true,
            restauranteId: true,
            activo: true,
        },
    });
};

// Actualiza los campos permitidos de un plato del restaurante
const actualizar = (platoId, restauranteId, datos) => {
    return prisma.plato.update({
        where: {
            id: platoId,
            restauranteId,
        },
        data: {
            nombre: datos.nombre,
            precio: datos.precio,
            cantidadVasos: datos.cantidadVasos,
            cantidadPlatos: datos.cantidadPlatos,
            cantidadCubiertos: datos.cantidadCubiertos,
            cantidadRecipiente: datos.cantidadRecipiente,
        },
        select: {
            id: true,
            restauranteId: true,
            nombre: true,
            imagenUrl: true,
            precio: true,
            activo: true,
            cantidadVasos: true,
            cantidadPlatos: true,
            cantidadCubiertos: true,
            cantidadRecipiente: true,
        },
    });
};

// Cambia la disponibilidad de un plato del restaurante
const actualizarEstado = (platoId, restauranteId, activo) => {
    return prisma.plato.update({
        where: {
            id: platoId,
            restauranteId,
        },
        data: { activo },
        select: {
            id: true,
            nombre: true,
            activo: true,
        },
    });
};

module.exports = { findActivosByRestaurante, crear,
     findByIdYRestaurante, actualizar, actualizarEstado};
