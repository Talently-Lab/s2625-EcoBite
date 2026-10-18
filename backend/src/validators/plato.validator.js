const AppError = require("../utils/AppError");

const CAMPOS_CANTIDADES = [
    "cantidadVasos",
    "cantidadPlatos",
    "cantidadCubiertos",
    "cantidadRecipiente",
];

const CAMPOS_PERMITIDOS = [
    "nombre",
    "precio",
    ...CAMPOS_CANTIDADES,
];

// Comprueba que el cuerpo sea un objeto con campos permitidos
const validarCuerpo = (datos) => {
    if (datos === null || typeof datos !== "object" || Array.isArray(datos)){
        throw new AppError("El cuerpo debe ser un objeto JSON", 400);
    }
    if (Object.keys(datos).some((campo) => !CAMPOS_PERMITIDOS.includes(campo))){
        throw new AppError("El plato contiene campos no permitidos", 400);
    }
    if (Object.keys(datos).length === 0){
        throw new AppError("Debes enviar al menos un campo del plato", 400);
    }
};

//Normaliza espacios y valida la longitud del nombre
const validarNombre = (valor) => {
    if (typeof valor !== "string"){
        throw new AppError("El nombre es obligatorio y debe ser texto", 400);
    }

    const nombre = valor.trim().replace(/\s+/g, " ");
    if (!nombre || Array.from(nombre).length > 200){
        throw new AppError("El nombre debe tener entre 1 y 200 caracteres", 400);
    }
    return nombre;
};

//valida un precio compatible con Decimal(10, 2)
const validarPrecio = (valor) => {
    if (typeof valor !== "string" && typeof valor !== "number"){
        throw new AppError("El precio es obligatorio y debe ser decimal", 400);
    }

    const precio = String(valor);
    if(!/^\d{1,8}(\.\d{1,2})?$/.test(precio) || Number(precio) <= 0){
        throw new AppError("El precio debe ser mayor que cero, hasta 99999999.99 y con un máximo de 2 decimales", 400);
    }

    return precio;
};

//valida una cantidad compatible con un entero de PostgreSQL
const validarCantidad = (valor, campo) => {
    if (!Number.isInteger(valor) || valor < 0 || valor > 2147483647){
        throw new AppError(`${campo} debe ser un entero entre 0 y 2147483647`, 400);
    }
    return valor;
};

//Valida las cantidades enviadas y asigna cero al crear si se omiten
const validarCantidades = (datos, parcial) => {
    const cantidades = {};
    for (const campo of CAMPOS_CANTIDADES){
        if (Object.hasOwn(datos, campo)){
            cantidades[campo] = validarCantidad(datos[campo], campo);
        } else if (!parcial){
            cantidades[campo] = 0;
        }
    }
     return cantidades;
};

//valida los datos para crear o editar un plato
const validarDatosPlato = (datos, parcial = false) => {
    validarCuerpo(datos);
    const resultado = validarCantidades(datos, parcial);

    if (!parcial || Object.hasOwn(datos, "nombre")) {
        resultado.nombre = validarNombre(datos.nombre);
    }

    if (!parcial || Object.hasOwn(datos, "precio")) {
        resultado.precio = validarPrecio(datos.precio);
    }

    return resultado;
};

// Valida el cuerpo de la petición de cambio de estado
const validarEstadoPlato = (datos) => {
    if (datos === null || typeof datos !== "object" || Array.isArray(datos)) {
        throw new AppError("El cuerpo debe ser un objeto JSON", 400);
    }

    if (Object.keys(datos).some((campo) => campo !== "activo")) {
        throw new AppError("Solo se permite el campo activo", 400);
    }

    if (typeof datos.activo !== "boolean") {
        throw new AppError("activo debe ser un booleano: true o false", 400);
    }
    return datos.activo;
};

module.exports = { validarDatosPlato, validarEstadoPlato, }