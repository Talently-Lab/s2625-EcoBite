const prisma = require("../src/config/prisma");
const bcrypt = require("bcrypt");
const fs = require("node:fs");
const path = require("node:path");

const DEMO_ACTIVA = process.env.SEED_DEMO === "true";

const roles = [
    { nombreRol: "cliente", nivelAcceso: "propio" },
    { nombreRol: "gerente_restaurante", nivelAcceso: "restaurante" },
    { nombreRol: "delivery", nivelAcceso: "delivery" },
    { nombreRol: "admin", nivelAcceso: "global" },
];

// Los correos anteriores permiten conservar los IDs y las relaciones existentes
const restaurantes = [
    {
        clave: "veggie",
        nombre: "Veggie",
        descripcion: "Comida vegetariana",
        email: "contacto@verdevivo.test",
        domicilio: "Plaza Italia, Av. Santa Fe, Palermo, Buenos Aires, Argentina",
        latitude: "-34.5813720",
        longitude: "-58.4209670",
        categoriaComida: "vegetariano",
        ceroResiduos: true,
        envioVerde: true,
        recomendado: true,
        calificacionPromedio: "4.7",
        totalValoraciones: 28,
        archivoImagen: "Veggie",
    },
    {
        clave: "hierbabuena",
        nombre: "Hierbabuena",
        descripcion: "Cocina natural y saludable",
        email: "hola@raizorganica.test",
        domicilio: "Plaza de las Naciones Unidas, Av. Figueroa Alcorta, Recoleta, Buenos Aires, Argentina",
        latitude: "-34.5830190",
        longitude: "-58.3932630",
        categoriaComida: "comida_saludable",
        ceroResiduos: true,
        envioVerde: true,
        recomendado: true,
        calificacionPromedio: "4.5",
        totalValoraciones: 21,
        archivoImagen: "Hierbabuena",
    },
    {
        clave: "hornito",
        nombre: "El Hornito Santiagueño",
        descripcion: "Empanadas y cocina de horno",
        email: "contacto@elhornito.test",
        domicilio: "Caminito, La Boca, Buenos Aires, Argentina",
        latitude: "-34.6386000",
        longitude: "-58.3625000",
        categoriaComida: "comida_rapida",
        ceroResiduos: false,
        envioVerde: true,
        recomendado: false,
        calificacionPromedio: "4.2",
        totalValoraciones: 16,
        archivoImagen: "El_Hornito_Santiagueno",
    },
    {
        clave: "mcdonalds",
        nombre: "McDonald's",
        descripcion: "Hamburguesas y papas",
        email: "info@cocinacerrada.test",
        domicilio: "Av. Corrientes y Av. 9 de Julio, Buenos Aires, Argentina",
        latitude: "-34.6038510",
        longitude: "-58.3817750",
        categoriaComida: "comida_rapida",
        ceroResiduos: false,
        envioVerde: false,
        recomendado: false,
        calificacionPromedio: "4.0",
        totalValoraciones: 10,
        archivoImagen: "mcdonalds",
    },
];

// Direcciones, precios y envases son datos de demostración
// Cada número identifica permanentemente un plato del catálogo

