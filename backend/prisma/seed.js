const prisma = require("../src/config/prisma");
const bcrypt = require("bcrypt");

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
 * Datos iniciales de restaurantes para la base de datos
 */
const restaurantes = [
    {
        nombre: "Verde Vivo",
        email: "contacto@verdevivo.test",
        domicilio: "Av. Insurgentes Sur 100, CDMX",
        latitude: 19.4326,
        longitude: -99.1332,
        estado: "activo",
        categoriaComida: "vegano",
    },
    {
        nombre: "Raiz Organica",
        email: "hola@raizorganica.test",
        domicilio: "Calle Durango 45, CDMX",
        latitude: 19.4194,
        longitude: -99.1627,
        estado: "activo",
        categoriaComida: "sin_tacc",
    },
    {
        nombre: "Cocina Cerrada",
        email: "info@cocinacerrada.test",
        domicilio: "Av. Reforma 200, CDMX",
        latitude: 19.4270,
        longitude: -99.1677,
        estado: "inactivo",
        categoriaComida: "vegetariano",
    },
];

/**
 * Crea la cuenta de administrador inicial con los datos del .env
 */
async function crearAdmin() {
    const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

    if (!ADMIN_EMAIL || !ADMIN_PASSWORD){
        console.warn("Seed: ADMIN_EMAIL o ADMIN_PASSWORD no definidos, no se creo el admin");
        return;
    }
    const email = ADMIN_EMAIL.trim().toLocaleLowerCase();
    const rolAdmin = await prisma.tipoUsuario.findUnique({
        where: { nombreRol: "admin" },
    });

    const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    
    await prisma.usuario.upsert({
        where: { email },
        update: {},
        create: {
            nombre: "Administrador",
            email,
            contrasena: hash,
            tipoUsuarioId: rolAdmin.id,
        },
    });
}

//Inserta o actualiza datos iniciales
async function main() {
    for(const rol of roles){
        await prisma.tipoUsuario.upsert({
            where: { nombreRol: rol.nombreRol },
            update: {},
            create: rol,
        });
    }
    // crear el administrador inicial
    await crearAdmin();

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