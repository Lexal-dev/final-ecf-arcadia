import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const { DATABASEMYSQL_URL } = process.env;
const databaseName = 'final-arcadia';

const connectToDatabase = async (dbName = '') => {
    try {
        // Create the connection
        const connection = await mysql.createConnection({
            uri: DATABASEMYSQL_URL,
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
            ('Petit train', 'Visite autour du parc.'),
            ('Guide audio', "Permet d'obtenir des informations sur l'habitat et ses habitants"),
            ('Restauration', "Plusieurs stands pour se ravitailler ainsi qu'un restaurant");
        `;
        await connection.query(insertServicesQuery);
        console.log("Données insérées dans la table 'services'.");

        // Insert into avis table
        const insertAvisQuery = `
            INSERT INTO avis (pseudo, comment, isValid) VALUES
            ('Frédéric', 'Juste ouah!', true),
            ('Jeanette', 'Pas satisfaite de la qualité de la nourriture.', false),
            ('Michel', 'Service excellent !', true),
            ('Félicitin', 'Incroyable tour de train.', true);
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
            ('Dimanche', '10:00', '21:30');
        `;
        await connection.query(insertHoursQuery);
        console.log("Données insérées dans la table 'hours'.");

        // Insert into users table
        const insertUsersQuery = `
            INSERT INTO users (email, password, role) VALUES
            ('employee@example.com', '$2a$10$6o12n6qQiqQsopI51EuV8ufd0iraI2wCx7R5iFcBdDMdqi5NXdpJS', 'EMPLOYEE'),
            ('veterinarian@example.com', '$2a$10$7t75hrXZ6.1c8BiPT8fNeeAUkPfs0.uh.GIg6cJFCw/RxpvQDXyye', 'VETERINARIAN'),
            ('admin@example.com', '$2a$10$i/nZBhgLTJ3Hl44JPqHvQeG/5WyFMWN4huv73/l1vfkVbUa2OLK0O', 'ADMIN');
        `;
        await connection.query(insertUsersQuery);
        console.log("Données insérées dans la table 'users'.");

        // Insert into species table
        const insertSpeciesQuery = `
            INSERT INTO species (name) VALUES
            ('Lion'),
            ('Crocodile'),
            ('Tigre');
        `;
        await connection.query(insertSpeciesQuery);
        console.log("Données insérées dans la table 'species'.");

        // Insert into habitats table (without imageUrl)
        const insertHabitatsQuery = `
            INSERT INTO habitats (name, description, comment) VALUES
            ('Savane', 'Aride', 'En bon état.'),
            ('Marais', 'Zone boueuse', "Revoir la propreté de l'eau"),
            ('Jungle', "Humide et remplis d'arbre", 'En bon état');
        `;
        await connection.query(insertHabitatsQuery);
        console.log("Données insérées dans la table 'habitats'.");

        // Insert into animals table (without imageUrl)
        const insertAnimalsQuery = `
            INSERT INTO animals (name, etat, specieId, habitatId) VALUES
            ('Simba', 'En bonne santé', 1, 1),
            ('Croc', 'En bonne santé', 2, 2),
            ('Tiger', 'En bonne santé', 3, 3);
        `;
        await connection.query(insertAnimalsQuery);
        console.log("Données insérées dans la table 'animals'.");

        // Insert into vetLogs table
        const insertVetLogsQuery = `
        INSERT INTO vetLogs (animalState, foodOffered, foodWeight, createdAt, updatedAt, animalId) VALUES
        ('En parfaite santé', 'Chevreuil', 400, '2024-07-01', '2024-07-02', 1),
        ('Peut-être un début de maladie', 'Lapin', 500, '2024-06-01', '2024-06-02', 2),
        ('En parfaite santé', 'Poussin', 300, '2024-05-01', '2024-05-02', 3),
        ('En parfaite santé', 'Chevreuil', 400, '2024-08-01', '2024-08-02', 1),
        ('Peut-être un début de maladie', 'Lapin', 500, '2024-07-01', '2024-07-02', 2),
        ('En parfaite santé', 'Poussin', 300, '2024-06-01', '2024-06-02', 3),
        ('En parfaite santé', 'Chevreuil', 400, '2024-09-01', '2024-09-02', 1),
        ('Peut-être un début de maladie', 'Lapin', 500, '2024-08-01', '2024-08-02', 2),
        ('En parfaite santé', 'Poussin', 300, '2024-07-01', '2024-07-02', 3);
        `;
        await connection.query(insertVetLogsQuery);
        console.log("Données insérées dans la table 'vetLogs'.");

        // Insert into reports table
        const insertReportsQuery = `
            INSERT INTO reports (food, quantity, createdAt, animalId) VALUES
            -- Pour l'animal avec ID 1 (Simba)
            ('Chevreuil', 400, '2024-07-15', 1),
            ('Chevreuil', 420, '2024-08-15', 1),
            ('Chevreuil', 430, '2024-09-15', 1),

            -- Pour l'animal avec ID 2 (Croc)
            ('Lapin', 500, '2024-06-15', 2),
            ('Lapin', 510, '2024-07-15', 2),
            ('Lapin', 520, '2024-08-15', 2),

            -- Pour l'animal avec ID 3 (Tiger)
            ('Poussin', 300, '2024-05-15', 3),
            ('Poussin', 310, '2024-06-15', 3),
            ('Poussin', 320, '2024-07-15', 3);
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