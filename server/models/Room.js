const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

class Room extends Model {}

Room.init(
  {
    name: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    index: DataTypes.INTEGER,
  },
  {
    sequelize,
    tableName: "room",
  }
);

module.exports = Room;