const platos = [
    {
        numero: 1,
        restaurante: "veggie",
        nombre: "Box Saludable de Falafel y Proteína Vegetal",
        descripcion:
            "Falafel sobre una base de quinua, acompañado de ensalada fresca, garbanzos, aceitunas y aderezo tahini",
        archivoImagen: "Box_Saludable_de_Falafel_y_Proteina_Vegetal",
        precio: "19500.00",
        cantidadPlatos: 0,
        cantidadRecipiente: 1,
    },
    {
        numero: 2,
        restaurante: "hierbabuena",
        nombre: "Tostada de Aguacate con Huevo Poché",
        descripcion:
            "Pan artesanal tostado con aguacate sazonado, coronado con un huevo poché y un toque de especias",
        archivoImagen: "Tostada_de_Aguacate_con_Huevo_Poche",
        precio: "9000.00",
        cantidadPlatos: 1,
        cantidadRecipiente: 0,
    },
    {
        numero: 3,
        restaurante: "hornito",
        nombre: "Empanadas Criollas",
        descripcion:
            "Tres empanadas de horno con masa dorada y crujiente, presentadas en una caja individual",
        archivoImagen: "Empanadas_Criollas",
        precio: "9000.00",
        cantidadPlatos: 0,
        cantidadRecipiente: 1,
    },
    {
        numero: 4,
        restaurante: "veggie",
        nombre: "Hamburguesa Vegetal Estilo Crispy",
        descripcion:
            "Medallón vegetal empanizado y crujiente con ensalada de repollo, tomate y lechuga en pan artesanal",
        archivoImagen: "Hamburguesa_Vegetal_Estilo_Crispy",
        precio: "15500.00",
        cantidadPlatos: 0,
        cantidadRecipiente: 1,
    },
    {
        numero: 5,
        restaurante: "veggie",
        nombre: "Nuggets de Tofu al Sésamo",
        descripcion:
            "Cubos de tofu crujientes cubiertos con semillas de sésamo, acompañados de salsa barbacoa agridulce",
        archivoImagen: "Nuggets_de_Tofu_al_Sesamo",
        precio: "11500.00",
        cantidadPlatos: 0,
        cantidadRecipiente: 1,
    },
    {
        numero: 6,
        restaurante: "hornito",
        nombre: "Pizza de Cebolla Morada y Queso",
        descripcion:
            "Pizza de masa gruesa con queso fundido, finas rodajas de cebolla morada y hierbas aromáticas",
        archivoImagen: "Pizza_de_Cebolla_Morada_y_Queso",
        precio: "23000.00",
        cantidadPlatos: 0,
        cantidadRecipiente: 1,
    },
    {
        numero: 7,
        restaurante: "veggie",
        nombre: "Bowl de Quinua, Calabaza y Aguacate",
        descripcion:
            "Quinua mixta con cubos de calabaza asada, rodajas de aguacate fresco y una mezcla de semillas",
        archivoImagen: "Bowl_de_Quinua_Calabaza_y_Aguacate",
        precio: "21500.00",
        cantidadPlatos: 0,
        cantidadRecipiente: 1,
    },
    {
        numero: 8,
        restaurante: "hornito",
        nombre: "Canelones Rellenos de Espinaca y Ricota",
        descripcion:
            "Canelones de espinaca y ricota bañados en bechamel, gratinados con queso y terminados con perejil",
        archivoImagen: "Canelones_Rellenos_de_Espinaca_y_Ricota",
        precio: "14000.00",
        cantidadPlatos: 0,
        cantidadRecipiente: 1,
    },
    {
        numero: 9,
        restaurante: "hierbabuena",
        nombre: "Risotto de Champiñones",
        descripcion:
            "Arroz cremoso preparado con champiñones salteados, hierbas aromáticas y queso parmesano rallado",
        archivoImagen: "Risotto_de_Champinones",
        precio: "22000.00",
        cantidadPlatos: 0,
        cantidadRecipiente: 1,
    },
    {
        numero: 10,
        restaurante: "mcdonalds",
        nombre: "Hamburguesa Clásica con Queso y Papas Fritas",
        descripcion:
            "Hamburguesa con queso fundido, tomate y lechuga en pan con ajonjolí, acompañada de papas fritas",
        archivoImagen: "Hamburguesa_Clasica_con_Queso_y_Papas_Fritas",
        precio: "13900.00",
        cantidadPlatos: 0,
        cantidadRecipiente: 2,
    },
    {
        numero: 11,
        restaurante: "hierbabuena",
        nombre: "Ensalada Rústica de Tomates Heirloom",
        descripcion:
            "Mezcla de tomates multicolor con hojas verdes y flores comestibles, servida en un plato de cerámica",
        archivoImagen: "Ensalada_Rustica_de_Tomates_Heirloom",
        precio: "15000.00",
        cantidadPlatos: 1,
        cantidadRecipiente: 0,
    },
    {
        numero: 12,
        restaurante: "veggie",
        nombre: "Hamburguesa Gourmet de Setas y Queso",
        descripcion:
            "Hamburguesa vegetariana crujiente con champiñones salteados, cebolla caramelizada y queso fundido",
        archivoImagen: "Hamburguesa_Gourmet_de_Setas_y_Queso",
        precio: "18500.00",
        cantidadPlatos: 0,
        cantidadRecipiente: 1,
    },
    {
        numero: 13,
        restaurante: "hierbabuena",
        nombre: "Bowl de Huevo y Aguacate",
        descripcion:
            "Aguacate acompañado de espinacas frescas, rábano sandía, tomates cherry y huevos de yema suave",
        archivoImagen: "Bowl_Saludable_Estilo_Keto_con_Huevo_y_Aguacate",
        precio: "16000.00",
        cantidadPlatos: 0,
        cantidadRecipiente: 1,
    },
    {
        numero: 14,
        restaurante: "mcdonalds",
        nombre: "Hamburguesa Doble Queso Estilo Cuarto de Libra",
        descripcion:
            "Hamburguesa con queso cheddar fundido, pepinillos, cebolla y salsa sobre pan con semillas de sésamo",
        archivoImagen: "Hamburguesa_Doble_Queso_Estilo_Cuarto_de_Libra",
        precio: "16400.00",
        cantidadPlatos: 0,
        cantidadRecipiente: 1,
    },
];

