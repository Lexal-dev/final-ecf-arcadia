import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const { DATABASE_URL } = process.env;

const connectToDatabase = async () => {
    const client = new Client({
        connectionString: DATABASE_URL,
    });

    try {
        await client.connect();
        console.log('Connecté à PostgreSQL');
        return client;
    } catch (error) {
        console.error('Erreur lors de la connexion à la base de données:', error);
        throw error;
    }
};

const deleteAllTables = async (client) => {
    try {
        // Obtenez la liste de toutes les tables
        const res = await client.query(`
            SELECT tablename 
            FROM pg_tables 
            WHERE schemaname = 'public';
        `);

        const tables = res.rows.map(row => row.tablename);

        // Supprimez chaque table
        for (const table of tables) {
            await client.query(`DROP TABLE IF EXISTS ${table} CASCADE;`);
            console.log(`Table ${table} supprimée avec succès`);
        }
    } catch (error) {
        console.error('Erreur lors de la suppression des tables:', error);
        throw error;
    }
};

const runDelete = async () => {
    let client;

    try {
        client = await connectToDatabase();
        
        // Supprimer toutes les tables
        await deleteAllTables(client);

    } catch (error) {
        console.error('Erreur lors de l\'exécution de la suppression des tables:', error);
    } finally {
        if (client) {
            await client.end();
            console.log('Connexion à la base de données fermée');
        }
    }
};

runDelete();