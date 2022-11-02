const { User } = require("../models");
const bcrypt = require("bcrypt");
const ApiError = require("../errors/apiError");
const jwtToken = require("../config/jwt.config");

const authController = {
  async signin(req, res) {
    const { pseudo, email, password } = req.body;

    const user = await User.findOne({
      where: {
        email,
      },
    });

    if (user) {
      throw new ApiError("Cet utilisateur existe déjà", 400);
    }

    const hashPassword = await bcrypt.hash(password, 8);

    let createdUser = (
      await User.create({
        pseudo,
        email,
        password: hashPassword,
      })
    ).get();

    delete createdUser.password;

    res.json(createdUser);
  },

  async login(req, res) {
    const { email, password } = req.body;
    const user = await User.findOne({
      where: {
        email,
      },

      raw: true,
    });

    if (!user) throw new ApiError("Utilisateur introuvable", 400);

    const match = await bcrypt.compare(password, user.password);

    if (!match) throw new ApiError("Email ou Mot de passe incorrect", 400);

    const userToken = {
      id: user.id,
      pseudo: user.pseudo,
      admin: user.admin,
    };

    jwtToken.createJwtToken(req, res, userToken);

    delete user.password;

    res.json(user);
  },

  async logout(req, res) {
    res.clearCookie("jwt");
    res.end();
  },

  async getCurrent(req, res) {
    const { id } = req.user;

    const user = await User.findByPk(id, {
      raw: true,
    });

    const { password, description, email, ...rest } = user;

    res.json(rest);
  },
};

module.exports = authController;
