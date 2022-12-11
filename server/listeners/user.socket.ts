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

  constructor(ios: Server) {
    this._ios = ios;

  }

  public async updateUser(socket: SocketCustom, data: UpdateUserInterface) {
    const avatarName = data.avatar
      ? `${socket.request.user?.id}-${Date.now()}`
      : null;

    if (data.avatar) {
      await sharp(data.avatar)
        .resize(100, 100)
        .webp({
          quality: 80,
          effort: 0
        })
        .toFile(path.join(__dirname, `../images/${avatarName}.webp`));


      // await runService("./services/compressWorker.js", {
      //   data,
      //   avatarName
      // });
    }

    const { avatarUrl: oldAvatar } = await User.findByPk(data.id, {
      raw: true
    }) as User;

    await User.update(
      {
        pseudo: data.pseudo,
        email: data.email,
        description: data.description,
        avatarUrl: data.avatar ? `/images/${avatarName}` : oldAvatar
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

      this._ios.of(`/${ns}`).emit("updateUser", ...user);
    }
  }

  public async deleteUser(socket: Socket, data: DeleteUserInterface) {
    const { id, namespacesId } = data;

    for (let nsId of namespacesId) {
      this._ios.of(`/${nsId}`).emit("deleteUser", { id });
    }
  }

  public connectUser(socket: SocketCustom, data: { namespaces: number[] }) {
    const { namespaces } = data;
    const { id } = socket.request.user!;

    if (namespaces.length) {
      namespaces.forEach((ns) => {
        this._ios.of(`/${ns}`).emit("userConnect", { id });
      });
    }
  }

  public disconnectUser(socket: SocketCustom, data: { namespaces: number[] }) {
    const { namespaces } = data;
    const { id } = socket.request.user!;

    namespaces.forEach((ns) => {
      this._ios.of(`/${ns}`).emit("userDisconnect", { id });
    });
  }
};

export { UserManager };
