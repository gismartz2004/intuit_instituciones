import { Client } from 'pg';

const connectionString = 'postgresql://neondb_owner:npg_8DLHWINgfYS3@ep-holy-scene-ad71wis8-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function migrate() {
    const client = new Client({ connectionString });
    await client.connect();

    console.log('--- Starting IMPROVED Professor Assignment Migration ---');

    try {
        const pairsToMigrate = new Set<string>(); // Use set to ensure uniqueness 'moduleId-profId'

        // 1. Get assignments from modulos table (Legacy)
        const { rows: modLegacy } = await client.query('SELECT id, profesor_id FROM modulos WHERE profesor_id IS NOT NULL');
        console.log(`Checking ${modLegacy.length} assignments from modulos table.`);
        modLegacy.forEach(r => pairsToMigrate.add(`${r.id}-${r.profesor_id}`));

        // 2. Get assignments from asignaciones table (Student assignments)
        const { rows: modAssignments } = await client.query('SELECT DISTINCT modulo_id, profesor_id FROM asignaciones WHERE profesor_id IS NOT NULL');
        console.log(`Checking ${modAssignments.length} unique assignments from asignaciones table.`);
        modAssignments.forEach(r => pairsToMigrate.add(`${r.modulo_id}-${r.profesor_id}`));

        console.log(`Total unique assignments to sync: ${pairsToMigrate.size}`);

        for (const pair of pairsToMigrate) {
            const [modId, profId] = pair.split('-').map(Number);

            // 3. Check if the assignment already exists in the join table
            const { rows: existing } = await client.query(
                'SELECT id FROM modulo_profesores WHERE modulo_id = $1 AND profesor_id = $2',
                [modId, profId]
            );

            if (existing.length === 0) {
                // 4. Insert assignment if it doesn't exist
                await client.query(
                    'INSERT INTO modulo_profesores (modulo_id, profesor_id, fecha_asignacion) VALUES ($1, $2, NOW())',
                    [modId, profId]
                );
                console.log(`   + Migrated: Module ${modId} <-> Professor ${profId}`);
            } else {
                console.log(`   - Skipping: Module ${modId} <-> Professor ${profId} (Already exists)`);
            }
        }

        console.log('--- Migration completed successfully ---');

        // 5. Final validation verify counts
        const { rows: finalCount } = await client.query('SELECT count(*) FROM modulo_profesores');
        console.log(`Total assignments in new STAFF table: ${finalCount[0].count}`);

    } catch (err) {
        console.error('Error during migration:', err);
    } finally {
        await client.end();
    }
}

migrate();
