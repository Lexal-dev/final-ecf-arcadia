import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

const database = process.env.DB_DATABASE;
const username = process.env.DB_USERNAME;
const password = process.env.DB_PASSWORD || undefined;
const host = process.env.DB_HOST;
const port = Number(process.env.DB_PORT) || 3306; // Par défaut, le port MySQL est 3306

if (!database || !username || !host) {
    throw new Error('Missing required environment variables for database connection');
}

const sequelizeInstance = new Sequelize(database, username, password, {
    host: host,
    port: port,
    dialect: 'mysql'
});

// Fonction pour créer la base de données si elle n'existe pas
async function createDatabaseIfNotExists(databaseName) {
    try {
        const sequelize = new Sequelize('', username, password, {
            host: host,
            port: port,
            dialect: 'mysql'
        });

        await sequelize.query(`CREATE DATABASE IF NOT EXISTS ${databaseName}`);
        console.log(`Database ${databaseName} created successfully or already exists.`);
    } catch (error) {
        console.error('Error creating database:', error);
        throw error; // Propager l'erreur pour une gestion ultérieure
    }
}

// Fonction pour tenter la connexion
async function connectToDatabase() {
    try {
        await sequelizeInstance.authenticate();
        console.log('Connection has been established successfully.');
        // Si la connexion est réussie, synchroniser les modèles
        await sequelizeInstance.sync({ force: false }); // Utiliser { force: true } pour forcer la création avec perte de données
        console.log('Database synchronized.');
    } catch (error) {
        // En cas d'échec de la connexion
        console.error('Unable to connect to the database:', error.message);
        
        // Vérifier si l'erreur est liée à une base de données inconnue
        if (error.name === 'SequelizeConnectionError' && error.parent && error.parent.code === 'ER_BAD_DB_ERROR') {
            try {
                // Créer la base de données si elle n'existe pas
                await createDatabaseIfNotExists(database);
                // Maintenant, réessayer la connexion
                await sequelizeInstance.authenticate();
                console.log('Connection re-established successfully.');
            } catch (createError) {
                console.error('Error creating database:', createError.message);
            }
        }
    }
}

// Appeler la fonction de connexion
connectToDatabase().catch(err => {
    console.error('Failed to synchronize database:', err);
});

export default sequelizeInstance;