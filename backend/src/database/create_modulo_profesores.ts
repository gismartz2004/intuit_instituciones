import { Client } from 'pg';

const connectionString = "postgresql://neondb_owner:npg_8DLHWINgfYS3@ep-holy-scene-ad71wis8-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

async function createModuloProfesoresTable() {
    const client = new Client({ connectionString });
    try {
        await client.connect();
        console.log('CONNECTED TO NEON CLOUD DB');

        console.log('Creating modulo_profesores table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS modulo_profesores (
                id SERIAL PRIMARY KEY,
                modulo_id INTEGER REFERENCES modulos(id),
                profesor_id INTEGER REFERENCES usuarios(id),
                fecha_asignacion TIMESTAMP DEFAULT NOW()
            );
        `);

        console.log('SUCCESS: modulo_profesores table created.');

        const { rows } = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';");
        console.log('Current tables in DB:', rows.map(r => r.table_name).filter(t => !t.startsWith('pg_')).join(', '));

    } catch (err) {
        console.error('FATAL ERROR:', err.message);
    } finally {
        await client.end();
        console.log('--- DONE ---');
    }
}

createModuloProfesoresTable();
