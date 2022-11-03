const { Namespace, User } = require("../models");
const user = {
  async getNamespaceUser(nsSocket, namespace_id) {
    try {
      const userList = await Namespace.findByPk(namespace_id, {
        include: [
          {
            model: User,
            as: "namespaceHasUsers",
            attributes: { exclude: ["password"] },
          },
        ],
      });

      nsSocket.emit("userList", userList.namespaceHasUsers);
    } catch (e) {
      throw e;
    }
  },
};

module.exports = user;