const cuentas = [
    {
        nombre: "Ana López",
        email: "cliente1@demo.ecobite.test",
        rol: "cliente",
        archivoImagen: "ana-lopez",
    },
    {
        nombre: "Luis García",
        email: "cliente2@demo.ecobite.test",
        rol: "cliente",
        archivoImagen: "luis-garcia",
    },
    {
        nombre: "Laura Martínez",
        email: "gerente.verde@demo.ecobite.test",
        rol: "gerente_restaurante",
        restaurante: "veggie",
        archivoImagen: "laura-martinez",
    },
    {
        nombre: "Carlos Pérez",
        email: "gerente.raiz@demo.ecobite.test",
        rol: "gerente_restaurante",
        restaurante: "hierbabuena",
        archivoImagen: "carlos-perez",
    },
        {
        nombre: "Martín González",
        email: "gerente.hornito@demo.ecobite.test",
        rol: "gerente_restaurante",
        restaurante: "hornito",
        archivoImagen: "martin-gonzalez",
    },
    {
        nombre: "Lucía Fernández",
        email: "gerente.mcdonalds@demo.ecobite.test",
        rol: "gerente_restaurante",
        restaurante: "mcdonalds",
        archivoImagen: "lucia-fernandez",
    },
    {
        nombre: "Diego Torres",
        email: "delivery1@demo.ecobite.test",
        rol: "delivery",
        archivoImagen: "diego-torres",
    },
    {
        nombre: "Sofía Ramírez",
        email: "delivery2@demo.ecobite.test",
        rol: "delivery",
        archivoImagen: "sofia-ramirez",
    },
];

const imagenesPendientes = new Set(); // evita repetir avisos del mismo archivo

// Obtiene una URL pública únicamente cuando existe el archivo
function buscarImagen(carpeta, nombre) {
    for (const extension of ["jpg", "jpeg", "png", "webp"]) {
        const archivo = `${nombre}.${extension}`;
        const ruta = path.join(
            __dirname,
            "../public/images",
            carpeta,
            archivo
        ); // resuelve la ubicación desde la carpeta prisma

        if (fs.existsSync(ruta)) {
            return `/images/${carpeta}/${archivo}`;
        }
    }

    imagenesPendientes.add(`${carpeta}/${nombre}`);
    return null;
}

function validarPassword(password, variable) {
    if (
        !password ||
        password.length < 15 ||
        Buffer.byteLength(password, "utf8") > 72 // comprueba el límite de bytes de bcrypt
    ) {
        throw new Error(
            `${variable} debe tener al menos 15 caracteres y máximo 72 bytes`
        );
    }
}

