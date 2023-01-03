import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
} from "sequelize";
import sequelize from "../config/sequelize";
import Namespace from "./Namespace";
import User from "./User";
import PrivateRoom from "./PrivateRoom";

class UserHasPrivateRoom extends Model<
  InferAttributes<UserHasPrivateRoom>,
  InferCreationAttributes<UserHasPrivateRoom>
> {
  declare id: CreationOptional<ForeignKey<number>>;
  declare active: CreationOptional<boolean>;
  declare privateRoomId: ForeignKey<PrivateRoom["id"]>;
  declare userId: ForeignKey<User["id"]>;
}
UserHasPrivateRoom.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    userId: {
      type: DataTypes.INTEGER,
      field: "user_id",
    },

    privateRoomId: {
      type: DataTypes.INTEGER,
      field: "private_room_id",
    },

    active: {
      type: DataTypes.BOOLEAN,
    },
  },
  {
    sequelize,
    tableName: "user_has_private_room",
    timestamps: false,
  }
);

export default UserHasPrivateRoom;
