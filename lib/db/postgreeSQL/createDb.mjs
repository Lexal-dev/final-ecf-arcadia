import pg from 'pg'; // Importation correcte pour les modules CommonJS
import dotenv from 'dotenv';

dotenv.config();

const { DATABASE_URL } = process.env;

const connectToDatabase = async () => {
    const client = new pg.Client({
        connectionString: DATABASE_URL,
        ssl: {
            rejectUnauthorized: false // Pour les environnements de développement, vous pouvez aussi utiliser `true` si le certificat est valide
        }
    });

    try {
        await client.connect();
        console.log('Connecté à la base de données PostgreSQL');
        return client;
    } catch (error) {
        console.error('Erreur lors de la connexion à la base de données:', error);
        throw error;
    }
};

const createTables = async (client) => {
    const queries = [
        `CREATE TABLE IF NOT EXISTS services (
            id SERIAL PRIMARY KEY,
            name VARCHAR(30) UNIQUE NOT NULL,
            description VARCHAR(150) NOT NULL
        );`,
        `CREATE TABLE IF NOT EXISTS avis (
            id SERIAL PRIMARY KEY,
            pseudo VARCHAR(30) NOT NULL,
            comment VARCHAR(150) NOT NULL,
            "isValid" BOOLEAN NOT NULL DEFAULT FALSE
        );`,
        `CREATE TABLE IF NOT EXISTS hours (
            id SERIAL PRIMARY KEY,
            days VARCHAR(255) NOT NULL,
            open VARCHAR(10) NOT NULL,
            close VARCHAR(10) NOT NULL
        );`,
        `CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role VARCHAR(50) NOT NULL DEFAULT 'USER'
        );`,
        `CREATE TABLE IF NOT EXISTS species (
            id SERIAL PRIMARY KEY,
            name VARCHAR(50) UNIQUE NOT NULL CHECK (char_length(name) BETWEEN 3 AND 50)
        );`,
        `CREATE TABLE IF NOT EXISTS habitats (
            id SERIAL PRIMARY KEY,
            name VARCHAR(30) UNIQUE NOT NULL CHECK (char_length(name) BETWEEN 3 AND 30),
            description VARCHAR(200) NOT NULL CHECK (char_length(description) BETWEEN 3 AND 200),
            comment TEXT CHECK (char_length(comment) BETWEEN 3 AND 100),
            "imageUrl" JSON
        );`,
        `CREATE TABLE IF NOT EXISTS animals (
            id SERIAL PRIMARY KEY,
            name VARCHAR(30) UNIQUE NOT NULL CHECK (char_length(name) BETWEEN 3 AND 30),
            etat VARCHAR(100) NOT NULL CHECK (char_length(etat) BETWEEN 3 AND 100),
            "specieId" INTEGER REFERENCES species(id) ON DELETE SET NULL,
            "habitatId" INTEGER REFERENCES habitats(id) ON DELETE SET NULL,
            "imageUrl" JSON
        );`,
        `CREATE TABLE IF NOT EXISTS "vetLogs" (
            id SERIAL PRIMARY KEY,
            "animalState" VARCHAR(100) NOT NULL,
            "foodOffered" VARCHAR(50) NOT NULL,
            "foodWeight" FLOAT NOT NULL CHECK ("foodWeight" > 0),
            "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "animalId" INTEGER NOT NULL,
            FOREIGN KEY ("animalId") REFERENCES animals(id)
        );`,
        `CREATE TABLE IF NOT EXISTS "reports" (
            id SERIAL PRIMARY KEY,
            food VARCHAR(255) NOT NULL,
            quantity INTEGER NOT NULL CHECK (quantity > 0),
            "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "animalId" INTEGER NOT NULL,
            FOREIGN KEY ("animalId") REFERENCES animals(id)
        );`
    ];

    try {
        for (const query of queries) {
            await client.query(query);
        }
        console.log('Tables créées avec succès');
    } catch (error) {
        console.error('Erreur lors de la création des tables:', error);
        throw error;
    }
};

const runSetup = async () => {
    let client;

    try {
        client = await connectToDatabase();

        // Créer les tables
        await createTables(client);

    } catch (error) {
        console.error('Erreur lors de l\'exécution du setup:', error);
    } finally {
        if (client) {
            await client.end();
            console.log('Connexion à la base de données fermée');
        }
    }
};

runSetup();