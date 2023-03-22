import { Response } from "express";

import {User} from "../models";
import {Op} from "sequelize";
import ApiError from "../errors/apiError";
import {RequestCustom} from "../interfaces";

class friendController {
  constructor() {
    this.foundFriends = this.foundFriends.bind(this);
  }


  async foundFriends(req: RequestCustom, res: Response) {
    const { pseudo } = req.params;

    let foundFriends = (await User.findAll({
      attributes: {
        exclude: ["password", "email"]
      },
      include: [
        {
          model: User,
          as: "friendsRequests",
          required: false
        },
        {
          model: User,
          as: "friends",
          required: false
        }
      ],
      where: {
        pseudo: {
          [Op.iLike]: `%${pseudo}%`
        }
      },
      limit: 10
    })).map((el) => el.toJSON());

    if (!foundFriends.length) throw new ApiError("Aucun utilisateur trouvé", 404);

    res.json(foundFriends);
  }
}

export default new friendController();
