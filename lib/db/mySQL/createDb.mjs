import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

// Vérifiez les variables d'environnement
const database = process.env.DEV_DB_DATABASE;
console.log("DATABASE:", database);
const username = process.env.DEV_DB_USER;
console.log("USER:", username);
const password = "Thewyneur67";
console.log("PASSWORD:", password);
const host = "localhost";
console.log("HOST:", host);
const port = Number(process.env.DEV_DB_PORT) || 3306;

if (!database || !username || !password || !host || !port) {
  throw new Error(
    "Missing required environment variables for database connection"
  );
}

const sequelizeInstance = new Sequelize(database, username, password, {
  host: host,
  port: port,
  dialect: "mysql",
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
sequelizeInstance.q;
const createDatabaseAndTables = async (sequelizeInstance, name) => {
  try {
    await sequelizeInstance.query(`CREATE DATABASE IF NOT EXISTS \`${name}\`;`);
    console.log(`Base de données ${name} créée ou existante`);
    await sequelizeInstance.query(`USE \`${name}\`;`);

    // Crée les tables
    const queries = [
      `CREATE TABLE IF NOT EXISTS services (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(30) UNIQUE NOT NULL,
                description VARCHAR(150) NOT NULL
            );`,
      `CREATE TABLE IF NOT EXISTS avis (
                id INT AUTO_INCREMENT PRIMARY KEY,
                pseudo VARCHAR(30) NOT NULL,
                comment VARCHAR(150) NOT NULL,
                isValid BOOLEAN NOT NULL DEFAULT FALSE
            );`,
      `CREATE TABLE IF NOT EXISTS hours (
                id INT AUTO_INCREMENT PRIMARY KEY,
                days VARCHAR(255) NOT NULL,
                open VARCHAR(10) NOT NULL,
                close VARCHAR(10) NOT NULL
            );`,
      `CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role VARCHAR(50) NOT NULL DEFAULT 'USER'
            );`,
      `CREATE TABLE IF NOT EXISTS species (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(50) UNIQUE NOT NULL CHECK (CHAR_LENGTH(name) BETWEEN 3 AND 50)
            );`,
      `CREATE TABLE IF NOT EXISTS habitats (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(30) UNIQUE NOT NULL CHECK (CHAR_LENGTH(name) BETWEEN 3 AND 30),
                description VARCHAR(200) NOT NULL CHECK (CHAR_LENGTH(description) BETWEEN 3 AND 200),
                comment TEXT CHECK (CHAR_LENGTH(comment) BETWEEN 3 AND 100),
                imageUrl JSON
            );`,
      `CREATE TABLE IF NOT EXISTS animals (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(30) UNIQUE NOT NULL CHECK (CHAR_LENGTH(name) BETWEEN 3 AND 30),
                etat VARCHAR(100) NOT NULL CHECK (CHAR_LENGTH(etat) BETWEEN 3 AND 100),
                specieId INT,
                habitatId INT,
                imageUrl JSON,
                FOREIGN KEY (specieId) REFERENCES species(id) ON DELETE SET NULL,
                FOREIGN KEY (habitatId) REFERENCES habitats(id) ON DELETE SET NULL
            );`,
      `CREATE TABLE IF NOT EXISTS vetLogs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                animalState VARCHAR(100) NOT NULL,
                foodOffered VARCHAR(50) NOT NULL,
                foodWeight FLOAT NOT NULL CHECK (foodWeight > 0),
                createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                animalId INT NOT NULL,
                FOREIGN KEY (animalId) REFERENCES animals(id)
            );`,
      `CREATE TABLE IF NOT EXISTS reports (
                id INT AUTO_INCREMENT PRIMARY KEY,
                food VARCHAR(255) NOT NULL,
                quantity INT NOT NULL CHECK (quantity > 0),
                createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                animalId INT NOT NULL,
                FOREIGN KEY (animalId) REFERENCES animals(id)
            );`,
    ];

    for (const query of queries) {
      await connection.query(query);
    }

    console.log(`Tables créées avec succès dans la base de données ${name}`);
  } catch (error) {
    console.error("Erreur lors de la création des tables:", error);
    throw error;
  }
};

const deleteDatabaseAndTables = async (name, sequelizeInstance) => {
  try {
    // First, check if the database exists
    await sequelizeInstance.query(`SHOW DATABASES LIKE '${name}';`);
    await sequelizeInstance.query(`USE \`${name}\`;`);

    // Proceed with dropping tables if needed
    await sequelizeInstance.query("DROP TABLE IF EXISTS avis;");
    await sequelizeInstance.query(`DROP DATABASE IF EXISTS \`${name}\`;`);
    console.log(`Base de données ${name} et tables supprimées avec succès`);
  } catch (error) {
    console.error(
      "Erreur lors de la suppression de la base de données et des tables:",
      error
    );
    throw error;
  }
};
const runSetup = async () => {
  const databaseName = "final-arcadia"; // Specify the name of the database here
  let sequelizeInstance;

  try {
    // Establish connection to the MySQL database (without specifying the database name)
    sequelizeInstance = await connectToDatabase(""); // Initialize the connection to the server

    // Ensure the database exists and switch to it
    await sequelizeInstance.query(
      `CREATE DATABASE IF NOT EXISTS \`${databaseName}\`;`
    );
    console.log(`Database ${databaseName} created or exists.`);

    // Use the newly created database
    await sequelizeInstance.query(`USE \`${databaseName}\`;`);
    console.log(`Now using database ${databaseName}`);

    // Now, delete existing tables if needed and create new ones
    await deleteDatabaseAndTables(databaseName, sequelizeInstance);
    await createDatabaseAndTables(sequelizeInstance, databaseName);

    console.log("Setup completed successfully.");
  } catch (error) {
    console.error("Error during setup execution:", error);
  } finally {
    if (sequelizeInstance) {
      await sequelizeInstance.end(); // Close the connection once done
      console.log("Database connection closed.");
    }
  }
};

runSetup();
