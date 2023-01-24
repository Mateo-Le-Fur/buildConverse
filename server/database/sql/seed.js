const { faker } = require("@faker-js/faker");
const { Sequelize } = require("sequelize");

const client = new Sequelize("postgres://chat:MuvzH6712Hg@@localhost/chat", {
  define: {
    createdAt: "created_at",
    updatedAt: "updated_at",
  },

  // benchmark: true,
  logging: false,
});
//
// const { Namespace } = require("../../models/");
//
// async function generateNamespace() {
//   for (let i = 0; i < 20000; i++) {
//     const query = `INSERT INTO "namespace" ("name", "invite_code", "img_url") VALUES('aaa', 'aaa', 'aaaa')`;
//
//     await client.query(query);
//   }
// }
//
const nbUsers = 100000;
const nbNamespaces = 100;
const nbRooms = nbNamespaces;
const nbMessages = 100000;
const nbUserHasNamespace = nbUsers;

function generateNames(nb) {
  for (let i = 0; i < nb; i++) {
    names.push(faker.internet.userName());
  }
}

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function pgQuoteEscape(row) {
  const newRow = {};
  Object.entries(row).forEach(([prop, value]) => {
    if (typeof value !== "string") {
      newRow[prop] = value;
      return;
    }
    newRow[prop] = value.replaceAll("'", "''");
  });
  return newRow;
}

const names = [];
const namespaces = [];
const users = [];
const rooms = [];
const namespaceUsers = [];
const messages = [];
const privateMessages = [];
const friends = [];
function generateUsers(userNb) {
  for (let i = 0; i < userNb; i++) {
    // const random = Math.floor(Math.random() * images.length);

    const user = {
      pseudo: faker.name.firstName(),
      email: faker.random.alphaNumeric(20),
      password: faker.name.middleName(),
      status: "offline",
      avatar_url: `/images/1-1671104971815`,
    };

    users.push(user);
  }
  return users;
}

async function insertUsers(users) {
  // await client.query('TRUNCATE TABLE "user" RESTART IDENTITY CASCADE');

  const userValues = users.map((user) => {
    const newUser = pgQuoteEscape(user);
    return `(
          '${newUser.pseudo}',
          '${newUser.email}',
          '${newUser.password}',
          '${newUser.status}',
          '${newUser.avatar_url}',
          '${newUser.description}'
      )`;
  });

  const queryStr = `
           INSERT INTO "user"
           (
            "pseudo",
            "email",
            "password",
            "status",
            "avatar_url",
            "description"
           )
           VALUES
           ${userValues}
           RETURNING id
   `;
  const result = await client.query(queryStr);
  return result.rows;
}

function generateNamespaces(nb) {
  for (let i = 0; i < nb; i++) {
    // const random = Math.floor(Math.random() * images.length);

    const namespace = {
      name: faker.name.firstName(),
      invite_code: faker.random.alphaNumeric(8),
      img_url: `/images/1-1671104971815`,
    };

    namespaces.push(namespace);
  }
  return namespaces;
}

async function insertNamespaces(namespaces) {
  // await client.query('TRUNCATE TABLE "user" RESTART IDENTITY CASCADE');

  const values = namespaces.map((namespace) => {
    const newNamespace = pgQuoteEscape(namespace);
    return `(
          '${newNamespace.name}',
          '${newNamespace.invite_code}',
          '${newNamespace.img_url}'
      )`;
  });

  const queryStr = `
           INSERT INTO "namespace"
           (
            "name",
            "invite_code",
            "img_url"
           )
           VALUES
           ${values}
           RETURNING id
   `;
  const result = await client.query(queryStr);
  return result.rows;
}

function generateRooms(nb) {
  for (let i = 0; i < nb; i++) {
    // const random = Math.floor(Math.random() * images.length);

    const room = {
      name: faker.name.firstName(),
      namespace_id: getRandomIntInclusive(1, nbNamespaces),
    };

    rooms.push(room);
  }
  return rooms;
}

async function insertRooms(rooms) {
  // await client.query('TRUNCATE TABLE "user" RESTART IDENTITY CASCADE');

  const values = rooms.map((user) => {
    const newRoom = pgQuoteEscape(user);
    return `(
          '${newRoom.name}',
          '${newRoom.namespace_id}'
      )`;
  });

  const queryStr = `
           INSERT INTO "room"
           (
            "name",
            "namespace_id"
           )
           VALUES
           ${values}
           RETURNING id
   `;
  const result = await client.query(queryStr);
  return result.rows;
}

function generateUserHasNamespace(nb) {
  for (let i = 1; i < nb; i++) {
    const user = {
      user_id: i + 1,
      namespace_id: getRandomIntInclusive(1, nbNamespaces),
      admin: false,
    };

    namespaceUsers.push(user);
  }
  return namespaceUsers;
}

