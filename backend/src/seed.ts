
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './shared/schema';
import { eq } from 'drizzle-orm';
import * as dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || "postgresql://neondb_owner:npg_6Mlaq1ZKAuTV@ep-lively-firefly-a5q89531-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require",
});

const db = drizzle(pool, { schema });

async function main() {
    console.log('Seeding database...');

    // 1. Seed Roles
    console.log('Seeding Roles...');
    const rolesData = [
        { id: 1, nombreRol: 'Admin' },
        { id: 2, nombreRol: 'Profesor' },
        { id: 3, nombreRol: 'Estudiante' }
    ];

    for (const role of rolesData) {
        await db.insert(schema.roles).values(role).onConflictDoNothing().execute();
    }

    // 2. Seed Planes
    console.log('Seeding Planes...');
    const plansData = [
        { id: 1, nombrePlan: 'Básico', precio: '0.00' },
        { id: 2, nombrePlan: 'Digital', precio: '29.99' },
        { id: 3, nombrePlan: 'Pro', precio: '59.99' }
    ];

    for (const plan of plansData) {
        await db.insert(schema.planes).values(plan).onConflictDoNothing().execute();
    }

    // 3. Seed Admin User
    console.log('Seeding Admin User...');
    const adminEmail = 'admin@edu.com';
    const adminUser = {
        nombre: 'Administrador Principal',
        email: adminEmail,
        password: 'admin', // En producción usar hash
        roleId: 1,
        planId: 3,
        activo: true
    };

    // Check if exists
    const existingUser = await db.select().from(schema.usuarios).where(eq(schema.usuarios.email, adminEmail));

    if (existingUser.length === 0) {
        await db.insert(schema.usuarios).values(adminUser).execute();
        console.log(`User ${adminEmail} created.`);
    } else {
        console.log(`User ${adminEmail} already exists. Updating password/role...`);
        await db.update(schema.usuarios)
            .set({ password: 'admin', roleId: 1, activo: true })
            .where(eq(schema.usuarios.email, adminEmail))
            .execute();
    }

    console.log('Seeding complete.');
    process.exit(0);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
