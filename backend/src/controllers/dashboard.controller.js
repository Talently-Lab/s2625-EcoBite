const dashboardService = require("../services/dashboard.service");

// Devuelve las estadisticas globales al administrador
const obtenerEstadisticas = async (req, res) => {
    const estadisticas = await dashboardService.obtenerEstadisticas(
        req.usuarioActual
    );

    res.status(200).json(estadisticas);
};

// Devuelve las estadisticas de los ultimos siete dias
const obtenerResumenSemanal = async (req, res) =>{
    const resumen = await dashboardService.obtenerResumenSemanal(
        req.usuarioActual
    );

    res.status(200).json(resumen);
};

module.exports = {
    obtenerEstadisticas,
    obtenerResumenSemanal,
};