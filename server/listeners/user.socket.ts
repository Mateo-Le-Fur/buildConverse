import { User, UserNamespace } from "../models";
import runService from "../services/runService";
import { Server, Socket } from "socket.io";
import { UpdateUserInterface } from "../interfaces/UpdateUserInterface";
import { DeleteUserInterface } from "../interfaces/DeleteUserInterface";
import { SocketCustom } from "../interfaces/SocketCustom";
import { UserInterface } from "../interfaces/User";
import sharp from "sharp";
import path from "path";

class UserManager {
  private _ios: Server;
  private _clients: Map<number, string>;

  constructor(ios: Server, clients: Map<number, string>) {
    this._ios = ios;
    this._clients = clients;
  }

  public async updateUser(socket: SocketCustom, data: UpdateUserInterface) {
    const userId = socket.request.user?.id;

    const avatarName = data.avatar ? `${userId}-${Date.now()}` : null;

    if (data.avatar) {
      await sharp(data.avatar)
        .resize(100, 100)
        .webp({
          quality: 80,
          effort: 0,
        })
        .toFile(path.join(__dirname, `../images/${avatarName}.webp`));

      // await runService("./services/compressWorker.js", {
      //   data,
      //   avatarName
      // });
    }

    const { avatarUrl: oldAvatar } = (await User.findByPk(userId, {
      raw: true,
    })) as User;

    await User.update(
      {
        pseudo: data.pseudo,
        email: data.email,
        description: data.description,
        avatarUrl: data.avatar ? `/images/${avatarName}` : oldAvatar,
      },
      {
        where: {
          id: userId,
        },
      }
    );

    if (!data.namespaces.length && !data.friends.length) {
      socket.emit("updateUser", null);
      return;
    }

    if (data.namespaces.length) {
      for await (const ns of data.namespaces) {
        let namespace = (
          await UserNamespace.findByPk(ns, {
            attributes: {
              exclude: [
                "name",
                "invite_code",
                "img_url",
                "created_at",
                "updated_at",
              ],
            },
            include: [
              {
                model: User,
                as: "users",
                attributes: {
                  exclude: ["password", "email", "created_at", "updated_at"],
                },

                where: {
                  id: userId,
                },
              },
            ],
          })
        )?.toJSON();

        const user = namespace?.users.map((element: UserInterface) => {
          if (element !== undefined) {
            return {
              ...element,
              avatarUrl: `${process.env.DEV_AVATAR_URL}/user/${
                element.id
              }/${Date.now()}/avatar`,
              status: "online",
            };
          }
        });

        this._ios.of(`/${ns}`).emit("updateUser", ...user);
      }
    }

    if (data.friends.length) {
      const getUserUpdated = await User.findByPk(userId, {
        attributes: { exclude: ["password"] },
        raw: true,
      });

      const user = {
        ...getUserUpdated,
        status: "online",
        avatarUrl: `${process.env.DEV_AVATAR_URL}/user/${
          getUserUpdated?.id
        }/${Date.now()}/avatar`,
      };

      for (const id of data.friends) {
        const socketId = this._clients.get(id);

        if (socketId) {
          this._ios.to(socketId).emit("updateUser", user);
        }
      }
    }
  }

  public async deleteUser(socket: Socket, data: DeleteUserInterface) {
    const { id, namespacesId } = data;

    for (let nsId of namespacesId) {
      this._ios.of(`/${nsId}`).emit("deleteUser", { id });
    }
  }

  public connectUser(
    socket: SocketCustom,
    data: { namespaces: number[]; friends: number[] }
  ) {
    const { namespaces, friends } = data;
    const { id } = socket.request.user!;

    if (namespaces.length) {
      namespaces.forEach((ns) => {
        this._ios.of(`/${ns}`).emit("userConnect", { id });
      });
    }

    if (friends.length) {
      friends.forEach((friend) => {
        const socketId = this._clients.get(friend);

        if (socketId) {
          this._ios.to(socketId).emit("userConnect", { id });
        }
      });
    }
  }

  public disconnectUser(
    socket: SocketCustom,
    data: { namespaces: number[]; friends: number[] }
  ) {
    const { namespaces, friends } = data;
    const { id } = socket.request.user!;

    if (namespaces.length) {
      namespaces.forEach((ns) => {
        this._ios.of(`/${ns}`).emit("userDisconnect", { id });
      });
    }

    if (friends.length) {
      friends.forEach((friend) => {
        const socketId = this._clients.get(friend);

        if (socketId) {
          this._ios.to(socketId).emit("userDisconnect", { id });
        }
      });
    }
  }
}

export { UserManager };
