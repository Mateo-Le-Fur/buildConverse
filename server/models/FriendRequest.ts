import {
  InferAttributes,
  InferCreationAttributes,
  Model,
  DataTypes,
  ForeignKey,
  CreationOptional,
} from "sequelize";

import sequelize from "../config/sequelize";
import User from "./User";

class FriendRequest extends Model<
  InferAttributes<FriendRequest>,
  InferCreationAttributes<FriendRequest>
> {
  declare id: CreationOptional<ForeignKey<number>>;
  declare senderId: ForeignKey<User["id"]>;
  declare recipientId: ForeignKey<User["id"]>;
}

FriendRequest.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    senderId: {
      type: DataTypes.INTEGER,
      field: "sender_id",
    },

    recipientId: {
      type: DataTypes.INTEGER,
      field: "recipient_id",
    },
  },
  {
    sequelize,
    tableName: "friend_request",
    timestamps: false,
  }
);

export default FriendRequest;
