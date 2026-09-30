const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const { notFound, errorHandler } = require("./middlewares/errorHandler");

const app = express();

//Permite las peticiones desde otros origenes
app.use(cors());

//Permite recibir datos en formato json
app.use(express.json());

app.get("/api/health", (req, res) => {
    res.status(200).json({ status : "ok"});
});

app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

module.exports=app;
