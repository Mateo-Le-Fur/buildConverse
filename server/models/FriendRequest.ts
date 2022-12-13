const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

class FriendRequest extends Model {}

FriendRequest.init(
  {

    senderId: {
      type: DataTypes.INTEGER,
      field: "sender_id"
    },

    recipientId: {
      type: DataTypes.INTEGER,
      field: "recipient_id"
    },

  },
  {
    sequelize,
    tableName: "friend_request",
    timestamps: false,
  }
);

export default FriendRequest;
