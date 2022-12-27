const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

class UserHasPrivateRoom extends Model {}

UserHasPrivateRoom.init(
  {
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
