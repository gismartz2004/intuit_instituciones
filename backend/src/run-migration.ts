import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

async function runMigration() {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
        console.error('❌ DATABASE_URL not found in environment variables');
        console.error('Please make sure you have a .env file with DATABASE_URL set');
        process.exit(1);
    }

    console.log('🔌 Connecting to database...');
    console.log('Using:', connectionString.includes('@ep-') ? 'NEON DB (Cloud)' : 'Local DB');

    const pool = new Pool({ connectionString });

    try {
        const migrationPath = path.join(__dirname, '../migrations/001_create_gamification_tables.sql');
        const sql = fs.readFileSync(migrationPath, 'utf8');

        console.log('📝 Running migration: 001_create_gamification_tables.sql');
        await pool.query(sql);

        console.log('✅ Migration completed successfully!');
        console.log('');
        console.log('Created tables:');
        console.log('  - misiones');
        console.log('  - progreso_misiones');
        console.log('');
        console.log('Inserted default data:');
        console.log('  - 5 default missions');
        console.log('  - 6 default achievements');

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

runMigration();
