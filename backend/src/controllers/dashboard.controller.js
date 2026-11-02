const dashboardService = require("../services/dashboard.service");

// Devuelve las estadisticas globales al administrador
const obtenerEstadisticas = async (req, res) => {
    const estadisticas = await dashboardService.obtenerEstadisticas(
        req.usuarioActual
    );

    res.status(200).json(estadisticas);
};

module.exports = { obtenerEstadisticas };