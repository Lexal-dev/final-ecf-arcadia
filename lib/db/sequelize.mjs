import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';
const database = isProduction ? process.env.PGDATABASE : process.env.DEV_DB_DATABASE;
const username = isProduction ? process.env.PGUSER : process.env.DEV_DB_USERNAME;
const password = isProduction ? process.env.PGPASSWORD : process.env.DEV_DB_PASSWORD || undefined;
const host = isProduction ? process.env.PGHOST : process.env.DEV_DB_HOST;
const port = isProduction ? Number(process.env.PGPORT) : Number(process.env.DEV_DB_PORT) || 5432;

if (!database || !username || !host) {
    throw new Error('Missing required environment variables for database connection');
}

const sequelizeInstance = new Sequelize(database, username, password, {
    host: host,
    port: port,
    dialect: isProduction ? 'postgres' : 'mysql',
    dialectModule: isProduction ? pg : undefined,
    dialectOptions: isProduction ? {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    } : {}
});

async function connectToDatabase() {
    try {
        await sequelizeInstance.authenticate();
        console.log('Connection has been established successfully.');
        await sequelizeInstance.sync({ force: false });
        console.log('Database synchronized.');
    } catch (error) {
        console.error('Unable to connect to the database:', error.message);
    }
}

connectToDatabase().catch(err => {
    console.error('Failed to synchronize database:', err);
});

export default sequelizeInstance;