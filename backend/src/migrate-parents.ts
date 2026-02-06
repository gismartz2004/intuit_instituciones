
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './shared/schema';

// Connection string
const connectionString = 'postgresql://neondb_owner:npg_8DLHWINgfYS3@ep-holy-scene-ad71wis8-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function runMigration() {
    console.log('Starting manual migration for Parent Fields...');

    const sql = postgres(connectionString);
    const db = drizzle(sql, { schema });

    try {
        console.log('Adding nombre_padre column...');
        await sql`ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS nombre_padre varchar(100)`;

        console.log('Adding celular_padre column...');
        await sql`ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS celular_padre varchar(20)`;

        console.log('Adding trabajo_padre column...');
        await sql`ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS trabajo_padre varchar(100)`;

        console.log('Migration completed successfully!');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await sql.end();
        process.exit(0);
    }
}

runMigration();
