import { User, Namespace } from "../models";
import runService from "../services/runService";
import { Socket } from "socket.io";
import { UpdateUserInterface } from "../interfaces/UpdateUserInterface";
import { SocketCustom } from "../interfaces/SocketCustom";
import { UserInterface } from "../interfaces/User";
import { NamespaceInterface } from "../interfaces/Namespace";
import { UserHasNamespaceInterface } from "../interfaces/UserHasNamespace";

const user = {
  async updateUser(socket: SocketCustom, ios: Socket, data: UpdateUserInterface) {
    const avatar_name = data.avatar
      ? `${socket.request.user.id}-${Date.now()}`
      : null;

    console.log(data);

    console.log(avatar_name);

    if (data.avatar) {
      const t0 = performance.now();

      await runService("./services/compressWorker.js", {
        data,
        avatar_name
      });

      const t1 = performance.now();

      console.log(`compression done : ${t1 - t0} ms`);
    }

    const { avatarUrl: oldAvatar } = await User.findByPk(data.id, {
      raw: true
    });

    await User.update(
      {
        pseudo: data.pseudo,
        email: data.email,
        description: data.description,
        avatarUrl: data.avatar ? `/images/${avatar_name}` : oldAvatar
      },
      {
        where: {
          id: data.id
        }
      }
    );

    if (!data.namespaces.length) {
      socket.emit("updateUser", "update user");
      return;
    }

    for await (const ns of data.namespaces) {
      let namespace = (
        await Namespace.findByPk(ns, {
          attributes: {
            exclude: [
              "name",
              "invite_code",
              "img_url",
              "created_at",
              "updated_at"
            ]
          },
          include: [
            {
              model: User,
              as: "users",
              attributes: {
                exclude: ["password", "email", "created_at", "updated_at"]
              },

              where: {
                id: data.id
              }
            }
          ]
        })
      )?.toJSON();

      console.log(namespace);

      namespace = namespace?.users.map((element: UserInterface) => {
        return {
          ...element,
          avatarUrl: `${process.env.DEV_AVATAR_URL}/user/${
            element.id
          }/${Date.now()}/avatar`,
          status: "online"
        };
      });

      ios.of(`/${ns}`).emit("updateUser", { ...user });
    }
  },

  async deleteUser(socket: Socket, ios: Socket, data: { id: number, namespacesId: number[] }) {
    const { id, namespacesId } = data;

    for (let nsId of namespacesId) {
      ios.of(`/${nsId}`).emit("deleteUser", { id });
    }
  },

  connectUser(socket: SocketCustom, ios: Socket, data: { namespaces: number[] }) {
    const { namespaces } = data;
    const { id } = socket.request.user;

    if (namespaces.length) {
      namespaces.forEach((ns) => {
        ios.of(`/${ns}`).emit("userConnect", { id });
      });
    }
  },

  disconnectUser(socket: SocketCustom, ios: Socket, data: {namespaces: number[]}) {
    const { namespaces } = data;
    const { id } = socket.request.user;

    namespaces.forEach((ns) => {
      ios.of(`/${ns}`).emit("userDisconnect", { id });
    });
  }
};

export default user;
