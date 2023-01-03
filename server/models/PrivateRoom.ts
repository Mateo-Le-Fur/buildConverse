import {
  InferAttributes,
  InferCreationAttributes,
  Model,
  DataTypes,
  CreationOptional,
  ForeignKey,
} from "sequelize";

import sequelize from "../config/sequelize";
import { UserInterface } from "../interfaces/User";

class PrivateRoom extends Model<
  InferAttributes<PrivateRoom>,
  InferCreationAttributes<PrivateRoom>
> {
  declare id: CreationOptional<ForeignKey<number>>;
  declare privateRoomUsers?: UserInterface[];
}

PrivateRoom.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
  },
  {
    sequelize,
    tableName: "private_room",
    timestamps: false,
  }
);

export default PrivateRoom;
