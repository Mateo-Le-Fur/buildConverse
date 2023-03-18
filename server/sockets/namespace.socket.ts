import {NamespaceInterface} from "../interfaces/Namespace";
import {Server, Socket} from "socket.io";
import {User, Namespace, Room, UserHasNamespace} from "../models";
import path from "path";
import sharp from "sharp";
import {getNumberOfUsers, getNumberOfUsersConnected} from "../query/namespace.query";
import {getRandomImage} from "../utils/getRandomImage";
import {
  UpdateNamespaceInterface,
  UserInterface,
  SocketCustom,
} from "../interfaces";
import namespace from "../models/Namespace";

const {unlinkImage} = require("../utils/unlinckImage");

class NamespacesManager {
  protected _ios: Server;
  protected _clients: Map<number, string>;
  private readonly _userLimit: number;
  private readonly _userNamespacesLimit: number;

  constructor(ios: Server, clients: Map<number, string>) {
    this._ios = ios;
    this._clients = clients;
    this._userLimit = 3000;
    this._userNamespacesLimit = 20;
  }

  public get userLimit() {
    return this._userLimit;
  }

  public get userNamespacesLimit() {
    return this._userNamespacesLimit;
  }

  public async getUserNamespaces(socket: SocketCustom) {
    const userId = socket.request.user?.id;

    let foundUserNamespaces = (
      await User.findByPk(userId, {
        attributes: {
          exclude: ["email", "password"],
        },
        include: {
          model: Namespace,
          as: "namespaces",
          include: ["rooms"],
        },
      })
    )?.toJSON();

    if (foundUserNamespaces?.namespaces) {
     return await Promise.all(foundUserNamespaces?.namespaces?.map(
        async (namespace: NamespaceInterface) => {
          return {
            ...namespace,
            usersOnline: await getNumberOfUsersConnected(namespace.id),
          };
        }
      ))
    }
  }

  public async getNamespaceUsers(socket: Socket, namespaceId: number) {
    const isAuthorize = socket.rooms.has(`server-${namespaceId}`);

    if (!isAuthorize) throw new Error("Forbidden");

    let foundNamespace = await Namespace.findByPk(namespaceId);

    const nbUsers = await getNumberOfUsers(namespaceId);

    let users = await foundNamespace?.getUsers({
      attributes: {exclude: ["password", "email"]},
      limit: 50,
      offset: 0,
      raw: true,
      nest: true,
      order: [["status", "desc"]],
    });

    socket.emit("userList", {
      users: users,
      numberOfUsers: nbUsers.count,
    });
  }

  public async loadMoreUser(
    socket: Socket,
    data: { currentArrayLength: number; namespaceId: number }
  ) {
    const {currentArrayLength, namespaceId} = data;

    const isAuthorize = socket.rooms.has(`server-${namespaceId}`);

    if (!isAuthorize) throw new Error("Forbidden");

    let namespace = await Namespace.findByPk(namespaceId);

    const foundUsers = await namespace?.getUsers({
      attributes: {exclude: ["email", "password"]},
      limit: 50,
      offset: currentArrayLength,
      raw: true,
      nest: true,
      order: [["status", "desc"]],
    });


    socket.emit("loadMoreUser", foundUsers);
  }

  public async createNamespace(socket: SocketCustom, data: NamespaceInterface) {
    const userId = socket.request.user?.id;

    const imgName = data.imgBuffer ? Date.now() : null;

    if (data.imgBuffer) {
      await sharp(data.imgBuffer)
        .resize(150, 150)
        .webp({
          quality: 80,
        })
        .toFile(path.join(__dirname, `../images/${imgName}.webp`));
    }

    const createNamespace = await Namespace.create({
      name: data.name,
      inviteCode: data.inviteCode,
      imgUrl: imgName ? `/images/${imgName}` : `/images/${getRandomImage()}`,
    });

    const {id} = createNamespace.toJSON();

    await Room.create({
      name: "# Général",
      index: 1,
      namespaceId: id,
    });

    await UserHasNamespace.create({
      userId: userId,
      namespaceId: id,
      admin: true,
    });

    const foundUserNamespace = (
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
    )?.toJSON();

    const [namespaces] = [...foundUserNamespace?.namespaces!];

    const userNamespace = {
      ...namespaces,
      usersOnline: 1,
    };


    socket.join(`server-${id}`);

    socket.emit("createdNamespace", userNamespace);
  }

