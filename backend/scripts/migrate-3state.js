
const postgres = require('postgres');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    console.error('DATABASE_URL not found in .env');
    process.exit(1);
}

const sql = postgres(databaseUrl);

async function run() {
    console.log('Migrating levels to 3-state system...');
    try {
        // 1. Level 1 is always FORCE UNLOCKED (false)
        await sql`UPDATE niveles SET bloqueado_manual = false WHERE orden <= 1;`;
        console.log('[✓] Set Level 1 to Force Unlocked (false).');

        // 2. Existing levels > 1 that are currently 'false' (from previous default) -> change to NULL (Scheduled)
        // This restores the "weekly" behavior for those who haven't been manually tweaked yet.
        await sql`UPDATE niveles SET bloqueado_manual = NULL WHERE orden > 1;`;
        console.log('[✓] Set Levels > 1 to Scheduled (NULL).');

        console.log('Migration to 3-state system successful!');
    } catch (error) {
        console.error('Error during migration:', error);
    } finally {
        await sql.end();
        process.exit(0);
    }
}

run();
