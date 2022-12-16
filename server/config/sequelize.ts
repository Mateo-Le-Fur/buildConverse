import { Sequelize } from "sequelize";

const sequelize = new Sequelize(
  "postgres://chat:MuvzH6712Hg@@localhost/chat" as string,
  {
    define: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },

    // benchmark: true,
    logging: false,
  }
);

export = sequelize;
