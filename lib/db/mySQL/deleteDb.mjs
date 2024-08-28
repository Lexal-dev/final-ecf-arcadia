import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const databaseUrl = process.env.DATABASEMYSQL_URL;

const connectToDatabase = async () => {
    try {
        const connection = await mysql.createConnection(databaseUrl);
        console.log('Connected to MySQL database');
        return connection;
    } catch (error) {
        console.error('Error connecting to the database:', error);
        throw error;
    }
};

const deleteDatabaseAndTables = async (name, connection) => {
    try {
        // Drop the database if it exists
        await connection.query(`DROP DATABASE IF EXISTS \`${name}\`;`);
        console.log(`Database ${name} and all its tables have been dropped successfully`);
    } catch (error) {
        console.error('Error dropping the database and tables:', error);
        throw error;
    }
};

const runDelete = async () => {
    const databaseName = 'final-arcadia';
    let connection;

    try {
        connection = await connectToDatabase();
        
        // Delete the database and all its tables
        await deleteDatabaseAndTables(databaseName, connection);

    } catch (error) {
        console.error('Error during deletion execution:', error);
    } finally {
        if (connection) {
            await connection.end();
            console.log('Database connection closed');
        }
    }
};

runDelete();