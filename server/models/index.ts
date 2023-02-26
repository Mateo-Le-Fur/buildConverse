import User from "./User";
import Room from "./Room";
import Namespace from "./Namespace";
import Message from "./Message";
import UserHasNamespace from "./UserHasNamespace";
import FriendRequest from "./FriendRequest";
import Friend from "./Friend";
import PrivateRoom from "./PrivateRoom";
import PrivateMessage from "./PrivateMessage";
import UserHasPrivateRoom from "./UserHasPrivateRoom";

Namespace.hasMany(Room, {
  foreignKey: "namespace_id",
  as: "rooms",
});

Room.belongsTo(Namespace, {
  foreignKey: "namespace_id",
  as: "namespaces",
});

User.belongsToMany(Room, {
  as: "message_has_room",
  through: Message,
  foreignKey: "user_id",
  otherKey: "room_id",
});

Room.belongsToMany(User, {
  as: "room_has_message",
  through: Message,
  foreignKey: "room_id",
  otherKey: "user_id",
  timestamps: false,
});

User.belongsToMany(User, {
  as: "friends",
  through: Friend,
  foreignKey: "user1_id",
  otherKey: "user2_id",
  timestamps: false,
});

User.belongsToMany(User, {
  as: "userFriends",
  through: Friend,
  foreignKey: "user2_id",
  otherKey: "user1_id",
  timestamps: false,
});

User.belongsToMany(User, {
  as: "pendingRequests",
  through: FriendRequest,
  foreignKey: "sender_id",
  otherKey: "recipient_id",
  timestamps: false,
});

User.belongsToMany(User, {
  as: "friendsRequests",
  through: FriendRequest,
  foreignKey: "recipient_id",
  otherKey: "sender_id",
  timestamps: false,
});

User.belongsToMany(PrivateRoom, {
  as: "userHasPrivateMessage",
  through: PrivateMessage,
  foreignKey: "user_id",
  otherKey: "private_room_id",
  timestamps: false,
});

PrivateRoom.belongsToMany(User, {
  as: "privateMessageHasUser",
  through: PrivateMessage,
  foreignKey: "private_room_id",
  otherKey: "user_id",
  timestamps: false,
});

User.belongsToMany(PrivateRoom, {
  as: "userPrivateRooms",
  through: UserHasPrivateRoom,
  foreignKey: "user_id",
  otherKey: "private_room_id",
  timestamps: false,
});

PrivateRoom.belongsToMany(User, {
  as: "privateRoomUsers",
  through: UserHasPrivateRoom,
  foreignKey: "private_room_id",
  otherKey: "user_id",
  timestamps: false,
});

User.belongsToMany(Namespace, {
  as: "namespaces",
  through: UserHasNamespace,
  foreignKey: "user_id",
  otherKey: "namespace_id",
  timestamps: false,
});

Namespace.belongsToMany(User, {
  as: "users",
  through: UserHasNamespace,
  foreignKey: "namespace_id",
  otherKey: "user_id",
  timestamps: false,
});

export {
  User,
  Room,
  Namespace,
  Message,
  UserHasNamespace,
  FriendRequest,
  Friend,
  PrivateRoom,
  PrivateMessage,
  UserHasPrivateRoom,
};
