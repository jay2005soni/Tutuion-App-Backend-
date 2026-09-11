require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const routes = require("./routes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.get("/health", (req, res) => {
  res.json({ success: true, message: "API is healthy", data: { status: "ok" } });
});

app.use("/api/v1", routes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