// Calcula los hashes antes de abrir la transacción
async function prepararCredenciales() {
    let admin = null;
    let hashDemo = null;

    const emailAdmin = process.env.ADMIN_EMAIL?.trim().toLowerCase();

    if (emailAdmin) {
        if (cuentas.some((cuenta) => cuenta.email === emailAdmin)) {
            throw new Error("ADMIN_EMAIL no puede ser el correo de una cuenta demo");
        }

        const existente = await prisma.usuario.findUnique({
            where: { email: emailAdmin },
        });

        if (existente) {
            admin = { email: emailAdmin, hash: null };
        } else if (process.env.ADMIN_PASSWORD) {
            validarPassword(process.env.ADMIN_PASSWORD, "ADMIN_PASSWORD");
            admin = {
                email: emailAdmin,
                hash: await bcrypt.hash(process.env.ADMIN_PASSWORD, 10),
            };
        } else {
            console.warn("Administrador omitido: falta ADMIN_PASSWORD");
        }
    } else {
        console.warn("Administrador omitido: falta ADMIN_EMAIL");
    }

    if (DEMO_ACTIVA) {
        const existentes = await prisma.usuario.count({
            where: {
                email: { in: cuentas.map((cuenta) => cuenta.email) },
            },
        });

        if (existentes < cuentas.length) {
            validarPassword(
                process.env.SEED_DEMO_PASSWORD,
                "SEED_DEMO_PASSWORD"
            );
            hashDemo = await bcrypt.hash(process.env.SEED_DEMO_PASSWORD, 10);
        }
    }

    return { admin, hashDemo };
}

// Actualiza nombre e imagen sin cambiar contraseña, estado ni permisos
async function guardarUsuario(tx, cuenta, rolId, restauranteId, hash) {
    const existente = await tx.usuario.findUnique({
        where: { email: cuenta.email },
    });

    if (
        existente &&
        (
            existente.tipoUsuarioId !== rolId ||
            existente.restauranteId !== restauranteId
        )
    ) {
        throw new Error(
            `La cuenta ${cuenta.email} tiene otro rol o restaurante`
        );
    }

    const imagen = buscarImagen("usuarios", cuenta.archivoImagen);
    const cambios = { nombre: cuenta.nombre };

    if (imagen !== null) {
        cambios.imagenUri = imagen;
    }

    if (existente) {
        return tx.usuario.update({
            where: { id: existente.id },
            data: cambios,
        });
    }

    if (!hash) {
        throw new Error(`Falta contraseña para crear ${cuenta.email}`);
    }

    return tx.usuario.create({
        data: {
            nombre: cuenta.nombre,
            email: cuenta.email,
            contrasena: hash,
            tipoUsuarioId: rolId,
            restauranteId,
            activo: true,
            imagenUri: imagen,
        },
    });
}

// Genera un UUID estable para cada plato del nuevo catálogo
function obtenerIdPlato(numero) {
    const sufijo = String(numero).padStart(12, "0"); // completa el número con ceros a la izquierda
    return `a43c7d21-6b58-4e91-9c20-${sufijo}`;
}

