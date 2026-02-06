
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';

// Connection string
const connectionString = 'postgresql://neondb_owner:npg_8DLHWINgfYS3@ep-holy-scene-ad71wis8-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function verifyMigration() {
    console.log('Verifying migration for Parent Fields...');

    const queryClient = postgres(connectionString);
    const db = drizzle(queryClient);

    try {
        // Query information_schema to check for columns in 'usuarios' table
        const result = await queryClient`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'usuarios' 
            AND column_name IN ('nombre_padre', 'celular_padre', 'trabajo_padre', 'email_padre', 'onboarding_completed');
        `;

        console.log('Found columns:', result);

        const foundColumns = result.map(r => r.column_name);
        const expectedColumns = ['nombre_padre', 'celular_padre', 'trabajo_padre'];

        const allPresent = expectedColumns.every(col => foundColumns.includes(col));

        if (allPresent) {
            console.log('✅ All parent fields are present in the database!');
        } else {
            console.error('❌ Missing columns:', expectedColumns.filter(col => !foundColumns.includes(col)));
        }

    } catch (error) {
        console.error('Verification failed:', error);
    } finally {
        await queryClient.end();
        process.exit(0);
    }
}

verifyMigration();
