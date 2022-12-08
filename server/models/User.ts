import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../config/sequelize";
import type { UserInterface } from "../interfaces/User";

class User extends Model<Optional<UserInterface, any>> {
  declare id: number;
  declare pseudo: string;
  declare password: string;
  declare description: string;
  declare status: string;
  declare avatarUrl: string;
}

User.init(
  {
    pseudo: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    email: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true,
    },

    password: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    status: DataTypes.TEXT,

    avatarUrl: {
      type: DataTypes.TEXT,
      field: "avatar_url",
    },

    description: DataTypes.TEXT,
  },
  {
    sequelize,
    tableName: "user",
  }
);

export default User;
