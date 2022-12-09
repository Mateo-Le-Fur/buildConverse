import { User, UserNamespace } from "../models";
import runService from "../services/runService";
import { Server, Socket } from "socket.io";
import { UpdateUserInterface } from "../interfaces/UpdateUserInterface";
import { SocketCustom } from "../interfaces/SocketCustom";
import { UserInterface } from "../interfaces/User";

class UserManager {

  private ios: Server;

  constructor(ios: Server) {
    this.ios = ios;

  }

  public async updateUser(socket: SocketCustom, data: UpdateUserInterface) {
    const avatar_name = data.avatar
      ? `${socket.request.user?.id}-${Date.now()}`
      : null;

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
    }) as User;

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
        await UserNamespace.findByPk(ns, {
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

      const user = namespace?.users.map((element: UserInterface) => {
        return {
          ...element,
          avatarUrl: `${process.env.DEV_AVATAR_URL}/user/${
            element.id
          }/${Date.now()}/avatar`,
          status: "online"
        };
      });

      console.log(ns)

      console.log(user)

      this.ios.of(`/${ns}`).emit("updateUser", ...user);
    }
  }

  public async deleteUser(socket: Socket, data: { id: number, namespacesId: number[] }) {
    const { id, namespacesId } = data;

    for (let nsId of namespacesId) {
      this.ios.of(`/${nsId}`).emit("deleteUser", { id });
    }
  }

  public connectUser(socket: SocketCustom, data: { namespaces: number[] }) {
    const { namespaces } = data;
    const { id } = socket.request.user!;

    if (namespaces.length) {
      namespaces.forEach((ns) => {
        this.ios.of(`/${ns}`).emit("userConnect", { id });
      });
    }
  }

  public disconnectUser(socket: SocketCustom, data: { namespaces: number[] }) {
    const { namespaces } = data;
    const { id } = socket.request.user!;

    namespaces.forEach((ns) => {
      this.ios.of(`/${ns}`).emit("userDisconnect", { id });
    });
  }
};

export { UserManager };
