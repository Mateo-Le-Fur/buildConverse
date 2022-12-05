const room = require("./room.socket");
const user = require("./user.socket");
const message = require("./message.socket");
const {
  User,
  Namespace,
  Room,
  Message,
  UserHasNamespace,
} = require("../models");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { promisify } = require("util");
const { getNumberOfUser } = require("../query/namespace.query");
const { getRandomImage } = require("../utils/getRandomImage");

const { unlinkImage } = require("../utils/unlinckImage");

const namespaces = {
  userLimit: 3000,

  initNamespace(ios, socket, clients) {
    try {
      const ns = ios.of(/^\/\w+$/);

      ns.use(async (socket, next) => {
        const { id } = socket.request.user;
        const namespaceId = socket.nsp.name.substring(1);

        console.log(id);

        const isAuthorize = await UserHasNamespace.findOne({
          where: {
            user_id: id,
            namespace_id: namespaceId,
          },
        });

        if (isAuthorize) {
          next();
        } else {
          next(new Error("Tu n'as pas accès à ce serveur "));
        }
      });

      ns.on("connect", async (nsSocket) => {
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
              status: "ok",
            });
          } catch (e) {
            callback({
              status: "error",
              message: e.message,
            });
          }
        });

        nsSocket.on("deleteNamespace", async (data, callback) => {
          try {
            await namespaces.deleteNamespace(ios, nsSocket, data);
            callback({
              status: "ok",
            });
          } catch (e) {
            callback({
              status: "error",
              message: e.message,
            });
          }
        });

        nsSocket.on("userLeaveNamespace", async (data, callback) => {
          try {
            await namespaces.leaveNamespace(ios, nsSocket, data);
            callback({
              status: "ok",
            });
          } catch (e) {
            callback({
              status: "error",
              message: e.message,
            });
            console.error(e);
          }
        });

        nsSocket.on("getNamespaceUsers", async (namespaceId) => {
          try {
            await namespaces.getNamespaceUsers(nsSocket, namespaceId, clients);
          } catch (e) {
            console.error(e);
          }
        });

        nsSocket.on("loadMoreUser", async (data) => {
          try {
            await namespaces.loadMoreUser(nsSocket, data, clients);
          } catch (e) {
            console.error(e);
          }
        });

        nsSocket.on("joinRoom", async (roomId) => {
          try {
            nsSocket.join(`/${roomId}`);
            await room.getAllMessages(nsSocket, roomId);
          } catch (e) {
            console.error(e);
          }
        });

        nsSocket.on("leaveRoom", (roomId) => {
          nsSocket.leave(`/${roomId}`);
        });

        nsSocket.on("createRoom", async (data) => {
          try {
            await room.createRoom(ios, data);
          } catch (e) {
            console.error(e);
          }
        });

        nsSocket.on("deleteRoom", async (data) => {
          console.log(data);
          await room.deleteRoom(ios, nsSocket, data);
        });

        nsSocket.on("message", async (data) => {
          try {
            await message.sendMessage(ns, nsSocket, data);
          } catch (e) {
            console.error(e);
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

  async getUserNamespaces(ios, socket, clients) {
    const userId = socket.request.user.id;

    let currentUserNamespaces = (
      await User.findByPk(userId, {
        include: {
          model: Namespace,
          as: "namespaces",
          include: ["rooms"],
        },
      })
    ).toJSON();

    const getNamespaces = currentUserNamespaces.namespaces.map((namespace) => {
      return {
        ...namespace,
        img_url: `${process.env.DEV_AVATAR_URL}/namespace/${
          namespace.id
        }/${Date.now()}/avatar`,
      };
    });

    namespaces.initNamespace(ios, socket, clients);

    socket.emit("namespaces", getNamespaces);
  },

  async getNamespaceUsers(nsSocket, namespaceId, clients) {
    const t0 = performance.now();

    let namespace = await Namespace.findByPk(namespaceId);

    const user = await getNumberOfUser(namespaceId);

    let users = await namespace.getUsers({
      limit: 50,
      offset: 0,
      raw: true,
      nest: true,
    });

    users = users.map((element) => {
      const checkIfUserConnected = clients.get(element.id);

      delete element.password;

      return {
        ...element,
        avatar_url: `${process.env.DEV_AVATAR_URL}/user/${
          element.id
        }/${Date.now()}/avatar`,
        status: checkIfUserConnected ? "online" : "offline",
      };
    });

    const t1 = performance.now();

    nsSocket.emit("userList", {
      users,
      numberOfUsers: user.count,
    });

    console.log(`get user list : ${t1 - t0} ms`);
  },

  async loadMoreUser(nsSocket, data, clients) {
    const { length, namespaceId } = data;

    const t0 = performance.now();

    let namespace = await Namespace.findByPk(namespaceId);

    console.log(length);

    let user = await namespace.getUsers({
      limit: 50,
      offset: length,
      raw: true,
      nest: true,
    });

    user = user.map((element) => {
      const checkIfUserConnected = clients.get(element.id);

      return {
        ...element,
        avatar_url: `${process.env.DEV_AVATAR_URL}/user/${
          element.id
        }/${Date.now()}/avatar`,
        status: checkIfUserConnected ? "online" : "offline",
      };
    });

    const t1 = performance.now();

    console.log(`load more user : ${t1 - t0} ms`);

    nsSocket.emit("loadMoreUser", user);
  },

  async createNamespace(ios, socket, data) {
    console.time("create");

    const { id: userId } = socket.request.user;

    const img_name = data.img_name ? Date.now() : null;

    if (data.img_url) {
      const buffer = await sharp(data.img_url)
        .resize(150, 150)
        .webp({
          quality: 80,
          effort: 0,
        })
        .toFile(path.join(__dirname, `../images/${img_name}.webp`));
    }

    const createNamespace = await Namespace.create({
      name: data.name,
      invite_code: data.invite_code,
      img_url: img_name ? `/images/${img_name}` : `/images/${getRandomImage()}`,
    });

    const { id } = createNamespace.toJSON();

    await Room.create({
      name: "# Général",
      index: 1,
      namespace_id: id,
    });

    await UserHasNamespace.create({
      user_id: userId,
      namespace_id: id,
      admin: true,
    });

    let getNewNamespace = (
      await User.findByPk(userId, {
        include: {
          model: Namespace,
          as: "namespaces",
          include: ["rooms"],
          where: {
            id,
          },
        },
      })
    ).toJSON();

    getNewNamespace = getNewNamespace.namespaces[0];

    const namespace = {
      ...getNewNamespace,
      img_url: `${process.env.DEV_AVATAR_URL}/namespace/${
        getNewNamespace.id
      }/${Date.now()}/avatar`,
    };

    socket.emit("createdNamespace", [namespace]);

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
        admin: true,
      },
      raw: true,
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
          effort: 0,
        })
        .toFile(path.join(__dirname, `../images/${newAvatarName}.webp`));
    }

    const { img_url: oldAvatar } = await Namespace.findByPk(id, {
      raw: true,
    });

    await Namespace.update(
      {
        name: values.name,
        invite_code: values.invite_code,
        img_url: newAvatarName ? `/images/${newAvatarName}` : oldAvatar,
      },
      {
        where: {
          id,
        },
      }
    );

    let updateNamespace = (
      await Namespace.findByPk(id, {
        include: {
          model: Room,
          as: "rooms",
        },
      })
    ).toJSON();

    updateNamespace = {
      ...updateNamespace,
      img_url: `${
        process.env.DEV_AVATAR_URL
      }/namespace/${id}/${Date.now()}/avatar`,
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
        admin: true,
      },
      raw: true,
    });

    if (!checkIfUserIsAdmin) {
      throw new Error("Tu dois être administrateur pour supprimer le serveur");
    }

    ios.of(`/${id}`).emit("deleteNamespace", { id });

    const namespace = await Namespace.findByPk(id, {
      raw: true,
    });

    unlinkImage(namespace.img_url);

    await Namespace.destroy({
      where: {
        id,
      },
    });

    ios._nsps.delete(`/${id}`);
  },

  async joinInvitation(ios, socket, data) {
    const userId = socket.request.user.id;

    let namespace = (
      await Namespace.findOne({
        where: {
          invite_code: data.inviteCode,
        },
      })
    )?.toJSON();

    if (!namespace) throw new Error("Code non valide");

    const checkIfUserAlreadyHasServer = await UserHasNamespace.findOne({
      where: {
        user_id: userId,
        namespace_id: namespace.id,
      },
    });

    let { count: checkIfServerIsFull } = await getNumberOfUser(namespace.id);
    checkIfServerIsFull = checkIfServerIsFull >= this.userLimit;

    if (checkIfUserAlreadyHasServer)
      throw new Error("Tu as déjà rejoint ce serveur");

    if (checkIfServerIsFull) throw new Error("Le serveur est plein");

    await UserHasNamespace.create({
      user_id: userId,
      namespace_id: namespace.id,
    });

    let getNewNamespace = (
      await User.findByPk(userId, {
        include: {
          model: Namespace,
          as: "namespaces",
          include: ["rooms"],
          where: {
            invite_code: data.inviteCode,
          },
        },
      })
    ).toJSON();

    getNewNamespace = {
      ...getNewNamespace.namespaces[0],
      img_url: `${process.env.DEV_AVATAR_URL}/namespace/${
        namespace.id
      }/${Date.now()}/avatar`,
    };

    let newUser = (
      await Namespace.findByPk(namespace.id, {
        include: [
          {
            model: User,
            as: "users",
            attributes: { exclude: ["password"] },
            where: {
              id: userId,
            },
          },
        ],
      })
    ).toJSON();

    newUser = {
      ...newUser.users[0],
      avatar_url: `${
        process.env.DEV_AVATAR_URL
      }/user/${userId}/${Date.now()}/avatar`,
      status: "online",
    };

    socket.emit("createdNamespace", [getNewNamespace]);
    ios.of(`/${namespace.id}`).emit("userJoinNamespace", [newUser]);
  },

  async leaveNamespace(ios, socket, data) {
    console.log(data);

    const { id: namespaceId } = data;

    const { id: userId } = socket.request.user;

    await UserHasNamespace.destroy({
      where: {
        user_id: userId,
        namespace_id: namespaceId,
      },
    });

    ios.of(`/${namespaceId}`).emit("userLeaveNamespace", { id: userId });
  },
};

module.exports = namespaces;
