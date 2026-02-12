import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { sql } from 'drizzle-orm';

// Exact DATABASE_URL from .env file
const connectionString = "postgresql://neondb_owner:npg_8DLHWINgfYS3@ep-holy-scene-ad71wis8-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

const pool = new Pool({
    connectionString,
});

const db = drizzle(pool);

async function addEspecializacionColumn() {
    try {
        console.log('Adding especializacion column to usuarios table...');

        await db.execute(sql`ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS especializacion VARCHAR(100);`);

        console.log('✅ Column "especializacion" added successfully!');
    } catch (error) {
        console.error('❌ Error adding column:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

addEspecializacionColumn();
