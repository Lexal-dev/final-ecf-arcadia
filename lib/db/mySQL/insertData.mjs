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
            ('Cleaning', 'Daily cleaning services'),
            ('Feeding', 'Feeding the animals three times a day')
        `;
        await connection.query(insertServicesQuery);
        console.log("Data inserted into 'services' table.");

        // Insert into avis table
        const insertAvisQuery = `
            INSERT INTO avis (pseudo, comment, isValid) VALUES
            ('JohnDoe', 'Excellent service!', true),
            ('JaneDoe', 'Not satisfied with the food quality.', false)
        `;
        await connection.query(insertAvisQuery);
        console.log("Data inserted into 'avis' table.");

        // Insert into hours table
        const insertHoursQuery = `
            INSERT INTO hours (days, open, close) VALUES
            ('Monday', '08:30', '19:30'),
            ('Tuesday', '08:30', '19:30'),
            ('Wednesday', '08:30', '19:30'),
            ('Thursday', '08:30', '19:30'),
            ('Friday', '08:30', '19:30'),
            ('Saturday', '10:00', '21:30'),
            ('Sunday', '10:00', '21:30')
        `;
        await connection.query(insertHoursQuery);
        console.log("Data inserted into 'hours' table.");

        // Insert into users table
        const insertUsersQuery = `
            INSERT INTO users (email, password, role) VALUES
            ('employee@example.com', '$2a$10$6o12n6qQiqQsopI51EuV8ufd0iraI2wCx7R5iFcBdDMdqi5NXdpJS', 'EMPLOYEE'),
            ('admin@example.com', '$2a$10$W6tzHu1qLynjUZs7VkHsheLSvZnhZLILj/7EAf.28TLg.Ojy99Zwu', 'VETERINARIAN')
        `;
        await connection.query(insertUsersQuery);
        console.log("Data inserted into 'users' table.");

        // Insert into species table
        const insertSpeciesQuery = `
            INSERT INTO species (name) VALUES
            ('Lion'),
            ('Crocodile'),
            ('Red Fox'),
            ('Tiger')
        `;
        await connection.query(insertSpeciesQuery);
        console.log("Data inserted into 'species' table.");

        // Insert into habitats table (without imageUrl)
        const insertHabitatsQuery = `
            INSERT INTO habitats (name, description, comment) VALUES
            ('Savannah', 'Open prairie habitat', 'Ideal for lions.'),
            ('Marsh', 'Muddy area', 'Ideal for crocodiles.'),
            ('Prairie', 'Lush plain', 'Ideal for red foxes.'),
            ('Jungle', 'Wet forest', 'Ideal for tigers.')
        `;
        await connection.query(insertHabitatsQuery);
        console.log("Data inserted into 'habitats' table.");

        // Insert into animals table (without imageUrl)
        const insertAnimalsQuery = `
            INSERT INTO animals (name, etat, specieId, habitatId) VALUES
            ('Simba', 'Healthy', 1, 1),
            ('Croc', 'Healthy', 2, 2),
            ('Fox', 'Healthy', 3, 3),
            ('Tiger', 'Healthy', 4, 4)
        `;
        await connection.query(insertAnimalsQuery);
        console.log("Data inserted into 'animals' table.");

        // Insert into vetLogs table
        const insertVetLogsQuery = `
            INSERT INTO vetLogs (animalState, foodOffered, foodWeight, createdAt, updatedAt, animalId) VALUES
            ('Good', 'Dry food', 250, NOW(), NOW(), 1),
            ('Poor', 'Wet food', 350, NOW(), NOW(), 2)
        `;
        await connection.query(insertVetLogsQuery);
        console.log("Data inserted into 'vetLogs' table.");

        // Insert into reports table
        const insertReportsQuery = `
            INSERT INTO reports (food, quantity, createdAt, animalId) VALUES
            ('Dry food', 500, NOW(), 1),
            ('Wet food', 350, NOW(), 2)
        `;
        await connection.query(insertReportsQuery);
        console.log("Data inserted into 'reports' table.");

    } catch (error) {
        console.error('Error inserting data:', error);
    } finally {
        await connection.end();
        console.log('Connection closed');
    }
};

const runSetup = async () => {
    let connection;

    try {
        connection = await connectToDatabase(databaseName);

        // Once the database is created, insert the data
        await insertData();

    } catch (error) {
        console.error('Error during setup execution:', error);
    } finally {
        if (connection) {
            await connection.end();
            console.log('Database connection closed');
        }
    }
};

runSetup();