require("dotenv").config();
import https from "https";
import express, { Express, Request, Response } from "express";
import cors from "cors";
import path from "path";
import router from "./routes";
import { errorHandler } from "./helpers/errorHandler";
import SocketServer from "./listeners/socket";
import cookieParser from "cookie-parser";
import fs from "fs";

const key = fs.readFileSync(path.join(__dirname, "key.pem"));
const cert = fs.readFileSync(path.join(__dirname, "cert.pem"));

const app: Express = express();

// const server = https.createServer({ key, cert, passphrase: process.env.PASSPHRASE }, app);
const server = app.listen(3000)

export { server, app };

app.use(cookieParser());

const socketServer = new SocketServer();
(async () => {
  await socketServer.init();
})();

app.use(cors());
app.use(express.static(path.join(__dirname, "../../client/dist")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(router);

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../../client/dist/index.html"));
});

app.use(errorHandler);
