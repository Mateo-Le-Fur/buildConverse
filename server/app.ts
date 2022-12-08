require("dotenv").config();
import express, { Express, Request, Response } from "express";
import cors from "cors";
import path from "path";
import router from "./routes";
import { errorHandler } from "./helpers/errorHandler";

import cookieParser from "cookie-parser";
const app: Express = express();

const server = app.listen(process.env.PORT);
module.exports = { server, app };

app.use(cookieParser());

require("./config/jwt.config");
require("./listeners/socket");

app.use(cors());
app.use(express.static(path.join(__dirname, "../../client/dist")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(router);

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../../client/dist/index.html"));
});

app.use(errorHandler);
