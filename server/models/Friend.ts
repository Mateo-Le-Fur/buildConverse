import {
  InferAttributes,
  InferCreationAttributes,
  Model,
  DataTypes,
  ForeignKey,
  CreationOptional,
} from "sequelize";
import User from "./User";

import sequelize from "../config/sequelize";

class Friend extends Model<
  InferAttributes<Friend>,
  InferCreationAttributes<Friend>
> {
  declare id: CreationOptional<ForeignKey<number>>;
  declare user1Id: ForeignKey<User["id"]>;
  declare user2Id: ForeignKey<User["id"]>;
}

Friend.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    user1Id: {
      type: DataTypes.INTEGER,
      field: "user1_id",
    },

    user2Id: {
      type: DataTypes.INTEGER,
      field: "user2_id",
    },
  },
  {
    sequelize,
    tableName: "friend",
    timestamps: false,
  }
);

export default Friend;
