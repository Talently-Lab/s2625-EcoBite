const prisma = require("../src/config/prisma");

/**
 * Datos iniciales de los roles del sistema
 */
const roles = [
    {nombreRol: "cliente", nivelAcceso:"propio"},
    {nombreRol: "gerente_restaurante", nivelAcceso:"restaurante"},
    {nombreRol: "delivery", nivelAcceso: "delivery"},
    {nombreRol: "admin", nivelAcceso: "global"},

];

/**
 * DAtos iniciales de restaurantes para la base de datos
 */
const restaurantes = [
    {
        nombre: "Verde Vivo",
        email: "contacto@verdevivo.test",
        domicilio: "Av. Insurgentes Sur 100, CDMX",
        latitude: 19.4326,
        longitude: -99.1332,
        estado: "activo",
    },
    {
        nombre: "Raiz Organica",
        email: "hola@raizorganica.test",
        domicilio: "Calle Durango 45, CDMX",
        latitude: 19.4194,
        longitude: -99.1627,
        estado: "activo",
    },
    {
        nombre: "Cocina Cerrada",
        email: "info@cocinacerrada.test",
        domicilio: "Av. Reforma 200, CDMX",
        latitude: 19.4270,
        longitude: -99.1677,
        estado: "inactivo",
    },
];

//Inserta o actualiza datos iniciales
async function main() {
    for(const rol of roles){
        await prisma.tipoUsuario.upsert({
            where: { nombreRol: rol.nombreRol },
            update: {},
            create: rol,
        });
    }
    for(const r of restaurantes){
        await prisma.restaurante.upsert({
            where: {email: r.email},
            update: {},
            create: r,
        });
    }

    console.log("Seed completado");

}

main().catch((e) => {
    console.error(e);
    process.exit(1);
}).finally(() => prisma.$disconnect());