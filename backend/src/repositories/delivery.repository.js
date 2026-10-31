const prisma = require("../config/prisma");

// Obtiene el perfil delivery asociado al usuario autenticado
const findByUsuarioId = (usuarioId, db = prisma) => {
    return db.delivery.findUnique({
        where: {
            usuarioId,
        },
        select: {
            id: true,
            usuarioId: true,
            tipoTransporteId: true,
        },
    });
};


module.exports = { findByUsuarioId };