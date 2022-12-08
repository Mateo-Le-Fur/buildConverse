import { Request, Response } from "express";
import { RequestCustom } from "../interfaces/ReqUserInterface";

import { User } from "../models";
import ApiError from "../errors/apiError";
import fs from "fs";
import path from "path";

class userController {
  constructor() {
    this.getUserAvatar = this.getUserAvatar.bind(this);
    this.deleteAccount = this.deleteAccount.bind(this);
  }
  async getUserAvatar(req: Request, res: Response) {
    const { id } = req.params;

    const user = await User.findByPk(id, { raw: true });

    res.sendFile(path.join(__dirname, `../${user?.avatarUrl}.webp`));
  }

  async deleteAccount(req: RequestCustom, res: Response) {
    // const io = req.app.get("socketio");

    const { id } = req.params;
    if (Number(id) !== req.user?.id) throw new ApiError("forbidden", 403);

    const user = await User.findByPk(id, { raw: true });

    if (user?.avatarUrl !== "/images/default-avatar.webp") {
      fs.unlinkSync(path.join(__dirname, `..${user?.avatarUrl}.webp`));
    }

    await User.destroy({
      where: {
        id,
      },
    });

    res.clearCookie("jwt");

    res.end();
  }
}

export default new userController();
