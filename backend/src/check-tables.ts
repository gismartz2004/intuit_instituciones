
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// Connection string (Neon DB)
const connectionString = 'postgresql://neondb_owner:npg_8DLHWINgfYS3@ep-holy-scene-ad71wis8-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function checkTables() {
    console.log('Checking database tables...');

    const sql = postgres(connectionString);

    try {
        const tables = await sql`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `;

        console.log('Existing tables:');
        tables.forEach(t => console.log(`- ${t.table_name}`));

        const requiredTables = ['ranking_awards', 'certificados', 'puntos_log', 'usuarios'];
        const missing = requiredTables.filter(rt => !tables.some(t => t.table_name === rt));

        if (missing.length > 0) {
            console.error('❌ Missing tables:', missing);
        } else {
            console.log('✅ All required tables present.');
        }

    } catch (error) {
        console.error('Verification failed:', error);
    } finally {
        await sql.end();
        process.exit(0);
    }
}

checkTables();
