const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

class PrivateRoom extends Model {}

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
