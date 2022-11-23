const { User } = require("../models");
const ApiError = require("../errors/apiError");

const userController = {
  async getUser(req, res) {
    const { id } = req.params;

    if (Number(id) !== req.user.id) throw new ApiError("Forbidden", 403);

    const user = await User.findByPk(id);

    if (!user) throw new ApiError("Aucun utilisateur trouvé", 400);

    res.json(user);
  },
};

module.exports = userController;
