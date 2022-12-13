const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

class Friend extends Model {}

Friend.init(
  {

    user1Id: {
      type: DataTypes.INTEGER,
      field: "user1_id"
    },

    user2Id: {
      type: DataTypes.INTEGER,
      field: "user2_id"
    },

  },
  {
    sequelize,
    tableName: "friend",
    timestamps: false,
  }
);

export default Friend;
