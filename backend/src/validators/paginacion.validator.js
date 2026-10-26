const AppError = require("../utils/AppError");

// Valida un entero positivo recibido como texto en la URL
const validarEnteroPositivo = (valor, nombre, predeterminado) => {
    if (valor === undefined) {
        return predeterminado;
    }

    if (typeof valor !== "string" || !/^[1-9]\d*$/.test(valor)) {
        throw new AppError(`${nombre} debe ser un entero positivo`, 400);
    }

    const numero = Number(valor);

    if (!Number.isSafeInteger(numero)) {
        throw new AppError(`${numero} esta fuera del rango permitido`, 400);
    }

    return numero;
};

// calcula que grupo de registros se debe consultar
const validarPaginacion = (query) => {
    const pagina = validarEnteroPositivo(query.pagina, "pagina", 1);
    const limite = validarEnteroPositivo(query.limite, "limite", 20);

    if (limite > 100) {
        throw new AppError("limite no puede superar 100", 400);
    }

    // calculaa cuantos registros saltar antes de obtener la pagina solicitada
    const desplazamiento = (pagina - 1) * limite;
    if (!Number.isSafeInteger(desplazamiento) || desplazamiento > 2147483647) {
        throw new AppError("La pagina solicitada esta fuera de rango", 400);
    }
    return { pagina, limite, desplazamiento };
};


module.exports = { validarPaginacion };