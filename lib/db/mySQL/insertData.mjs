import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const { DATABASEMYSQL_URL } = process.env;
const databaseName = 'final-arcadia';

const connectToDatabase = async (dbName = '') => {
    try {
        // Build the connection configuration URL without the database
        const connectionConfig = {
            uri: DATABASEMYSQL_URL,
            database: dbName ? dbName : undefined
        };

        // Create the connection
        const connection = await mysql.createConnection({
            ...connectionConfig,
            database: dbName
        });

        console.log(`Connected to MySQL database: ${dbName ? dbName : 'initial connection'}`);
        return connection;
    } catch (error) {
        console.error('Error connecting to the database:', error);
        throw error;
    }
};

const insertData = async () => {
    const connection = await connectToDatabase(databaseName);

    try {
        // Insert into services table
        const insertServicesQuery = `
            INSERT INTO services (name, description) VALUES
            ('Nettoyage', 'Services de nettoyage quotidien'),
            ('Nourrissage', 'Nourrir les animaux trois fois par jour')
        `;
        await connection.query(insertServicesQuery);
        console.log("Données insérées dans la table 'services'.");

        // Insert into avis table
        const insertAvisQuery = `
            INSERT INTO avis (pseudo, comment, isValid) VALUES
            ('JeanDupont', 'Service excellent !', true),
            ('MarieDurand', 'Pas satisfaite de la qualité de la nourriture.', false)
        `;
        await connection.query(insertAvisQuery);
        console.log("Données insérées dans la table 'avis'.");

        // Insert into hours table
        const insertHoursQuery = `
            INSERT INTO hours (days, open, close) VALUES
            ('Lundi', '08:30', '19:30'),
            ('Mardi', '08:30', '19:30'),
            ('Mercredi', '08:30', '19:30'),
            ('Jeudi', '08:30', '19:30'),
            ('Vendredi', '08:30', '19:30'),
            ('Samedi', '10:00', '21:30'),
            ('Dimanche', '10:00', '21:30')
        `;
        await connection.query(insertHoursQuery);
        console.log("Données insérées dans la table 'hours'.");

        // Insert into users table
        const insertUsersQuery = `
            INSERT INTO users (email, password, role) VALUES
            ('employe@example.com', '$2a$10$6o12n6qQiqQsopI51EuV8ufd0iraI2wCx7R5iFcBdDMdqi5NXdpJS', 'EMPLOYEE'),
            ('admin@example.com', '$2a$10$W6tzHu1qLynjUZs7VkHsheLSvZnhZLILj/7EAf.28TLg.Ojy99Zwu', 'VETERINARIAN')
        `;
        await connection.query(insertUsersQuery);
        console.log("Données insérées dans la table 'users'.");

        // Insert into species table
        const insertSpeciesQuery = `
            INSERT INTO species (name) VALUES
            ('Lion'),
            ('Crocodile'),
            ('Renard'),
            ('Tigre')
        `;
        await connection.query(insertSpeciesQuery);
        console.log("Données insérées dans la table 'species'.");

        // Insert into habitats table (without imageUrl)
        const insertHabitatsQuery = `
            INSERT INTO habitats (name, description, comment) VALUES
            ('Savane', 'Habitat de prairie ouverte', 'Idéal pour les lions.'),
            ('Marais', 'Zone boueuse', 'Idéal pour les crocodiles.'),
            ('Prairie', 'Plaine luxuriante', 'Idéal pour les renards.'),
            ('Jungle', 'Forêt humide', 'Idéal pour les tigres.')
        `;
        await connection.query(insertHabitatsQuery);
        console.log("Données insérées dans la table 'habitats'.");

        // Insert into animals table (without imageUrl)
        const insertAnimalsQuery = `
            INSERT INTO animals (name, etat, specieId, habitatId) VALUES
            ('Simba', 'En bonne santé', 1, 1),
            ('Croc', 'En bonne santé', 2, 2),
            ('Renard', 'En bonne santé', 3, 3),
            ('Tigre', 'En bonne santé', 4, 4)
        `;
        await connection.query(insertAnimalsQuery);
        console.log("Données insérées dans la table 'animals'.");

        // Insert into vetLogs table
        const insertVetLogsQuery = `
            INSERT INTO vetLogs (animalState, foodOffered, foodWeight, createdAt, updatedAt, animalId) VALUES
            ('Bon', 'Nourriture sèche', 250, NOW(), NOW(), 1),
            ('Mauvais', 'Nourriture humide', 350, NOW(), NOW(), 2)
        `;
        await connection.query(insertVetLogsQuery);
        console.log("Données insérées dans la table 'vetLogs'.");

        // Insert into reports table
        const insertReportsQuery = `
            INSERT INTO reports (food, quantity, createdAt, animalId) VALUES
            ('Nourriture sèche', 500, NOW(), 1),
            ('Nourriture humide', 350, NOW(), 2)
        `;
        await connection.query(insertReportsQuery);
        console.log("Données insérées dans la table 'reports'.");

    } catch (error) {
        console.error('Erreur lors de l\'insertion des données :', error);
    } finally {
        await connection.end();
        console.log('Connexion fermée');
    }
};

const runSetup = async () => {
    let connection;

    try {
        connection = await connectToDatabase(databaseName);

        // Once the database is created, insert the data
        await insertData();

    } catch (error) {
        console.error('Erreur lors de l\'exécution de la configuration :', error);
    } finally {
        if (connection) {
            await connection.end();
            console.log('Connexion à la base de données fermée');
        }
    }
};

runSetup();