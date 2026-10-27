const prisma = require("../config/prisma");

const crear = async (datos) => {
    try {
        return await prisma.evento.create({ data: datos });
    } catch (error) {
        if (error.code === "P2002" ){ // un reintento conserva el identificador del evento
            return null;
        }
        throw error;
    } 
};

module.exports = { crear };