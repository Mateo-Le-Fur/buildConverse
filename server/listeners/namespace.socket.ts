import { NamespaceInterface } from "../interfaces/Namespace";
import { Server, Socket } from "socket.io";
import { User, UserNamespace, Room, UserHasNamespace } from "../models";
import path from "path";
import sharp from "sharp";
import { getNumberOfUser } from "../query/namespace.query";
import { getRandomImage } from "../utils/getRandomImage";
import { SocketCustom } from "../interfaces/SocketCustom";

const { unlinkImage } = require("../utils/unlinckImage");

class NamespacesManager {

  protected userLimit: number;
  protected ios: Server;

  constructor(ios: Server,  clients: Map<number, string>) {
    this.ios = ios;
    this.userLimit = 3000;
  }


  public async getUserNamespaces(
    socket: SocketCustom
  ) {
    const userId = socket.request.user?.id;

    let foundUsersNamespace = (
      await User.findByPk(userId, {
        include: {
          model: UserNamespace,
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

    socket.emit("namespaces", getNamespaces);
  }


  public async getNamespaceUsers(
    nsSocket: Socket,
    namespaceId: number,
    clients: Map<number, string>
  ) {
    const t0 = performance.now();

    let namespace = await UserNamespace.findByPk(namespaceId);

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
  }

  public async loadMoreUser(
    nsSocket: Socket,
    data: { length: number; namespaceId: number },
    clients: Map<number, string>
  ) {
    const { length, namespaceId } = data;

    const t0 = performance.now();

    let namespace = await UserNamespace.findByPk(namespaceId);

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
  }

  public async createNamespace(socket: SocketCustom, data: NamespaceInterface) {
    console.time("create");

    const { id: userId } = socket.request.user!;

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

    const createNamespace = await UserNamespace.create({
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
          model: UserNamespace,
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
  }

  public async updateNamespace(socket: SocketCustom, data: { id: number; values: NamespaceInterface, avatar: Buffer }) {
    const { id, values, avatar } = data;


    const userId = socket.request.user?.id;

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

    const { imgUrl: oldAvatar } = await UserNamespace.findByPk(id, {
      raw: true
    }) as UserNamespace;

    await UserNamespace.update(
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
      await UserNamespace.findByPk(id, {
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

    this.ios.of(`${id}`).emit("updateNamespace", updateNamespace);
  }

  async deleteNamespace(socket: SocketCustom, data: { id: number }) {
    const { id } = data;

    const userId = socket.request.user?.id;

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

    this.ios.of(`${id}`).emit("deleteNamespace", { id });

    const namespace = await UserNamespace.findByPk(id, {
      raw: true
    });

    unlinkImage(namespace?.imgUrl);

    await UserNamespace.destroy({
      where: {
        id
      }
    });

    this.ios._nsps.delete(`/${id}`);
  }


  public async joinInvitation(
    socket: SocketCustom,
    data: Partial<NamespaceInterface>
  ) {
    const userId = socket.request.user?.id;

    let namespace: NamespaceInterface | undefined = (
      await UserNamespace.findOne({
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
          model: UserNamespace,
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
      await UserNamespace.findByPk(namespace.id, {
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
    this.ios.of(`/${namespace.id}`).emit("userJoinNamespace", [newUser]);
  }


  async leaveNamespace(socket: SocketCustom, data: { id: number }) {

    const { id: namespaceId } = data;

    const { id: userId } = socket.request.user!;

    await UserHasNamespace.destroy({
      where: {
        user_id: userId,
        namespace_id: namespaceId
      }
    });

    this.ios.of(`/${namespaceId}`).emit("userLeaveNamespace", { id: userId });
  }
}

export { NamespacesManager };
