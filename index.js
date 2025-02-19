const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const { pool } = require("./src/config/pg_connection");
const { setPgTypes } = require("./src/helper/pg_types");
const { log_middleware } = require("./middlewares/logMiddleware");
const { errorHandler } = require("./middlewares/errMiddleware");
const { api_router } = require("./src/routes/routes");
const cors = require("cors");

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

// Config Env
require("dotenv").config();
/* Set PG Types , So, Integer will not be string */
setPgTypes();

// Connect PG Connection
pool.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  const SERVER_PORT = process.env.SERVER_PORT || 8000;
  app.use(log_middleware);
  app.use(cors())

  app.use(bodyParser.json());
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  app.use("/api",api_router);

  app.use(errorHandler);

  app.listen(SERVER_PORT, () => {
    console.log(`Server Listening At :${SERVER_PORT}`);
  });
});
