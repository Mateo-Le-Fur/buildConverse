const { Server } = require("socket.io");
const { server } = require("../app");
const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
const { ensureAuthenticatedOnSocketHandshake } = require("./security.config");
const namespaces = require("../listeners/namespace.socket");
const { User, Namespace, Room, UserHasNamespace } = require("../models");
const user = require("../listeners/user.socket");

const sharp = require("sharp");

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

    try {
      const userId = socket.request.user.id;

      let currentUserNamespaces = (
        await User.findByPk(userId, {
          include: {
            model: Namespace,
            as: "userHasNamespaces",
            include: ["rooms"],
          },
        })
      ).toJSON();

      const readFileAsync = promisify(fs.readFile);

      let promises = [];
      currentUserNamespaces.userHasNamespaces.forEach((namespace) => {
        promises.push({
          ...namespace,
          img_url: readFileAsync(
            path.join(__dirname, `..${namespace.img_url}`),
            "base64"
          ),
        });
      });

      const result = await Promise.all(
        promises.map(async (el) => {
          return {
            ...el,
            img_url: await el.img_url,
          };
        })
      );

      namespaces.getNamespacesData(ios, clients);

      socket.emit("namespaces", result);
    } catch (e) {
      console.error(e.message);
    }

    socket.on("invitationToNamespace", async (data) => {
      try {
        console.time("invite");

        const userId = socket.request.user.id;

        let namespace = (
          await Namespace.findOne({
            include: ["rooms"],
            where: {
              invite_code: data.inviteCode,
            },
          })
        ).toJSON();

        if (!namespace) throw new Error("Code non valide");

        const user = await User.findByPk(socket.request.user.id);

        await UserHasNamespace.create({
          user_id: user.id,
          namespace_id: namespace.id,
        });

        const buf = fs.readFileSync(
          path.join(__dirname, `..${namespace.img_url}`)
        );

        namespace = {
          ...namespace,
          img_url: buf.toString("base64"),
        };

        const newUser = (
          await Namespace.findByPk(namespace.id, {
            include: [
              {
                model: User,
                as: "namespaceHasUsers",
                attributes: { exclude: ["password"] },
                where: {
                  id: userId,
                },
              },
            ],
          })
        ).toJSON();

        socket.emit("createdNamespace", [namespace]);
        ios.of(namespace.id).emit("newUserOnServer", newUser.namespaceHasUsers);

        console.timeEnd("invite");
      } catch (e) {
        console.error(e);
      }
    });

    socket.on("createNamespace", async (data) => {
      try {
        console.time("create");

        data.img_name = Date.now();

        const buffer = await sharp(data.img_url)
          .resize(80, 80)
          .webp({
            quality: 80,
          })
          .toBuffer();

        const writer = fs.createWriteStream(
          path.join(__dirname, "../images/" + data.img_name),
          {
            encoding: "base64",
          }
        );

        writer.write(buffer);
        writer.end();

        const createNamespace = await Namespace.create({
          name: data.name,
          invite_code: data.invite_code,
          img_url: `/images/${data.img_name}`,
        });

        const { id } = createNamespace.toJSON();

        await Room.create({
          name: "# Général",
          index: 1,
          namespace_id: id,
        });

        const user = (await User.findByPk(socket.request.user.id)).toJSON();

        // await user.addUserHasNamespaces(createNamespace);
        await UserHasNamespace.create({
          user_id: user.id,
          namespace_id: id,
          admin: true,
        });

        let getNewNamespace = (
          await Namespace.findByPk(id, {
            include: {
              model: Room,
              as: "rooms",
            },
          })
        ).toJSON();

        fs.readFile(
          path.join(__dirname, `..${getNewNamespace.img_url}`),
          (err, buf) => {
            const namespace = {
              ...getNewNamespace,
              img_url: buf.toString("base64"),
            };

            socket.emit("createdNamespace", [namespace]);
          }
        );

        console.timeEnd("create");
      } catch (e) {
        console.error(e);
      }
    });

    socket.on("updateUser", async (data) => {
      await user.updateUser(socket, ios, data);
    });

    socket.on("disconnect", () => {
      socket.disconnect();
      console.log("disconnect home");
    });
  });
};

initSocketServer();
