import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import pg from "pg";
import mysql2 from "mysql2";

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

// Vérifiez les variables d'environnement
const database = isProduction
  ? process.env.PGDATABASE
  : process.env.DEV_DB_DATABASE;
console.log("DATABASE:", database);
const username = isProduction ? process.env.PGUSER : process.env.DEV_DB_USER;
console.log("USER:", username);
const password = isProduction
  ? process.env.PGPASSWORD
  : process.env.DEV_DB_PASSWORD;
console.log("PASSWORD:", password);
const host = isProduction ? process.env.PGHOST : process.env.DEV_DB_HOST;
console.log("HOST:", host);
const port = isProduction
  ? Number(process.env.PGPORT)
  : Number(process.env.DEV_DB_PORT) || 3306; // Assurez-vous d'avoir un port pour MySQL (3306 par défaut)

if (!database || !username || !password || !host || !port) {
  throw new Error(
    "Missing required environment variables for database connection"
  );
}

const sequelizeInstance = new Sequelize(database, username, password, {
  host: host,
  port: port,
  dialect: isProduction ? "postgres" : "mysql",
  dialectModule: isProduction ? pg : mysql2,
  dialectOptions: isProduction
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      }
    : {},
});

async function connectToDatabase() {
  try {
    await sequelizeInstance.authenticate();
    console.log("Connection has been established successfully.");
    await sequelizeInstance.sync({ force: false });
    console.log("Database synchronized.");
  } catch (error) {
    console.error("Unable to connect to the database:", error.message);
  }
}

connectToDatabase().catch((err) => {
  console.error("Failed to synchronize database:", err);
});

export default sequelizeInstance;
