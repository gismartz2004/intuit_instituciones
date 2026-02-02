
const { Client } = require('pg');

const connectionString = "postgresql://neondb_owner:npg_8DLHWINgfYS3@ep-holy-scene-ad71wis8-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require";

const client = new Client({
    connectionString: connectionString,
    ssl: {
        rejectUnauthorized: false
    }
});

async function checkColumns() {
    await client.connect();
    const res = await client.query(`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'plantillas_pim';
  `);
    console.log('COLUMNS_START');
    console.log(JSON.stringify(res.rows.map(r => r.column_name)));
    console.log('COLUMNS_END');
    await client.end();
}

checkColumns().catch(err => console.error(err));
