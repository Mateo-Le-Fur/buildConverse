import {Response} from "express";

import {User} from "../models";
import {Op} from "sequelize";
import ApiError from "../errors/apiError";
import {RequestCustom} from "../interfaces";

class friendController {
  constructor() {
    this.addFriend = this.addFriend.bind(this);
  }


  async addFriend(req: RequestCustom, res: Response) {
    const {pseudo} = req.body;

    const userId = req.user?.id;

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

    const friends = foundFriends.map((friend) => {
      const data = {
        ...friend,
        avatarUrl: `${process.env.DEV_AVATAR_URL}/user/${
          friend.id
        }/${Date.now()}/avatar`,
        requestAlreadySent: friend.friendsRequests?.some((friendRequest) => friendRequest.id === userId),
        alreadyFriend: friend.friends?.some((friend) => friend.id === userId),
      };

      const { friendsRequests, friends, ...rest } = data;

      return rest;
    });

    res.json(friends);
  }
}

export default new friendController();
