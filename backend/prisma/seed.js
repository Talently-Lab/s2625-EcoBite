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

// Crea perfiles delivery y sus asociaciones con restaurantes
async function crearDeliveriesDemo() {
    if (process.env.SEED_DEMO !== "true") {
        return;
    }

    await prisma.$transaction(async (tx) => { // revierte este bloque completo si alguna operación falla
        const transporte = await tx.tipoTransporte.upsert({ // reutiliza el transporte si ya existe
            where: { descripcion: "bicicleta" },
            update: {},
            create: { descripcion: "bicicleta" },
        });

        const rol = await tx.tipoUsuario.findUnique({
            where: { nombreRol: "delivery" },
        });

        if (!rol) {
            throw new Error("No existe el rol delivery");
        }

        const emailsRestaurantes = [
            "contacto@verdevivo.test",
            "hola@raizorganica.test",
        ];

        const restaurantesDemo = [];

        for (const email of emailsRestaurantes) {
            const restaurante = await tx.restaurante.findUnique({
                where: { email },
            });

            if (!restaurante) {
                throw new Error(`No existe el restaurante ${email}`);
            }

            restaurantesDemo.push(restaurante); // agrega el restaurante a la lista de asociaciones
        }

        const emailsDeliveries = [
            "delivery1@demo.ecobite.test",
            "delivery2@demo.ecobite.test",
        ];

        for (const email of emailsDeliveries) {
            const usuario = await tx.usuario.findUnique({
                where: { email },
            });

            if (!usuario || usuario.tipoUsuarioId !== rol.id) {
                throw new Error(`No existe una cuenta delivery válida para ${email}`);
            }

            const delivery = await tx.delivery.upsert({
                where: { usuarioId: usuario.id },
                update: {},
                create: {
                    usuarioId: usuario.id,
                    tipoTransporteId: transporte.id,
                },
            });

            for (const restaurante of restaurantesDemo) {
                await tx.deliveryRestaurante.upsert({
                    where: {
                        deliveryId_restauranteId: { // identifica la combinación única definida en el schema
                            deliveryId: delivery.id,
                            restauranteId: restaurante.id,
                        },
                    },
                    update: {},
                    create: {
                        deliveryId: delivery.id,
                        restauranteId: restaurante.id,
                    },
                });
            }
        }
    });

    console.log("Perfiles y asociaciones de deliveries demo disponibles");
}

// Crea platos demo sin modificar los registros existentes
async function crearPlatosDemo() {
    if (process.env.SEED_DEMO !== "true") {
        return;
    }

    const platos = [
        {
            id: "d39fa2a1-8913-4c8a-92b0-000000000001",
            restauranteEmail: "contacto@verdevivo.test",
            nombre: "Bowl de quinoa",
            precio: "120.00",
            activo: true,
            cantidadPlatos: 0,
            cantidadRecipiente: 1,
        },
        {
            id: "d39fa2a1-8913-4c8a-92b0-000000000002",
            restauranteEmail: "contacto@verdevivo.test",
            nombre: "Ensalada de garbanzos",
            precio: "95.00",
            activo: true,
            cantidadPlatos: 1,
            cantidadRecipiente: 0,
        },
        {
            id: "d39fa2a1-8913-4c8a-92b0-000000000003",
            restauranteEmail: "hola@raizorganica.test",
            nombre: "Bowl de arroz y verduras",
            precio: "110.00",
            activo: true,
            cantidadPlatos: 0,
            cantidadRecipiente: 1,
        },
        {
            id: "d39fa2a1-8913-4c8a-92b0-000000000004",
            restauranteEmail: "hola@raizorganica.test",
            nombre: "Ensalada de nopales",
            precio: "85.50",
            activo: true,
            cantidadPlatos: 1,
            cantidadRecipiente: 0,
        },
        {
            id: "d39fa2a1-8913-4c8a-92b0-000000000005",
            restauranteEmail: "contacto@verdevivo.test",
            nombre: "Plato demo no disponible",
            precio: "90.00",
            activo: false,
            cantidadPlatos: 1,
            cantidadRecipiente: 0,
        },
    ];

    await prisma.$transaction(async (tx) => { // guarda este bloque completo o lo revierte si falla
        for (const plato of platos) {
            const restaurante = await tx.restaurante.findUnique({
                where: { email: plato.restauranteEmail },
            });

            if (!restaurante) {
                throw new Error(
                    `No existe el restaurante ${plato.restauranteEmail}`
                );
            }

            const guardado = await tx.plato.upsert({ // identifica cada plato por su UUID fijo
                where: { id: plato.id },
                update: {},
                create: {
                    id: plato.id,
                    restauranteId: restaurante.id,
                    nombre: plato.nombre,
                    precio: plato.precio,
                    activo: plato.activo,
                    imagenUrl: null,
                    cantidadVasos: 0,
                    cantidadPlatos: plato.cantidadPlatos,
                    cantidadCubiertos: 1,
                    cantidadRecipiente: plato.cantidadRecipiente,
                },
            });

            if (guardado.restauranteId !== restaurante.id) {
                throw new Error(
                    `El plato ${plato.id} ya pertenece a otro restaurante`
                );
            }
        }
    });

    console.log("Platos demo disponibles");
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

    for (const r of restaurantes) {
        await prisma.restaurante.upsert({
            where: { email: r.email },
            update: {},
            create: r,
        });
    }

    await crearUsuariosDemo();
    await crearDeliveriesDemo();
    await crearPlatosDemo();

    console.log("Seed completado");

}

