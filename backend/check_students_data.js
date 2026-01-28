
const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

async function checkStudents() {
    await client.connect();
    try {
        const users = await client.query('SELECT id, nombre, email, "roleId" FROM usuarios WHERE "roleId" = 3');
        console.log('Students:', users.rows);

        const assignments = await client.query('SELECT * FROM asignaciones');
        console.log('Assignments:', assignments.rows);
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

checkStudents();
