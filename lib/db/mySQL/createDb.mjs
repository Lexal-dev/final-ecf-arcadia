import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const databaseUrl = process.env.DATABASEMYSQL_URL;

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
            );`
        ];

        for (const query of queries) {
            await connection.query(query);
        }

        console.log(`Tables créées avec succès dans la base de données ${name}`);
    } catch (error) {
        console.error('Erreur lors de la création des tables:', error);
        throw error;
    }
};

const deleteDatabaseAndTables = async (name, connection) => {
    try {
        // Supprime les tables seulement si la base de données existe
        await connection.query(`USE \`${name}\`;`);
        await connection.query('DROP TABLE IF EXISTS avis;');
        await connection.query(`DROP DATABASE IF EXISTS \`${name}\`;`);
        console.log(`Base de données ${name} et tables supprimées avec succès`);
    } catch (error) {
        if (error.code === 'ER_BAD_DB_ERROR') {
            console.log(`La base de données ${name} n'existe pas encore, pas besoin de la supprimer.`);
        } else {
            console.error('Erreur lors de la suppression de la base de données et des tables:', error);
            throw error;
        }
    }
};

const runSetup = async () => {
    const databaseName = 'final-arcadia'; // Spécifiez un nom de base de données ici
    let connection;

    try {
        connection = await connectToDatabase();

        // Supprimer la base de données existante et ses tables (si nécessaire)
        await deleteDatabaseAndTables(databaseName, connection);

        // Créer la base de données et les tables
        await createDatabaseAndTables(connection, databaseName);

    } catch (error) {
        console.error('Erreur lors de l\'exécution du setup:', error);
    } finally {
        if (connection) {
            await connection.end();
            console.log('Connexion à la base de données fermée');
        }
    }
};

runSetup();