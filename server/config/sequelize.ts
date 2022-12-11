import { Sequelize } from "sequelize";

const sequelize = new Sequelize(process.env.PG_URL as string, {
  define: {
    createdAt: "created_at",
    updatedAt: "updated_at",
  },

  // benchmark: true,
  logging: false,
});

export = sequelize;
