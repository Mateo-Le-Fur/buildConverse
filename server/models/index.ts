import User from "./User";
import Room from "./Room";
import Namespace from "./Namespace";
import Message from "./Message";
import UserHasNamespace from "./UserHasNamespace";

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
  foreignKey: "user_id",
  otherKey: "room_id",
});

User.belongsToMany(User, {
  as: "friends",
  through: "friend",
  foreignKey: "user_id",
  otherKey: "user_id",
});

User.belongsToMany(User, {
  as: "friends_requests",
  through: "friend_request",
  foreignKey: "user_id",
  otherKey: "user_id",
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

export { User, Room, Namespace, Message, UserHasNamespace };