  public async updateNamespace(
    socket: SocketCustom,
    data: UpdateNamespaceInterface
  ) {
    const {namespaceId, inviteCode, imgBuffer, name} = data;

    const isAuthorize = socket.rooms.has(`server-${namespaceId}`);

    if (!isAuthorize) throw new Error("Forbidden");

    const userId = socket.request.user?.id;

    const avatarName = imgBuffer ? Date.now() : null;

    if (imgBuffer) {
      await sharp(imgBuffer)
        .resize(100, 100)
        .webp({
          quality: 80,
          effort: 0,
        })
        .toFile(path.join(__dirname, `../images/${avatarName}.webp`));
    }

    const {imgUrl: oldAvatar} = (await Namespace.findByPk(namespaceId, {
      raw: true,
    })) as Namespace;

    await Namespace.update(
      {
        name,
        inviteCode,
        imgUrl: avatarName ? `/images/${avatarName}` : oldAvatar,
      },
      {
        where: {
          id: namespaceId,
        },
      }
    );

    let updateNamespace = await Namespace.findByPk(namespaceId, {
      include: {
        model: Room,
        as: "rooms",
      },
      raw: true,
    });


    const newUpdateNamespace = {
      ...updateNamespace,
      usersOnline: await getNumberOfUsersConnected(updateNamespace?.id),
    };

    this._ios
      .to(`server-${namespaceId}`)
      .emit("updateNamespace", newUpdateNamespace);
  }

  async deleteNamespace(socket: SocketCustom, namespaceId: number) {
    const isAuthorize = socket.rooms.has(`server-${namespaceId}`);

    if (!isAuthorize) throw new Error("Forbidden");


    const userId = socket.request.user?.id;

    this._ios
      .to(`server-${namespaceId}`)
      .emit("deleteNamespace", {id: namespaceId});

    const namespace = await Namespace.findByPk(namespaceId, {
      raw: true,
    });

    unlinkImage(namespace?.imgUrl);

    await Namespace.destroy({
      where: {
        id: namespaceId,
      },
    });

    this._ios.sockets.adapter.rooms.delete(`server-${namespaceId}`);
  }

  public async joinInvitation(
    socket: SocketCustom,
    data: Partial<NamespaceInterface>
  ) {
    const userId = socket.request.user?.id;

    const foundNamespace = (
      await Namespace.findOne({
        where: {
          inviteCode: data.inviteCode,
        },
      })
    )?.toJSON() as Namespace;

    if (!foundNamespace) throw new Error("Code non valide");


    const {id: namespaceId} = foundNamespace;

    await UserHasNamespace.create({
      userId,
      namespaceId: namespaceId,
    });

    let foundUserNamespaces = (
      await User.findByPk(userId, {
        include: {
          model: Namespace,
          as: "namespaces",
          include: ["rooms"],
          where: {
            inviteCode: data.inviteCode,
          },
        },
      })
    )?.toJSON();

    const [namespaces] = [...foundUserNamespaces?.namespaces!];

    let foundNamespaceUser = (
      await Namespace.findByPk(namespaceId, {
        include: [
          {
            model: User,
            as: "users",
            attributes: {exclude: ["email", "password"]},
            where: {
              id: userId,
            },
          },
        ],
      })
    )?.toJSON();

    const [users] = [...foundNamespaceUser?.users!];


    socket.join(`server-${namespaceId}`);

    socket.emit("createdNamespace", namespaces);

    this._ios.to(`server-${namespaceId}`).emit("userJoinNamespace", [users]);
  }

  async leaveNamespace(socket: SocketCustom, namespaceId: number) {
    const isAuthorize = socket.rooms.has(`server-${namespaceId}`);

    if (!isAuthorize) throw new Error("Forbidden");

    const userId = socket.request.user?.id;

    await UserHasNamespace.destroy({
      where: {
        userId,
        namespaceId: namespaceId,
      },
    });

    this._ios
      .to(`server-${namespaceId}`)
      .emit("userLeaveNamespace", {id: userId});
  }
}

export {NamespacesManager};
