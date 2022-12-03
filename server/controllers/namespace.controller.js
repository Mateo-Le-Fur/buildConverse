const { User, Namespace } = require("../models");
const ApiError = require("../errors/apiError");
const fs = require("fs");
const path = require("path");

const namespaceController = {

  async getNamespaceAvatar(req, res) {

    const { id } = req.params;

    console.log("namespace id: "  + id)

    const namespace = await Namespace.findByPk(id, { raw: true });

    res.sendFile(path.join(__dirname, `..${namespace.img_url}.webp`));
  },

};

module.exports = namespaceController;
