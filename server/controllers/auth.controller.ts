import { Request, Response } from "express";
import { UserFormInterface } from "../interfaces/UserForm";
import { RequestCustom } from "../interfaces/ReqUserInterface";

import { User } from "../models";
import bcrypt from "bcrypt";
import ApiError from "../errors/apiError";
import jwtToken from "../config/jwt.config";
import { UserInterface } from "../interfaces/User";

class authController {
  constructor() {
    this.signin = this.signin.bind(this);
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.getCurrent = this.getCurrent.bind(this);
  }
  async signin(req: Request, res: Response) {
    const { pseudo, email, password }: UserFormInterface = req.body;

    const foundUser = await User.findOne({
      where: {
        email,
      },
    });

    if (foundUser) {
      throw new ApiError("Cet utilisateur existe déjà", 400);
    }

    const hashPassword = await bcrypt.hash(password, 8);

    let createdUser = (
      await User.create({
        pseudo,
        email,
        password: hashPassword,
        avatarUrl: "/images/default-avatar",
      })
    ).get();

    delete createdUser.password;

    res.json(createdUser);
  }

  async login(req: Request, res: Response) {
    const { email, password } = req.body;
    let foundUser: Partial<User> | null = await User.findOne({
      where: {
        email,
      },

      raw: true,
    });

    if (!foundUser) throw new ApiError("Utilisateur introuvable", 400);

    const passwordMatch = await bcrypt.compare(password, foundUser.password!);

    if (!passwordMatch)
      throw new ApiError("Email ou Mot de passe incorrect", 400);

    const jwtPayload = {
      id: foundUser.id,
      pseudo: foundUser.pseudo,
    };

    delete foundUser.password;

    jwtToken.createJwtToken(req, res, jwtPayload);

    const updateUser = {
      ...foundUser,
      avatarUrl: `${process.env.DEV_AVATAR_URL}/user/${
        foundUser.id
      }/${Date.now()}/avatar`,
    };

    res.json(updateUser);
  }

  async logout(req: Request, res: Response) {
    res.clearCookie("jwt");
    res.end();
  }

  async getCurrent(req: RequestCustom, res: Response) {
    const { id } = req.user!;

    let foundUser = await User.findByPk(id, {
      attributes: { exclude: ["password"] },
      raw: true,
    });

    const updateUser = {
      ...foundUser,
      avatarUrl: `${
        process.env.DEV_AVATAR_URL
      }/user/${id}/${Date.now()}/avatar`,
    };

    res.json(updateUser);
  }
}

export default new authController();
