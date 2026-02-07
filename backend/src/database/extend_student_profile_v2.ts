import { Client } from 'pg';

const connectionString = "postgresql://neondb_owner:npg_8DLHWINgfYS3@ep-holy-scene-ad71wis8-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

async function extendStudentProfile() {
    const client = new Client({ connectionString });
    try {
        await client.connect();
        console.log('CONNECTED TO NEON CLOUD DB');

        console.log('Adding new personal information columns to usuarios table...');
        await client.query(`
            ALTER TABLE usuarios 
            ADD COLUMN IF NOT EXISTS identificacion VARCHAR(20),
            ADD COLUMN IF NOT EXISTS fecha_nacimiento DATE,
            ADD COLUMN IF NOT EXISTS edad INTEGER,
            ADD COLUMN IF NOT EXISTS institucion VARCHAR(255),
            ADD COLUMN IF NOT EXISTS curso VARCHAR(100);
        `);

        console.log('SUCCESS: New columns added to usuarios table.');

        const { rows } = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'usuarios';");
        console.log('Current columns in usuarios:', rows.map(r => r.column_name).join(', '));

    } catch (err) {
        console.error('FATAL ERROR:', err.message);
    } finally {
        await client.end();
        console.log('--- DONE ---');
    }
}

extendStudentProfile();
