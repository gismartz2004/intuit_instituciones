import { Client } from 'pg';

const connectionString = "postgresql://neondb_owner:npg_8DLHWINgfYS3@ep-holy-scene-ad71wis8-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

async function updateResourcesTable() {
    const client = new Client({ connectionString });
    try {
        await client.connect();
        console.log('CONNECTED TO NEON CLOUD DB');

        console.log('Checking for missing columns in recursos table...');
        const { rows: columns } = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'recursos';
        `);

        const existingColumns = columns.map(c => c.column_name);
        console.log('Existing columns:', existingColumns.join(', '));

        if (!existingColumns.includes('carpeta')) {
            console.log('Adding "carpeta" column...');
            await client.query('ALTER TABLE recursos ADD COLUMN carpeta VARCHAR(255);');
            console.log('SUCCESS: Column "carpeta" added.');
        } else {
            console.log('INFO: "carpeta" column already exists.');
        }

        // Double check for professor_id casing just in case
        if (!existingColumns.includes('profesor_id') && existingColumns.includes('profesorid')) {
            console.log('Renaming profesorid to profesor_id...');
            await client.query('ALTER TABLE recursos RENAME COLUMN profesorid TO profesor_id;');
            console.log('SUCCESS: Column renamed.');
        }

    } catch (err) {
        console.error('FATAL ERROR:', err.message);
    } finally {
        await client.end();
        console.log('--- DONE ---');
    }
}

updateResourcesTable();
