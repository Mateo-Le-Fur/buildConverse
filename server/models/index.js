const User = require("./User");
const Room = require("./Room");
const Namespace = require("./Namespace");
const Message = require("./Message");

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
  as: "user_ban",
  through: "ban",
  foreignKey: "user_id",
  otherKey: "namespace_id",
});

Namespace.belongsToMany(User, {
  as: "users_bans",
  through: "ban",
  foreignKey: "namespace_id",
  otherKey: "user_id",
});

User.belongsToMany(Namespace, {
  as: "userHasNamespaces",
  through: "user_has_namespace",
  foreignKey: "user_id",
  otherKey: "namespace_id",
  timestamps: false,
});

Namespace.belongsToMany(User, {
  as: "namespaceHasUsers",
  through: "user_has_namespace",
  foreignKey: "namespace_id",
  otherKey: "user_id",
  timestamps: false,
});

User.belongsToMany(Namespace, {
  as: "admins",
  through: "admin",
  foreignKey: "user_id",
  otherKey: "namespace_id",
});

Namespace.belongsToMany(User, {
  as: "namespace_has_admins",
  through: "admin",
  foreignKey: "namespace_id",
  otherKey: "user_id",
});

module.exports = {
  User,
  Room,
  Namespace,
  Message,
};