async function insertUserHasNamespace(namespaceUsers) {
  const userValues = namespaceUsers.map((user) => {
    const newUser = pgQuoteEscape(user);
    return `(
          '${newUser.user_id}',
          '${newUser.namespace_id}',
          '${newUser.admin}'
      )`;
  });

  const queryStr = `
           INSERT INTO "user_has_namespace"
           (
            "user_id",
            "namespace_id",
            "admin"
           )
           VALUES
           ${userValues}
           RETURNING id
   `;
  const result = await client.query(queryStr);
  return result.rows;
}

function generateMessages(nb) {
  for (let i = 1; i < nb; i++) {
    const message = {
      user_id: i + 1,
      room_id: getRandomIntInclusive(1, nbRooms),
      data: faker.random.words(getRandomIntInclusive(20, 100)),
      data_type: "text",
      author_name: faker.name.firstName(),
      avatar_author: `/images/1-1671104971815`,
    };

    messages.push(message);
  }
  return messages;
}

async function inserMessages(messages) {
  const values = messages.map((message) => {
    const newUser = pgQuoteEscape(message);
    return `(
          '${newUser.user_id}',
          '${newUser.room_id}',
          '${newUser.data}',
          '${newUser.data_type}',
          '${newUser.author_name}',
          '${newUser.avatar_author}'
      )`;
  });

  const queryStr = `
           INSERT INTO "message"
           (
            "user_id",
            "room_id",
            "data",
            "data_type",
            "author_name",
            "avatar_author"
           )
           VALUES
           ${values}
           RETURNING id
   `;
  const result = await client.query(queryStr);
  return result.rows;
}

function generateFriends(nb) {
  for (let i = 1; i < nb; i++) {
    const friend = {
      user1_id: getRandomIntInclusive(1, nb),
      user2_id: getRandomIntInclusive(1, nb),
    };

    friends.push(friend);
  }
  return friends;
}

async function insertFriends(friends) {
  const friendValues = friends.map((friend) => {
    const newFriends = pgQuoteEscape(friend);
    return `(
          '${newFriends.user1_id}',
          '${newFriends.user2_id}'
      )`;
  });

  const queryStr = `
           INSERT INTO "friend"
           (
            "user1_id",
            "user2_id"
           )
           VALUES
           ${friendValues}
           RETURNING id
   `;
  const result = await client.query(queryStr);
  return result.rows;
}

// function generatePrivateMessages(nb) {
//   for (let i = 1; i < nb; i++) {
//     randomName = names[getRandomIntInclusive(0, names.length)];
//     const messages = {
//       data: faker.random.words(30),
//       data_type: "text",
//       private_room_id: getRandomIntInclusive(1, nbPrivateRoom),
//       user_id: getRandomIntInclusive(1, 2),
//       author_name: randomName,
//       avatar_author: "a",
//     };
//
//     privateMessages.push(messages);
//   }
//   return privateMessages;
// }

// async function insertPrivateMessages(privateMessages) {
//   const privateMessagesValues = privateMessages.map((message) => {
//     const newPrivateMessages = pgQuoteEscape(message);
//     return `(
//           '${newPrivateMessages.data}',
//           '${newPrivateMessages.data_type}',
//           '${newPrivateMessages.private_room_id}',
//           '${newPrivateMessages.user_id}',
//           '${newPrivateMessages.author_name}',
//           '${newPrivateMessages.avatar_author}'
//       )`;
//   });
//
//   const queryStr = `
//            INSERT INTO "private_message"
//            (
//             "data",
//             "data_type",
//             "private_room_id",
//             "user_id",
//             "author_name",
//             "avatar_author"
//            )
//            VALUES
//            ${privateMessagesValues}
//            RETURNING id
//    `;
//   const result = await client.query(queryStr);
//   return result.rows;
// }

(async () => {
  generateNames(nbUsers);
  console.log("1");
  generateUsers(nbUsers);
  console.log("2");

  // generateFriends(nbUsers);
  generateNamespaces(nbNamespaces);
  console.log("3");

  generateRooms(nbRooms);
  console.log("4");

  generateMessages(nbMessages);
  console.log("5");

  generateUserHasNamespace(nbUserHasNamespace);
  console.log("6");

  // const friendData = await insertFriends(friends);
  const userData = await insertUsers(users);
  console.log("7");

  const namespaceData = await insertNamespaces(namespaces);
  console.log("8");

  const roomData = await insertRooms(rooms);
  console.log("9");

  const userNsData = await insertUserHasNamespace(namespaceUsers);
  console.log("10");

  const messageData = await inserMessages(messages);
  console.log("11");

  // generatePrivateMessages(nbMessages);
  // const privateMessagesData = await insertPrivateMessages(privateMessages);
})();
