import User from "./User";
import Room from "./Room";
import UserNamespace from "./Namespace";
import Message from "./Message";
import UserHasNamespace from "./UserHasNamespace";
import FriendRequest from "./FriendRequest";
import Friend from "./Friend";

UserNamespace.hasMany(Room, {
  foreignKey: "namespace_id",
  as: "rooms"
});

Room.belongsTo(UserNamespace, {
  foreignKey: "namespace_id",
  as: "namespaces"
});

User.belongsToMany(Room, {
  as: "message_has_room",
  through: Message,
  foreignKey: "user_id",
  otherKey: "room_id"
});

Room.belongsToMany(User, {
  as: "room_has_message",
  through: Message,
  foreignKey: "user_id",
  otherKey: "room_id",
  timestamps: false
});

User.belongsToMany(User, {
  as: "friends",
  through: Friend,
  foreignKey: "user1_id",
  otherKey: "user2_id",
  timestamps: false
});

User.belongsToMany(User, {
  as: "userFriends",
  through: Friend,
  foreignKey: "user2_id",
  otherKey: "user1_id",
  timestamps: false
});

User.belongsToMany(User, {
  as: "pendingRequests",
  through: FriendRequest,
  foreignKey: "sender_id",
  otherKey: "recipient_id",
  timestamps: false
});

User.belongsToMany(User, {
  as: "friendsRequests",
  through: FriendRequest,
  foreignKey: "recipient_id",
  otherKey: "sender_id",
  timestamps: false
});

User.belongsToMany(UserNamespace, {
  as: "namespaces",
  through: UserHasNamespace,
  foreignKey: "user_id",
  otherKey: "namespace_id",
  timestamps: false
});

UserNamespace.belongsToMany(User, {
  as: "users",
  through: UserHasNamespace,
  foreignKey: "namespace_id",
  otherKey: "user_id",
  timestamps: false
});

export { User, Room, UserNamespace, Message, UserHasNamespace, FriendRequest, Friend };
