import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { createUsers, createSpecies, createHabitats, createAnimals, createVetLogs, createReport, createAvis, createHours, createServices } from './initFixture.mjs';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

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

const createDatabaseAndTables = async (connection, name) => {
    try {
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${name}\`;`);
        console.log(`Base de données ${name} créée ou existante`);
        await connection.query(`USE \`${name}\`;`);
        
        // Crée les tables
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
              id INT AUTO_INCREMENT PRIMARY KEY,
              email VARCHAR(255) NOT NULL UNIQUE,
              password VARCHAR(255) NOT NULL,
              role ENUM('EMPLOYEE', 'VETERINARIAN', 'ADMIN') NOT NULL DEFAULT 'EMPLOYEE'
            );
        `);
  
        await connection.query(`
            CREATE TABLE IF NOT EXISTS habitats (
              id INT AUTO_INCREMENT PRIMARY KEY,
              name VARCHAR(50) NOT NULL UNIQUE,
              description VARCHAR(255),
              comment VARCHAR(255),
              imageUrl JSON
            );
        `);
  
        await connection.query(`
            CREATE TABLE IF NOT EXISTS species (
              id INT AUTO_INCREMENT PRIMARY KEY,
              name VARCHAR(50) NOT NULL UNIQUE
            );
        `);
  
        await connection.query(`
            CREATE TABLE IF NOT EXISTS animals (
              id INT AUTO_INCREMENT PRIMARY KEY,
              name VARCHAR(50) NOT NULL,
              etat VARCHAR(50),
              imageUrl JSON,
              specieId INT,
              habitatId INT,
              FOREIGN KEY (specieId) REFERENCES species(id),
              FOREIGN KEY (habitatId) REFERENCES habitats(id)
            );
        `);
    
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
  
        await connection.query(`
            CREATE TABLE IF NOT EXISTS avis (
              id INT AUTO_INCREMENT PRIMARY KEY,
              pseudo VARCHAR(50),
              comment VARCHAR(255),
              isValid BOOLEAN DEFAULT FALSE
            );
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS hours (
              id INT AUTO_INCREMENT PRIMARY KEY,
              days VARCHAR(50),
              open VARCHAR(30),
              close VARCHAR(30)
            );
        `);
  
        await connection.query(`
            CREATE TABLE IF NOT EXISTS services (
              id INT AUTO_INCREMENT PRIMARY KEY,
              name VARCHAR(50),
              description VARCHAR(255)
            );
        `);

        console.log(`Tables créées avec succès dans la base de données ${name}`);
    } catch (error) {
        console.error('Erreur lors de la création des tables:', error);
        throw error;
    }
};

const deleteDatabaseAndTables = async (name, connection) => {
    try {
        await connection.query(`USE \`${name}\`;`);
        await connection.query('DROP TABLE IF EXISTS avis;');
        await connection.query(`DROP DATABASE IF EXISTS \`${name}\`;`);
        console.log(`Base de données ${name} et tables supprimées avec succès`);
    } catch (error) {
        console.error('Erreur lors de la suppression de la base de données et des tables:', error);
        throw error;
    }
};

const createFixture = async () => {
    let connection;
    const databaseName = "final-arcadia";
    try {
        console.log("STARTING");
        connection = await connectToDatabase();

        // Supprime la base de données existante et ses tables
        await deleteDatabaseAndTables(databaseName, connection);

        // Crée la base de données et les tables
        await createDatabaseAndTables(connection, databaseName);

        // Insertion des données
        await createUsers(connection);
        const insertedSpecies = await createSpecies(connection);
        const insertedHabitats = await createHabitats(connection);
        const insertedAnimals = await createAnimals(connection, 10, insertedSpecies, insertedHabitats);
        await createVetLogs(connection, 20, insertedAnimals);
        await createReport(connection, 20, insertedAnimals);
        await createAvis(connection);
        await createHours(connection);
        await createServices(connection);

        return {
            insertedSpecies,
            insertedHabitats,
            insertedAnimals
        };
    } catch (error) {
        console.error('Erreur dans createFixture :', error);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
            console.log('Connexion fermée');
        }
    }
};

createFixture()
    .then(() => {
        console.log('END');
    })
    .catch(error => {
        console.error('Erreur lors de l\'exécution de createFixture :', error);
    });