const { User, Namespace } = require("../models");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const user = {
  async updateUser(socket, ios, data) {
    try {
      const avatar_name = data.avatarName ? Date.now() : null;

      if (data.avatar) {
        const t0 = performance.now();

        const buffer = await sharp(data.avatar)
          .resize(80, 80)
          .webp({
            quality: 80,
            effort: 0,
          })
          .toBuffer();

        const t1 = performance.now();

        const writer = fs.createWriteStream(
          path.join(__dirname, "../images/" + avatar_name),
          {
            encoding: "base64",
          }
        );

        writer.write(buffer);
        writer.end();
        console.log(`time ${data.userId} : ${t1 - t0} ms`);
      }

      const { avatar_url: oldAvatar } = await User.findByPk(data.userId, {
        raw: true,
      });

      await User.update(
        {
          pseudo: data.pseudo,
          email: data.email,
          avatar_url: data.avatar ? `/images/${avatar_name}` : oldAvatar,
        },
        {
          where: {
            id: data.userId,
          },
        }
      );

      for await (const ns of data.namespaces) {
        let user = (
          await Namespace.findByPk(ns, {
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
                as: "namespaceHasUsers",
                attributes: {
                  exclude: ["password", "email", "created_at", "updated_at"],
                },

                where: {
                  id: data.userId,
                },
              },
            ],
          })
        ).toJSON();

        user = user.namespaceHasUsers.map((element) => {
          const buffer = fs.readFileSync(
            path.join(__dirname, `..${element.avatar_url}`),
            {
              encoding: "base64",
            }
          );

          return {
            ...element,
            avatar_url: buffer,
            status: "online",
          };
        });

        ios.of(ns).emit("updateUser", user);
      }
    } catch (e) {
      console.error(e);
    }

    /* Je parcours tout les namespaces de l'utilisateur et j'emit l'utilisateur mise a jour * sur chaque namespace */

    // const promises = [];
    //
    // data.namespaces.forEach((ns) => {
    //   const t0 = performance.now();
    //
    //   let user = Namespace.findByPk(ns, {
    //     attributes: {
    //       exclude: [
    //         "name",
    //         "invite_code",
    //         "img_url",
    //         "created_at",
    //         "updated_at",
    //       ],
    //     },
    //     include: [
    //       {
    //         model: User,
    //         as: "namespaceHasUsers",
    //         attributes: {
    //           exclude: ["password", "email", "created_at", "updated_at"],
    //         },
    //
    //         where: {
    //           id: data.userId,
    //         },
    //       },
    //     ],
    //
    //     raw: true,
    //     nest: true,
    //   });
    //
    //   promises.push(user);
    //
    //   const t1 = performance.now();
    //
    //   console.log(`time : ${t1 - t0} ms`);
    // });
    //
    // setTimeout(() => {
    //   Promise.all(promises).then((values) => {});
    // }, 1000);
    //
    // // values.forEach((ns) => {
    // //   ios.of(ns.id).emit("updateUser", [
    // //     {
    // //       ...ns.namespaceHasUsers,
    // //       status: "online",
    // //     },
    // //   ]);
    // // });
    // //
    // // const t1 = performance.now();
    // //
    // // console.log(`time : ${t1 - t0} ms`);
  },
};

module.exports = user;
