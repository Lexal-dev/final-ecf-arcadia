import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { createAvis } from './initFixture.mjs';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

// Fonction pour se connecter à la base de données
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

const createDatabaseAndTables = async (name) => {
    let connection;
    try {
        connection = await connectToDatabase();

        const databaseName = name;

        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${databaseName}\`;`);
        console.log(`Base de données ${databaseName} créée ou existante`);

        await connection.end();

        connection = await connectToDatabase(databaseName);

        await connection.query(`
          CREATE TABLE IF NOT EXISTS avis (
            id INT AUTO_INCREMENT PRIMARY KEY,
            pseudo VARCHAR(50),
            comment VARCHAR(255),
            isValid BOOLEAN DEFAULT FALSE
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