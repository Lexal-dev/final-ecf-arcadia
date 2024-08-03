import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { createAvis } from './initFixture.mjs';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

// Fonction connect db
const connectToDatabase = async (dbName = '') => {
    try {
        const connection = await mysql.createConnection(`${databaseUrl}${dbName}`);
        console.log(`Connecté à la base de données MySQL: ${dbName ? dbName : 'initial connection'}`);
        return connection;
    } catch (error) {
        console.error('Erreur lors de la connexion à la base de données:', error);
        throw error;
    }
};

// Fonction create db
const createDatabaseAndTables = async (name) => {
    let connection;
    try {
        connection = await connectToDatabase();

        const databaseName = name;

        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${databaseName}\`;`);
        console.log(`Base de données ${databaseName} créée ou existante`);

        await connection.end();

        connection = await connectToDatabase(databaseName);

    // USERS
    await connection.query(`
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          email VARCHAR(255) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          role ENUM('EMPLOYEE', 'VETERINARIAN', 'ADMIN') NOT NULL DEFAULT 'EMPLOYEE'
        );
      `);
  
      // HABITATS
      await connection.query(`
        CREATE TABLE IF NOT EXISTS habitats (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(50) NOT NULL UNIQUE,
          description VARCHAR(255),
          comment VARCHAR(255),
          imageUrl JSON
        );
      `);
  
      // SPECIES
      await connection.query(`
        CREATE TABLE IF NOT EXISTS species (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(50) NOT NULL UNIQUE
        );
      `);
  
      // ANIMALS
      await connection.query(`
      CREATE TABLE IF NOT EXISTS animals (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        etat VARCHAR(50),
        imageUrl JSON,
        specieId INT,
        habitatId INT, -- Correct column name
        FOREIGN KEY (specieId) REFERENCES species(id),
        FOREIGN KEY (habitatId) REFERENCES habitats(id)
      );
      `);
    
      //VETLOGS
      await connection.query(`
        CREATE TABLE IF NOT EXISTS vetLogs (
          id INT AUTO_INCREMENT PRIMARY KEY,
          animalId INT NOT NULL,
          animalState VARCHAR(50),
          foodOffered VARCHAR(50),
          foodWeight INT NOT NULL,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (animalId) REFERENCES animals(id)
        );
      `);
  
      // REPORTS
      await connection.query(`
        CREATE TABLE IF NOT EXISTS reports (
          id INT AUTO_INCREMENT PRIMARY KEY,
          animalId INT NOT NULL,
          food VARCHAR(50),
          quantity INT NOT NULL,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (animalId) REFERENCES animals(id)
        );
      `);
  
      // Avis
      await connection.query(`
        CREATE TABLE IF NOT EXISTS avis (
          id INT AUTO_INCREMENT PRIMARY KEY,
          pseudo VARCHAR(50),
          comment VARCHAR(255),
          isValid BOOLEAN DEFAULT FALSE
        );
      `);
  // Hours
      await connection.query(`
        CREATE TABLE IF NOT EXISTS hours (
          id INT AUTO_INCREMENT PRIMARY KEY,
          days VARCHAR(50),
          open VARCHAR(30),
          close VARCHAR(30)
        );
      `);
  // Services
      await connection.query(`
        CREATE TABLE IF NOT EXISTS services (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(50),
          description VARCHAR(255)
        );
      `);

        console.log(`Table 'avis' créée avec succès dans la base de données ${databaseName}`);
    } catch (error) {
        console.error('Erreur lors de la création de la base de données et des tables:', error);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
            console.log('Connexion fermée');
        }
    }
};

// Fonction delete db
const deleteDatabaseAndTables = async (name, connection) => {
    try {
        const databaseName = name;

        await connection.query(`USE \`${databaseName}\`;`);
        await connection.query('DROP TABLE IF EXISTS avis;');
        await connection.query(`DROP DATABASE IF EXISTS \`${databaseName}\`;`);

        console.log(`Base de données ${databaseName} et tables supprimées avec succès`);
    } catch (error) {
        console.error('Erreur lors de la suppression de la base de données et des tables:', error);
        throw error;
    }
};

// Fonction create db + fixture
const createFixture = async () => {
    let connection;
    const databaseName = "final-arcadia";
    try {
        console.log("STARTING");
        connection = await mysql.createConnection(databaseUrl);
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${databaseName}\`;`);

        await connection.query(`USE \`${databaseName}\`;`);

        await deleteDatabaseAndTables(databaseName, connection);
        await createDatabaseAndTables(databaseName);

        connection = await connectToDatabase(databaseName);

        await createAvis(connection);

        await connection.end(); // Fermez la connexion après l'insertion des données
        console.log('END');
    } catch (error) {
        console.error('Erreur dans createFixture :', error);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
        }
        process.exit(0); // Terminez le processus proprement
    }
};

createFixture()
    .then(() => {
        console.log('Fixture créée avec succès.');
    })
    .catch(error => {
        console.error('Erreur lors de l\'exécution de createFixture :', error);
    });