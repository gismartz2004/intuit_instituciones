const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });

async function getAdmin() {
    try {
        await client.connect();
        const res = await client.query("SELECT email, password FROM usuarios WHERE role_id = 1 LIMIT 1");
        console.log(JSON.stringify(res.rows[0]));
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

getAdmin();
