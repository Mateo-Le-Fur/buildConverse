require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const router = require("./routes");
const { errorHandler } = require("./helpers/errorHandler");

const cookieParser = require("cookie-parser");
const app = express();

const server = app.listen(process.env.PORT);
module.exports = { server, app };

app.use(cookieParser());

require("./config/jwt.config");
require("./config/socket.config");

app.use(cors("*"));
app.use(express.static(path.join(__dirname, "../client/dist")));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(router);

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});

app.use(errorHandler);
