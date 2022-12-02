const { Server } = require("socket.io");
const { server, app } = require("../app");
const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
const {
  ensureAuthenticatedOnSocketHandshake,
} = require("../config/security.config");
const namespaces = require("./namespace.socket");
const { User, Namespace } = require("../models");
const user = require("./user.socket");
const {errorHandler} = require("../helpers/errorHandler");

let ios;

const clients = new Map();

const initSocketServer = async () => {
  ios = new Server(server, {
    allowRequest: ensureAuthenticatedOnSocketHandshake,
    maxHttpBufferSize: 1e7,
    credentials: true,
    cors: ["*"],
  });

  ios.on("connect", async (socket) => {
    console.log("client connected");

    clients.set(socket.request.user.id, socket.request.user);

    await namespaces.getUserNamespaces(ios, socket, clients);

    socket.on("invitationToNamespace", async (data) => {
      try {
        await namespaces.joinInvitation(ios, socket, data);
      } catch (e) {
        console.error(e);
      }
    });

    socket.on("createNamespace", async (data) => {
      try {
        await namespaces.createNamespace(ios, socket, data);
      } catch (e) {
        console.error(e);
      }
    });

    socket.on("updateUser", async (data) => {
      await user.updateUser(socket, ios, data);
    });

    socket.on("deleteUser", async (data) => {
      await user.deleteUser(socket, ios, data);
    });

    socket.on("disconnect", () => {
      socket.disconnect();
      console.log("disconnect home");
    });
  });
};

(async () => await initSocketServer())() ;

app.set("socketio", ios);