// Crea cuentas de prueba sin modificar usuarios existentes
async function crearUsuariosDemo() {
    if (process.env.SEED_DEMO !== "true") {
        return;
    }

    const password = process.env.SEED_DEMO_PASSWORD;

    if (
        !password ||
        password.length < 15 ||
        Buffer.byteLength(password, "utf8") > 72 // mide los bytes que admite bcrypt
    ) {
        throw new Error(
            "SEED_DEMO_PASSWORD debe tener al menos 15 caracteres y máximo 72 bytes"
        );
    }

    const cuentas = [
        {
            nombre: "Cliente Demo 1",
            email: "cliente1@demo.ecobite.test",
            rol: "cliente",
        },
        {
            nombre: "Cliente Demo 2",
            email: "cliente2@demo.ecobite.test",
            rol: "cliente",
        },
        {
            nombre: "Gerente Verde Vivo",
            email: "gerente.verde@demo.ecobite.test",
            rol: "gerente_restaurante",
            restauranteEmail: "contacto@verdevivo.test",
        },
        {
            nombre: "Gerente Raiz Organica",
            email: "gerente.raiz@demo.ecobite.test",
            rol: "gerente_restaurante",
            restauranteEmail: "hola@raizorganica.test",
        },
        {
            nombre: "Delivery Demo 1",
            email: "delivery1@demo.ecobite.test",
            rol: "delivery",
        },
        {
            nombre: "Delivery Demo 2",
            email: "delivery2@demo.ecobite.test",
            rol: "delivery",
        },
    ];

    const hash = await bcrypt.hash(password, 10); // genera el hash de la contraseña de prueba

    await prisma.$transaction(async (tx) => { // guarda todas las cuentas juntas o revierte si alguna falla
        for (const cuenta of cuentas) {
            const rol = await tx.tipoUsuario.findUnique({
                where: { nombreRol: cuenta.rol },
            });

            if (!rol) {
                throw new Error(`No existe el rol ${cuenta.rol}`);
            }

            let restauranteId = null;

            if (cuenta.restauranteEmail) {
                const restaurante = await tx.restaurante.findUnique({
                    where: { email: cuenta.restauranteEmail },
                });

                if (!restaurante) {
                    throw new Error(
                        `No existe el restaurante ${cuenta.restauranteEmail}`
                    );
                }

                restauranteId = restaurante.id;
            }

            const usuario = await tx.usuario.upsert({ // crea por email y conserva el registro si ya existe
                where: { email: cuenta.email },
                update: {},
                create: {
                    nombre: cuenta.nombre,
                    email: cuenta.email,
                    contrasena: hash,
                    tipoUsuarioId: rol.id,
                    restauranteId,
                    activo: true,
                    imagenUri: null,
                },
            });

            if (
                usuario.tipoUsuarioId !== rol.id ||
                usuario.restauranteId !== restauranteId
            ) {
                throw new Error(
                    `La cuenta ${cuenta.email} ya existe con otro rol o restaurante`
                );
            }
        }
    });

    console.log("Cuentas demo disponibles");
}


main().catch((e) => {
    console.error(e);
    process.exit(1);
}).finally(() => prisma.$disconnect());