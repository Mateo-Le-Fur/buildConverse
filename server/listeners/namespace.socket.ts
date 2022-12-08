import { NamespaceInterface } from "../interfaces/Namespace";
import { Socket } from "socket.io";

import room from "./room.socket";
import message from "./message.socket";
import { User, Namespace, Room, UserHasNamespace } from "../models";
import path from "path";
import sharp from "sharp";
import { getNumberOfUser } from "../query/namespace.query";
import { getRandomImage } from "../utils/getRandomImage";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { NextFunction } from "express";
import { SocketCustom } from "../interfaces/SocketCustom";
import { MessageInterface } from "../interfaces/Message";
import { RoomInterface } from "../interfaces/Room";

const { unlinkImage } = require("../utils/unlinckImage");

const namespaces = {
  userLimit: 3000,

  initNamespace(ios: Socket, socket: Socket, clients: Map<number, string>) {
    try {
      const ns = ios.of(/^\/\w+$/);

      ns.use(async (socket: SocketCustom, next: NextFunction) => {
        const { id } = socket.request.user;
        const namespaceId = socket.nsp.name.substring(1);

        const isAuthorize = await UserHasNamespace.findOne({
          where: {
            user_id: id,
            namespace_id: namespaceId
          }
        });

        if (isAuthorize) {
          next();
        } else {
          next(new Error("Tu n'as pas accès à ce serveur "));
        }
      });

      ns.on("connect", async (nsSocket: SocketCustom) => {
        console.log(
          `L'utilisateur : ${nsSocket.request.user.pseudo} est connecté sur le serveur ${nsSocket.nsp.name}`
        );

        try {
          const namespaceId = nsSocket.nsp.name.slice(1);
          await room.getAllRooms(nsSocket, namespaceId);
        } catch (e) {
          console.error(e);
        }

        nsSocket.on(
          "updateNamespace",
          async (data: { id: number; values: NamespaceInterface, avatar: Buffer }, callback) => {
            try {
              await namespaces.updateNamespace(ios, nsSocket, data);
              callback({
                status: "ok"
              });
            } catch (e) {
              if (e instanceof Error) {
                callback({
                  status: "error",
                  message: e.message
                });
              }
            }
          }
        );

        nsSocket.on(
          "deleteNamespace",
          async (data: NamespaceInterface, callback) => {
            try {
              await namespaces.deleteNamespace(ios, nsSocket, data);
              callback({
                status: "ok"
              });
            } catch (e) {
              if (e instanceof Error) {
                callback({
                  status: "error",
                  message: e.message
                });
              }
            }
          }
        );

        nsSocket.on(
          "userLeaveNamespace",
          async (data: NamespaceInterface, callback) => {
            try {
              await namespaces.leaveNamespace(ios, nsSocket, data);
              callback({
                status: "ok"
              });
            } catch (e) {
              if (e instanceof Error) {
                callback({
                  status: "error",
                  message: e.message
                });
                console.error(e);
              }
            }
          }
        );

        nsSocket.on("getNamespaceUsers", async (data: number) => {
          try {
            await namespaces.getNamespaceUsers(nsSocket, data, clients);
          } catch (e) {
            console.error(e);
          }
        });

        nsSocket.on("loadMoreUser", async (data: { length: number; namespaceId: number }) => {
          try {
            await namespaces.loadMoreUser(nsSocket, data, clients);
          } catch (e) {
            console.error(e);
          }
        });

        nsSocket.on("joinRoom", async (roomId: number) => {
          try {
            nsSocket.join(`/${roomId}`);
            await room.getAllMessages(nsSocket, roomId);
          } catch (e) {
            console.error(e);
          }
        });

        nsSocket.on("leaveRoom", (roomId: RoomInterface) => {
          nsSocket.leave(`/${roomId}`);
        });

        nsSocket.on("createRoom", async (data: RoomInterface) => {
          try {
            await room.createRoom(ios, data);
          } catch (e) {
            console.error(e);
          }
        });

        nsSocket.on("updateRoom", async (data: RoomInterface) => {
          try {
            await room.updateRoom(ios, data);
          } catch (e) {
            console.error(e);
          }
        });

        nsSocket.on("deleteRoom", async (data: RoomInterface) => {
          await room.deleteRoom(ios, nsSocket, data);
        });

        nsSocket.on("message", async (data: MessageInterface) => {
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

  async getUserNamespaces(
    ios: Socket,
    socket: SocketCustom,
    clients: Map<number, string>
  ) {
    const userId = socket.request.user.id;

    let foundUsersNamespace = (
      await User.findByPk(userId, {
        include: {
          model: Namespace,
          as: "namespaces",
          include: ["rooms"]
        }
      })
    )?.toJSON();


    const getNamespaces = foundUsersNamespace?.namespaces.map(
      (namespace: NamespaceInterface) => {
        return {
          ...namespace,
          imgUrl: `${process.env.DEV_AVATAR_URL}/namespace/${
            namespace.id
          }/${Date.now()}/avatar`
        };
      }
    );


    namespaces.initNamespace(ios, socket, clients);

    socket.emit("namespaces", getNamespaces);
  },

  async getNamespaceUsers(
    nsSocket: Socket,
    namespaceId: number,
    clients: Map<number, string>
  ) {
    const t0 = performance.now();

    let namespace = await Namespace.findByPk(namespaceId);

    const nbUsers = await getNumberOfUser(namespaceId);

    let users = await namespace?.getUsers({
      attributes: { exclude: ["password"] },
      limit: 50,
      offset: 0,
      raw: true,
      nest: true
    });


    const updateUser = users?.map((element) => {
      const checkIfUserConnected = clients.get(element.id);

      return {
        ...element,
        avatarUrl: `${process.env.DEV_AVATAR_URL}/user/${
          element.id
        }/${Date.now()}/avatar`,
        status: checkIfUserConnected ? "online" : "offline"
      };
    });


    const t1 = performance.now();

    nsSocket.emit("userList", {
      users: updateUser,
      numberOfUsers: nbUsers.count
    });

    console.log(`get user list : ${t1 - t0} ms`);
  },

  // TODO ICIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII

  async loadMoreUser(
    nsSocket: Socket,
    data: { length: number; namespaceId: number },
    clients: Map<number, string>
  ) {
    const { length, namespaceId } = data;

    const t0 = performance.now();

    let namespace = await Namespace.findByPk(namespaceId);

    const foundUser = await namespace?.getUsers({
      attributes: { exclude: ["password"] },
      limit: 50,
      offset: length,
      raw: true,
      nest: true
    });

    const updateUser = foundUser?.map((element) => {
      const checkIfUserConnected = clients.get(element.id);

      return {
        ...element,
        avatarUrl: `${process.env.DEV_AVATAR_URL}/user/${
          element.id
        }/${Date.now()}/avatar`,
        status: checkIfUserConnected ? "online" : "offline"
      };
    });

    const t1 = performance.now();

    console.log(`load more user : ${t1 - t0} ms`);

    nsSocket.emit("loadMoreUser", updateUser);
  },

  async createNamespace(ios: Socket, socket: SocketCustom, data: NamespaceInterface) {
    console.time("create");

    const { id: userId } = socket.request.user;

    const img_name = data.imgUrl ? Date.now() : null;

    if (data.imgUrl) {
      await sharp(data.imgUrl)
        .resize(150, 150)
        .webp({
          quality: 80,
          effort: 0
        })
        .toFile(path.join(__dirname, `../images/${img_name}.webp`));
    }

    const createNamespace = await Namespace.create({
      name: data.name,
      inviteCode: data.inviteCode,
      imgUrl: img_name ? `/images/${img_name}` : `/images/${getRandomImage()}`
    });

    const { id } = createNamespace.toJSON();

    await Room.create({
      name: "# Général",
      index: 1,
      namespaceId: id
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
          as: "namespaces",
          include: ["rooms"],
          where: {
            id
          }
        }
      })
    )?.toJSON();

    getNewNamespace = getNewNamespace?.namespaces[0];

    const namespace = {
      ...getNewNamespace,
      imgUrl: `${process.env.DEV_AVATAR_URL}/namespace/${
        getNewNamespace?.id
      }/${Date.now()}/avatar`
    };

    socket.emit("createdNamespace", [namespace]);

    console.timeEnd("create");
  },

  async updateNamespace(ios: Socket, socket: SocketCustom, data: { id: number; values: NamespaceInterface, avatar: Buffer }) {
    const { id, values, avatar } = data;


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
      throw new Error("Tu dois être administrateur pour modifier le serveur");
    }

    const avatarName = avatar ? Date.now() : null;

    if (avatar) {
      const buffer = await sharp(avatar)
        .resize(150, 150)
        .webp({
          quality: 80,
          effort: 0
        })
        .toFile(path.join(__dirname, `../images/${avatarName}.webp`));
    }

    const { imgUrl: oldAvatar } = await Namespace.findByPk(id, {
      raw: true
    });

    await Namespace.update(
      {
        name: values.name,
        inviteCode: values.inviteCode,
        imgUrl: avatarName ? `/images/${avatarName}` : oldAvatar
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
    )?.toJSON();

    updateNamespace = {
      ...updateNamespace,
      imgUrl: `${
        process.env.DEV_AVATAR_URL
      }/namespace/${id}/${Date.now()}/avatar`
    };

    ios.of(`/${id}`).emit("updateNamespace", updateNamespace);
  },

  async deleteNamespace(ios: Socket, socket: SocketCustom, data: { id: number }) {
    const { id } = data;

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

    unlinkImage(namespace?.imgUrl);

    await Namespace.destroy({
      where: {
        id
      }
    });


    // @ts-ignore
    ios._nsps.delete(`/${id}`);
  },

  async joinInvitation(
    ios: Socket,
    socket: SocketCustom,
    data: Partial<NamespaceInterface>
  ) {
    const userId = socket.request.user.id;

    let namespace = (
      await Namespace.findOne({
        where: {
          invite_code: data.inviteCode
        }
      })
    )?.toJSON();

    if (!namespace) throw new Error("Code non valide");

    const checkIfUserAlreadyHasServer = await UserHasNamespace.findOne({
      where: {
        user_id: userId,
        namespace_id: namespace.id
      }
    });

    let { count } = await getNumberOfUser(namespace.id);
    const checkIfServerIsFull = count >= this.userLimit;

    if (checkIfUserAlreadyHasServer)
      throw new Error("Tu as déjà rejoint ce serveur");

    if (checkIfServerIsFull) throw new Error("Le serveur est plein");

    await UserHasNamespace.create({
      user_id: userId,
      namespace_id: namespace.id
    });

    let getNewNamespace = (
      await User.findByPk(userId, {
        include: {
          model: Namespace,
          as: "namespaces",
          include: ["rooms"],
          where: {
            inviteCode: data.inviteCode
          }
        }
      })
    )?.toJSON();

    getNewNamespace = {
      ...getNewNamespace?.namespaces[0],
      imgUrl: `${process.env.DEV_AVATAR_URL}/namespace/${
        namespace.id
      }/${Date.now()}/avatar`
    };

    let newUser = (
      await Namespace.findByPk(namespace.id, {
        include: [
          {
            model: User,
            as: "users",
            attributes: { exclude: ["password"] },
            where: {
              id: userId
            }
          }
        ]
      })
    )?.toJSON();

    newUser = {
      ...newUser?.users[0],
      avatarUrl: `${
        process.env.DEV_AVATAR_URL
      }/user/${userId}/${Date.now()}/avatar`,
      status: "online"
    };

    socket.emit("createdNamespace", [getNewNamespace]);
    ios.of(`/${namespace.id}`).emit("userJoinNamespace", [newUser]);
  },

  async leaveNamespace(ios: Socket, socket: SocketCustom, data: { id: number }) {

    const { id: namespaceId } = data;

    const { id: userId } = socket.request.user;

    await UserHasNamespace.destroy({
      where: {
        user_id: userId,
        namespace_id: namespaceId
      }
    });

    ios.of(`/${namespaceId}`).emit("userLeaveNamespace", { id: userId });
  }
};

export default namespaces;
