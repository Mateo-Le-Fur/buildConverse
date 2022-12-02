const room = require("./room.socket");
const user = require("./user.socket");
const { User, Namespace, Room, Message } = require("../models");
const fs = require("fs");
const path = require("path");
const UserHasNamespace = require("../models/UserHasNamespace");
const client = require("../config/sequelize");
const { QueryTypes } = require("sequelize");
const sharp = require("sharp");
const { promisify } = require("util");

const namespaces = {
  async getUserNamespaces(ios, socket, clients) {
    const userId = socket.request.user.id;

    let currentUserNamespaces = (
      await User.findByPk(userId, {
        include: {
          model: Namespace,
          as: "userHasNamespaces",
          include: ["rooms"]
        }
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
        )
      });
    });

    const result = await Promise.all(
      promises.map(async (el) => {
        return {
          ...el,
          img_url: await el.img_url
        };
      })
    );


    namespaces.getNamespacesData(ios, socket, clients);

    socket.emit("namespaces", result);
  },

  getNamespacesData(ios, socket, clients) {
    try {
      const ns = ios.of(/^\/\w+$/);




      // Je vérifie que l'utilisateur a les droits de se connecter au serveur
      ns.use(async (socket, next) => {
        const { id } = socket.request.user;

        const namespaceId = socket.nsp.name.substring(1);

        const namespace = await Namespace.findByPk(namespaceId);

        const isAuthorize = await namespace.getNamespaceHasUsers({
          where: {
            id
          }
        });

        if (isAuthorize.length) {
          next();
        } else {
          next(new Error("Tu n'as pas accès à ce serveur "));
        }
      });

      ns.on("connect", async (nsSocket) => {
        console.log(socket.request.user);

        console.log(
          `L'utilisateur : ${nsSocket.request.user.pseudo} est connecté sur le serveur ${nsSocket.nsp.name}`
        );

        try {
          const namespaceId = nsSocket.nsp.name.slice(1);

          await room.getAllRooms(nsSocket, namespaceId);
        } catch (e) {
          console.error(e);
        }

        nsSocket.on("updateNamespace", async (data, callback) => {
          try {
            await namespaces.updateNamespace(ios, nsSocket, data);
            callback({
              status: "ok"
            });
          } catch (e) {
            callback({
              status: "error",
              message: e.message
            });
          }
        });

        nsSocket.on("deleteNamespace", async (data, callback) => {
          try {
            await namespaces.deleteNamespace(ios, nsSocket, data);
            callback({
              status: "ok"
            });
          } catch (e) {
            callback({
              status: "error",
              message: e.message
            });
          }
        });

        nsSocket.on("getNamespaceUsers", async (namespaceId) => {
          await namespaces.getNamespaceUsers(nsSocket, namespaceId, clients);
        });

        nsSocket.on("loadMoreUser", async (data) => {
          await namespaces.loadMoreUser(nsSocket, data, clients);
        });

        nsSocket.on("joinRoom", async (roomId) => {
          await room.getAllMessages(nsSocket, roomId);
        });

        nsSocket.on("leaveRoom", (roomId) => {
          nsSocket.leave(`/${roomId}`);
        });

        nsSocket.on("createRoom", async (data) => {
          await room.createRoom(ios, data);
        });

        // TODO A finir après avoir fait le crud utilisateur
        nsSocket.on("deleteRoom", async (data) => {
          await room.deleteRoom(ios, data);
        });

        // nsSocket.on("updateUser", async (data) => {
        //   await user.updateUser(ios, data);
        // });

        nsSocket.on("message", async ({ text, roomId, avatar }) => {
          try {
            const { id } = nsSocket.request.user;

            const user = await User.findByPk(id, { attributes: ["avatar_url", "pseudo"], raw: true });

            const buffer = fs.readFileSync(path.join(__dirname, `..${user.avatar_url}`), "base64");

            let message = (await Message.create({
              data: text,
              data_type: "text",
              room_id: roomId,
              user_id: id,
              author_name: user.pseudo,
              avatar_author: user.avatar_url
            })).get();


            message = {
              ...message,
              avatar_author: buffer
            };

            ns.to(`/${roomId}`).emit("message", message);
          } catch (e) {
            throw e;
          }
        });

        nsSocket.on("disconnect", () => {
          nsSocket.disconnect();
          console.log("disconnect");
        });
      });
    } catch (e) {
      throw e;
    }
  },

  async getNamespaceUsers(nsSocket, namespaceId, clients) {
    try {
      const t0 = performance.now();

      let namespace = await Namespace.findByPk(namespaceId);

      const user = await client.query(
        `SELECT COUNT("User"."id") AS "numberOfUsers" FROM "user" AS "User"
          INNER JOIN "user_has_namespace" AS "UserHasNamespace"
          ON "UserHasNamespace"."namespace_id" = ${namespaceId} GROUP BY "User"."id"
          LIMIT 1`,
        { type: QueryTypes.SELECT }
      );

      let users = await namespace.getNamespaceHasUsers({
        limit: 50,
        offset: 0,
        raw: true,
        nest: true
      });

      users = users.map((element) => {
        const checkIfUserConnected = clients.get(element.id);

        delete element.password;

        const buffer = fs.readFileSync(
          path.join(
            __dirname,
            `..${
              element.avatar_url ? element.avatar_url : "/images/default-avatar"
            }`
          ),
          {
            encoding: "base64"
          }
        );

        return {
          ...element,
          avatar_url: buffer,
          status: checkIfUserConnected ? "online" : "offline"
        };
      });

      const t1 = performance.now();

      console.log(`get user list : ${t1 - t0} ms`);

      nsSocket.emit("userList", {
        users,
        numberOfUsers: user[0].numberOfUsers
      });
    } catch (e) {
      throw e;
    }
  },

  async loadMoreUser(nsSocket, data, clients) {
    const { length, namespaceId } = data;

    const t0 = performance.now();

    let namespace = await Namespace.findByPk(namespaceId);

    console.log(length);

    let user = await namespace.getNamespaceHasUsers({
      limit: 50,
      offset: length,
      raw: true,
      nest: true
    });

    user = user.map((element) => {
      const checkIfUserConnected = clients.get(element.id);

      const buffer = fs.readFileSync(
        path.join(
          __dirname,
          `..${
            element.avatar_url ? element.avatar_url : "/images/default-avatar"
          }`
        ),
        {
          encoding: "base64"
        }
      );

      return {
        ...element,
        avatar_url: buffer,
        status: checkIfUserConnected ? "online" : "offline"
      };
    });

    const t1 = performance.now();

    console.log(`load more user : ${t1 - t0} ms`);

    nsSocket.emit("loadMoreUser", user);
  },

  async createNamespace(ios, socket, data) {
    console.time("create");

    const { id: userId } = socket.request.user;

    data.img_name = Date.now();

    const buffer = await sharp(data.img_url)
      .resize(150, 150)
      .webp({
        quality: 80,
        effort: 0
      })
      .toBuffer();

    const writer = fs.createWriteStream(
      path.join(__dirname, "../images/" + data.img_name),
      {
        encoding: "base64"
      }
    );

    writer.write(buffer);
    writer.end();

    const createNamespace = await Namespace.create({
      name: data.name,
      invite_code: data.invite_code,
      img_url: `/images/${data.img_name}`
    });

    const { id } = createNamespace.toJSON();

    await Room.create({
      name: "# Général",
      index: 1,
      namespace_id: id
    });

    await UserHasNamespace.create({
      user_id: userId,
      namespace_id: id,
      admin: true
    });


    let getNewNamespace = (
      await User.findByPk(userId, {
        include: {
          model: Namespace,
          as: "userHasNamespaces",
          include: ["rooms"],
          where: {
            id
          }
        }
      })
    ).toJSON();

    getNewNamespace = getNewNamespace.userHasNamespaces[0];


    fs.readFile(
      path.join(__dirname, `..${getNewNamespace.img_url}`),
      (err, buf) => {
        const namespace = {
          ...getNewNamespace,
          img_url: buf.toString("base64")
        };


        socket.emit("createdNamespace", [namespace]);
      }
    );

    console.timeEnd("create");
  },

  async updateNamespace(ios, socket, data) {
    const { id, values, avatar } = data;
    let { avatarName } = data;

    const userId = socket.request.user.id;


    const checkIfUserIsAdmin = await UserHasNamespace.findOne({
      where: {
        user_id: userId,
        namespace_id: id,
        admin: true
      },
      raw: true
    });

    console.log(checkIfUserIsAdmin);

    if (!checkIfUserIsAdmin) {
      throw new Error("Tu dois être administrateur pour modifier le serveur");
    }

    const newAvatarName = avatarName ? Date.now() : null;

    if (avatar) {
      const buffer = await sharp(avatar)
        .resize(150, 150)
        .webp({
          quality: 80,
          effort: 0
        })
        .toBuffer();

      const writer = fs.createWriteStream(
        path.join(__dirname, "../images/" + newAvatarName),
        {
          encoding: "base64"
        }
      );

      writer.write(buffer);
      writer.end();
    }

    const { img_url: oldAvatar } = await Namespace.findByPk(id, {
      raw: true
    });

    await Namespace.update(
      {
        name: values.name,
        invite_code: values.invite_code,
        img_url: newAvatarName ? `/images/${newAvatarName}` : oldAvatar
      },
      {
        where: {
          id
        }
      }
    );

    let updateNamespace = (
      await Namespace.findByPk(id, {
        include: {
          model: Room,
          as: "rooms"
        }
      })
    ).toJSON();

    const buffer = fs.readFileSync(
      path.join(__dirname, ".." + updateNamespace.img_url),
      {
        encoding: "base64"
      }
    );

    updateNamespace = {
      ...updateNamespace,
      img_url: buffer
    };

    ios.of(`/${id}`).emit("updateNamespace", updateNamespace);
  },

  async deleteNamespace(ios, socket, data) {
    const { id } = data;
    console.log(data);

    const userId = socket.request.user.id;

    const checkIfUserIsAdmin = await UserHasNamespace.findOne({
      where: {
        user_id: userId,
        namespace_id: id,
        admin: true
      },
      raw: true
    });

    if (!checkIfUserIsAdmin) {
      throw new Error("Tu dois être administrateur pour supprimer le serveur");
    }

    ios.of(`/${id}`).emit("deleteNamespace", { id });

    const namespace = await Namespace.findByPk(id, {
      raw: true
    });

    fs.unlinkSync(path.join(__dirname, `..${namespace.img_url}`));

    await Namespace.destroy({
      where: {
        id
      }
    });

    ios._nsps.delete(`/${id}`)
  },

  async joinInvitation(ios, socket, data) {
    console.time("invite");

    const userId = socket.request.user.id;

    let namespace = (
      await Namespace.findOne({
        where: {
          invite_code: data.inviteCode
        }
      })
    ).toJSON();


    if (!namespace) throw new Error("Code non valide");


    await UserHasNamespace.create({
      user_id: userId,
      namespace_id: namespace.id
    });

    const buffer = fs.readFileSync(
      path.join(__dirname, `..${namespace.img_url}`),
      {
        encoding: "base64"
      }
    );


    let getNewNamespace = (
      await User.findByPk(userId, {
        include: {
          model: Namespace,
          as: "userHasNamespaces",
          include: ["rooms"],
          where: {
            invite_code: data.inviteCode
          }
        }
      })
    ).toJSON();

    getNewNamespace = { ...getNewNamespace.userHasNamespaces[0], img_url: buffer };


    let newUser = (
      await Namespace.findByPk(namespace.id, {
        include: [
          {
            model: User,
            as: "namespaceHasUsers",
            attributes: { exclude: ["password"] },
            where: {
              id: userId
            }
          }
        ]
      })
    ).toJSON();

    const userAvatar = fs.readFileSync(
      path.join(__dirname, `..${newUser.namespaceHasUsers[0].avatar_url}`),
      {
        encoding: "base64"
      }
    );

    newUser = {
      ...newUser.namespaceHasUsers[0],
      avatar_url: userAvatar,
      status: "online"
    };

    socket.emit("createdNamespace", [getNewNamespace]);
    ios.of(namespace.id).emit("newUserOnServer", [newUser]);

    console.timeEnd("invite");
  }
};

module.exports = namespaces;
