const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const { notFound, errorHandler } = require("./middlewares/errorHandler");
const eventoRoutes = require("./routes/evento.routes");
const path = require("node:path"); // permite construir rutas del sistema de archivos

const app = express();

//Permite las peticiones desde otros origenes
app.use(cors());
const directorioImagenes = path.join(__dirname, "../public/images"); // localiza la carpeta desde src sin depender de dónde inicias Node

app.use("/images", express.static(directorioImagenes)); // permite consultar los archivos mediante URLs públicas

//aplica el parser especifico antes del global
app.use("/api/eventos", eventoRoutes);

//Permite recibir datos en formato json
app.use(express.json());

app.get("/api/health", (req, res) => {
    res.status(200).json({ status : "ok"});
});

app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

module.exports=app;
