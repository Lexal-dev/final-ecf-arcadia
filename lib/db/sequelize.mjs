import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const database = process.env.PGDATABASE;
const username = process.env.PGUSER;
const password = process.env.PGPASSWORD || undefined;
const host = process.env.PGHOST;
const port = Number(process.env.PGPORT) || 5432;

if (!database || !username || !host) {
    throw new Error('Missing required environment variables for database connection');
}

const sequelizeInstance = new Sequelize(database, username, password, {
    host: host,
    port: port,
    dialect: 'postgres',
    dialectModule: pg,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    }
});

// Fonction pour créer la base de données si elle n'existe pas
async function createDatabaseIfNotExists(databaseName) {
    const tempSequelize = new Sequelize('', username, password, {
        host: host,
        port: port,
        dialect: 'postgres',
        dialectModule: pg,
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        }
    });

    try {
        await tempSequelize.query(`CREATE DATABASE "${databaseName}"`);
        console.log(`Database ${databaseName} created successfully.`);
    } catch (error) {
        if (error.name === 'SequelizeDatabaseError' && error.message.includes('already exists')) {
            console.log(`Database ${databaseName} already exists.`);
        } else {
            console.error('Error creating database:', error);
            throw error;
        }
    } finally {
        await tempSequelize.close();
    }
}

async function connectToDatabase() {
    try {
        await sequelizeInstance.authenticate();
        console.log('Connection has been established successfully.');
        await sequelizeInstance.sync({ force: false });
        console.log('Database synchronized.');
    } catch (error) {
        console.error('Unable to connect to the database:', error.message);

        if (error.name === 'SequelizeConnectionError' && error.parent && error.parent.code === '3D000') {
            try {
                await createDatabaseIfNotExists(database);
                await sequelizeInstance.authenticate();
                console.log('Connection re-established successfully.');
            } catch (createError) {
                console.error('Error creating database:', createError.message);
            }
        }
    }
}

connectToDatabase().catch(err => {
    console.error('Failed to synchronize database:', err);
});

export default sequelizeInstance;