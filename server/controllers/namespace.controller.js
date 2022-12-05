const { User, Namespace, UserHasNamespace } = require("../models");
const ApiError = require("../errors/apiError");
const fs = require("fs");
const path = require("path");

const namespaceController = {
  async getNamespaceAvatar(req, res) {
    const { id } = req.params;

    console.log("namespace id: " + id);

    const namespace = await Namespace.findByPk(id, { raw: true });

    res.sendFile(path.join(__dirname, `..${namespace.img_url}.webp`));
  },

  async leaveNamespace(req, res) {
    const { id } = req.params;

    await UserHasNamespace.destroy({
      where: {
        user_id: req.user.id,
        namespace_id: id,
      },
    });

    res.end();
  },
};

module.exports = namespaceController;
