
const { Client } = require('pg');

const connectionString = "postgresql://neondb_owner:npg_8DLHWINgfYS3@ep-holy-scene-ad71wis8-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require";

const client = new Client({
    connectionString: connectionString,
    ssl: {
        rejectUnauthorized: false
    }
});

async function updateDb() {
    await client.connect();
    console.log("Connected to database. Adding columns...");

    try {
        await client.query(`ALTER TABLE plantillas_pim ADD COLUMN IF NOT EXISTS problematica_general TEXT;`);
        console.log("Added problematica_general");

        await client.query(`ALTER TABLE plantillas_pim ADD COLUMN IF NOT EXISTS contexto_problema TEXT;`);
        console.log("Added contexto_problema");

        await client.query(`ALTER TABLE plantillas_pim ADD COLUMN IF NOT EXISTS objetivo_proyecto TEXT;`);
        console.log("Added objetivo_proyecto");

    } catch (e) {
        console.error("Error updating DB:", e);
    } finally {
        await client.end();
    }
}

updateDb().catch(err => console.error(err));
