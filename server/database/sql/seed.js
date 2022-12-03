const client = require("../../config/sequelize");
const { faker } = require("@faker-js/faker");
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

const users = [];
const namespaceUsers = [];

function generateUsers(userNb) {
  for (let i = 0; i < userNb; i++) {
    // const random = Math.floor(Math.random() * images.length);

    const user = {
      pseudo: faker.name.firstName(),
      email: faker.random.alphaNumeric(20),
      password: faker.name.middleName(),
      status: faker.name.firstName(),
      avatar_url: `/images/1-1670100468740`,
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

function generateUserHasNamespace(nb) {
  for (let i = 1; i < nb; i++) {
    const user = {
      user_id: i + 1,
      namespace_id: getRandomIntInclusive(1, 1),
      admin: false,
      ban: false,
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
          '${newUser.admin}',
          '${newUser.ban}'
      )`;
  });

  const queryStr = `
           INSERT INTO "user_has_namespace"
           (
            "user_id",
            "namespace_id",
            "admin",
            "ban"
           )
           VALUES
           ${userValues}
           RETURNING id
   `;
  const result = await client.query(queryStr);
  return result.rows;
}

(async () => {
  generateUsers(3500);
  const userData = await insertUsers(users);

  generateUserHasNamespace(2000);
  const userDataTwo = await insertUserHasNamespace(namespaceUsers);
})();
