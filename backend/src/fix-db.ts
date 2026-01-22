
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

async function fix() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        console.error('DATABASE_URL not found');
        process.exit(1);
    }

    const pool = new Pool({ connectionString });

    try {
        console.log('--- Connecting to DB ---');
        await pool.query('ALTER TABLE progreso_misiones ADD COLUMN IF NOT EXISTS semana_inicio timestamp;');
        console.log('✅ Column semana_inicio added (or already exists)');

        // Also ensure misiones table exists with new types
        // Actually, if it's 500ing on missions fetch, it's likely a column mismatch

    } catch (err) {
        console.error('❌ Error fixing DB:', err.message);
    } finally {
        await pool.end();
    }
}

fix();
