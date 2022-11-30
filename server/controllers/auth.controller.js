const { User } = require("../models");
const bcrypt = require("bcrypt");
const ApiError = require("../errors/apiError");
const jwtToken = require("../config/jwt.config");
const fs = require("fs");
const path = require("path");

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
        avatar_url: "/images/default-avatar",
      })
    ).get();

    delete createdUser.password;

    res.json(createdUser);
  },

  async login(req, res) {
    const { email, password } = req.body;
    let user = await User.findOne({
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

    const buf = fs.readFileSync(
      path.join(__dirname, `..${user.avatar_url ?? "/images/default-avatar"}`),
      {
        encoding: "base64",
      }
    );

    user = {
      ...user,
      avatar_url: buf,
    };

    res.json(user);
  },

  async logout(req, res) {
    res.clearCookie("jwt");
    res.end();
  },

  async getCurrent(req, res) {
    const { id } = req.user;

    let user = await User.findByPk(id, {
      attributes: { exclude: ["password"] },
      raw: true,
    });

    if (!user.avatar_url) {
      const buf = fs.readFileSync(
        path.join(__dirname, "../images/default-avatar"),
        {
          encoding: "base64",
        }
      );

      user = {
        ...user,
        avatar_url: buf,
      };

      res.json(user);
    } else {
      const buf = fs.readFileSync(
        path.join(__dirname, `..${user.avatar_url}`),
        {
          encoding: "base64",
        }
      );

      user = {
        ...user,
        avatar_url: buf,
      };

      res.json(user);
    }
  },
};

module.exports = authController;