async function main() {
    const credenciales = await prepararCredenciales();

    await prisma.$transaction(async (tx) => {
        const rolesPorNombre = new Map(); // permite recuperar un rol por su nombre

        for (const rol of roles) {
            const registro = await tx.tipoUsuario.upsert({
                where: { nombreRol: rol.nombreRol },
                update: {},
                create: rol,
            });

            rolesPorNombre.set(rol.nombreRol, registro);
        }

        if (credenciales.admin) {
            await guardarUsuario(
                tx,
                {
                    nombre: "Alex Romero",
                    email: credenciales.admin.email,
                    archivoImagen: "alex-romero",
                },
                rolesPorNombre.get("admin").id,
                null,
                credenciales.admin.hash
            );
        }

        if (!DEMO_ACTIVA) {
            return;
        }

        const restaurantesPorClave = new Map();

        for (const restaurante of restaurantes) {
            const {
                clave,
                archivoImagen,
                ...datos
            } = restaurante; // separa los campos auxiliares de los datos de Prisma

            const imagen = buscarImagen("restaurantes", archivoImagen);
            const cambios = { ...datos, estado: "activo" };

            if (imagen !== null) {
                cambios.imagenUrl = imagen;
            }

            const registro = await tx.restaurante.upsert({
                where: { email: datos.email },
                update: cambios,
                create: {
                    ...datos,
                    estado: "activo",
                    imagenUrl: imagen,
                },
            });

            restaurantesPorClave.set(clave, registro);
        }

        const usuariosPorEmail = new Map();

        for (const cuenta of cuentas) {
            const restauranteId = cuenta.restaurante
                ? restaurantesPorClave.get(cuenta.restaurante).id
                : null;

            const usuario = await guardarUsuario(
                tx,
                cuenta,
                rolesPorNombre.get(cuenta.rol).id,
                restauranteId,
                credenciales.hashDemo
            );

            usuariosPorEmail.set(cuenta.email, usuario);
        }

        const transporte = await tx.tipoTransporte.upsert({
            where: { descripcion: "bicicleta" },
            update: {},
            create: { descripcion: "bicicleta" },
        });

        for (const cuenta of cuentas.filter((c) => c.rol === "delivery")) {
            const usuario = usuariosPorEmail.get(cuenta.email);

            const delivery = await tx.delivery.upsert({
                where: { usuarioId: usuario.id },
                update: {},
                create: {
                    usuarioId: usuario.id,
                    tipoTransporteId: transporte.id,
                },
            });

            for (const restaurante of restaurantesPorClave.values()) {
                await tx.deliveryRestaurante.upsert({
                    where: {
                        deliveryId_restauranteId: { // busca la combinación única de delivery y restaurante
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

        for (const plato of platos) {
            const id = obtenerIdPlato(plato.numero);
            const restaurante = restaurantesPorClave.get(plato.restaurante);

            const existente = await tx.plato.findUnique({
                where: { id },
            });

            if (existente && existente.restauranteId !== restaurante.id) {
                throw new Error(`El plato ${id} pertenece a otro restaurante`);
            }

            const imagen = buscarImagen("platos", plato.archivoImagen);

            const datos = {
                nombre: plato.nombre,
                descripcion: plato.descripcion,
                precio: plato.precio,
                activo: true,
                cantidadVasos: 0,
                cantidadPlatos: plato.cantidadPlatos,
                cantidadCubiertos: 1,
                cantidadRecipiente: plato.cantidadRecipiente,
            };

            const cambios = { ...datos };

            if (imagen !== null) {
                cambios.imagenUrl = imagen;
            }

            await tx.plato.upsert({
                where: { id },
                update: cambios,
                create: {
                    id,
                    restauranteId: restaurante.id,
                    ...datos,
                    imagenUrl: imagen,
                },
            });
        }

        const idsAnteriores = Array.from(
            { length: 17 },
            (_, indice) =>
                `d39fa2a1-8913-4c8a-92b0-${String(indice + 1).padStart(12, "0")}`
        ); // enumera únicamente los IDs utilizados en las seeds anteriores

        await tx.plato.updateMany({
            where: {
                id: { in: idsAnteriores },
                restauranteId: {
                    in: Array.from(
                        restaurantesPorClave.values(),
                        (restaurante) => restaurante.id
                    ),
                },
            },
            data: { activo: false },
        });
    }, {
        timeout: 30000, // permite hasta 30 segundos y revierte los cambios si falla
    });

    console.log(
        DEMO_ACTIVA
            ? "Seed completada: 4 restaurantes, 14 platos y 8 cuentas demo"
            : "Roles y administrador procesados; catálogo demo desactivado"
    );

    if (imagenesPendientes.size > 0) {
        console.log("Imágenes pendientes:");
        for (const imagen of imagenesPendientes) {
            console.log(`- ${imagen}`);
        }
    }
}

main()
    .catch((error) => {
        console.error(error);
        process.exitCode = 1; // indica el fallo sin impedir el cierre de la conexión
    })
    .finally(() => prisma.$disconnect());