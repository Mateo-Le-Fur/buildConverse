import { Request, Response } from "express";
import { RequestCustom } from "../interfaces/ReqUserInterface";

import { PrivateRoom, User, UserHasPrivateRoom } from "../models";
import ApiError from "../errors/apiError";
import fs from "fs";
import path from "path";

class userController {
  constructor() {
    this.getUserAvatar = this.getUserAvatar.bind(this);
    this.deleteAccount = this.deleteAccount.bind(this);
    this.disableConversation = this.disableConversation.bind(this);
  }

  async disableConversation(req: RequestCustom, res: Response) {
    const { id } = req.params;
    const userId = req.user?.id;

    await UserHasPrivateRoom.update(
      {
        active: false,
      },
      {
        where: {
          userId,
          privateRoomId: id,
        },
      }
    );

    res.json({ id });
  }

  async getUserAvatar(req: Request, res: Response) {
    const { id } = req.params;

    const user = await User.findByPk(id, { raw: true });

    res.sendFile(path.join(__dirname, `../${user?.avatarUrl}.webp`));
  }

  async deleteAccount(req: RequestCustom, res: Response) {
    res.clearCookie("jwt");

    res.end();
  }
}

export default new userController();
