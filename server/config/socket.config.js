const socketio = require("socket.io");
const { server } = require("../app");
const fs = require("fs");
const path = require("path");
const { ensureAuthenticatedOnSocketHandshake } = require("./security.config");
const namespaces = require("../controllers/namespace.socket");
const { User, Namespace, Room } = require("../models");

let ios;

const initSocketServer = async () => {
  ios = socketio(server, {
    allowRequest: ensureAuthenticatedOnSocketHandshake,
    maxHttpBufferSize: 1e14,
    credentials: true,
    cors: {
      origin: "*",
    },
  });

  ios.on("connect", async (socket) => {
    console.log("connexion ios ok");

    try {
      const userId = socket.request.user.id;

      let userNamespaces = (
        await User.findByPk(userId, {
          include: ["userHasNamespaces"],
        })
      ).toJSON();

      userNamespaces = userNamespaces.userHasNamespaces.map((namespace) => {
        const buf = fs.readFileSync(
          path.join(__dirname, `..${namespace.img_url}`)
        );

        return {
          ...namespace,
          img_url: buf.toString("base64"),
        };
      });

      socket.emit("namespaces", userNamespaces);
    } catch (e) {
      console.error(e);
    }

    socket.on("createNamespace", async (data) => {
      try {
        const userId = socket.request.user.id;

        data.img_name = Date.now() + ".jpg";

        const writer = fs.createWriteStream(
          path.join(__dirname, "../upload/" + data.img_name),
          {
            encoding: "base64",
          }
        );

        writer.write(data.img_url);
        writer.end();
        writer.on("finish", () => {
          console.log("image uploaded");
        });

        const createNamespace = await Namespace.create({
          name: data.name,
          invite_code: data.invite_code,
          img_url: `/upload/${data.img_name}`,
        });

        const { id } = createNamespace.toJSON();

        await Room.create({
          name: "# Général",
          index: 1,
          namespace_id: id,
        });

        const user = await User.findByPk(socket.request.user.id);

        await user.addUserHasNamespaces(createNamespace);

        fs.readFile(
          path.join(__dirname, `..${createNamespace.dataValues.img_url}`),
          (err, buf) => {
            const namespace = {
              ...createNamespace.dataValues,
              img_url: buf.toString("base64"),
            };
            socket.emit("createdNamespace", [namespace]);
          }
        );
      } catch (e) {
        console.error(e);
      }
    });

    namespaces.initNamespaces(ios);

    socket.on("leave", () => {
      socket.disconnect(true);
    });

    socket.on("disconnect", () => {
      console.log("disconnect home");
    });
  });
};

initSocketServer();
