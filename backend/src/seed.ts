
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
        { id: 3, nombreRol: 'Estudiante' },
        { id: 4, nombreRol: 'Especialista' },
        { id: 5, nombreRol: 'Profesor Especialización' }
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
    const existingAdmin = await db.select().from(schema.usuarios).where(eq(schema.usuarios.email, adminEmail)).limit(1);

    if (existingAdmin.length === 0) {
        await db.insert(schema.usuarios).values({
            nombre: 'Administrador Principal',
            email: adminEmail,
            password: 'admin',
            roleId: 1,
            planId: 3,
            activo: true
        }).execute();
    }

    // 4. Seed Specialist Professor
    console.log('Seeding Specialist Professor...');
    const specProfEmail = 'profe_tech@edu.com';
    const existingProf = await db.select().from(schema.usuarios).where(eq(schema.usuarios.email, specProfEmail)).limit(1);
    let profId;

    if (existingProf.length === 0) {
        const result = await db.insert(schema.usuarios).values({
            nombre: 'Ing. Cyber Arge',
            email: specProfEmail,
            password: 'admin',
            roleId: 5, // Profesor Especialización
            planId: 3,
            activo: true
        }).returning({ id: schema.usuarios.id }).execute();
        profId = result[0].id;
    } else {
        profId = existingProf[0].id;
    }

    // 5. Seed Specialist Student
    console.log('Seeding Specialist Student...');
    const specStudentEmail = 'specialist@edu.com';
    const existingStudent = await db.select().from(schema.usuarios).where(eq(schema.usuarios.email, specStudentEmail)).limit(1);
    let studentId;

    if (existingStudent.length === 0) {
        const result = await db.insert(schema.usuarios).values({
            nombre: 'Neo Specialist',
            email: specStudentEmail,
            password: 'admin',
            roleId: 4, // Especialista
            planId: 3,
            activo: true
        }).returning({ id: schema.usuarios.id }).execute();
        studentId = result[0].id;
    } else {
        studentId = existingStudent[0].id;
    }

    // 6. Seed Specialized Module
    console.log('Seeding Specialized Module...');
    const existingMod = await db.select().from(schema.modulos).where(eq(schema.modulos.nombreModulo, 'Electrónica Pro')).limit(1);
    let modId;

    if (existingMod.length === 0) {
        const modResult = await db.insert(schema.modulos).values({
            nombreModulo: 'Electrónica Pro',
            duracionDias: 30,
            profesorId: profId,
            categoria: 'specialization'
        }).returning({ id: schema.modulos.id }).execute();
        modId = modResult[0].id;

        // Assign to student
        await db.insert(schema.asignaciones).values({
            estudianteId: studentId,
            profesorId: profId,
            moduloId: modId
        }).execute();

        // Seed levels
        const levels = [
            { moduloId: modId, tituloNivel: 'Lab 1: Circuitos Base', orden: 1 },
            { moduloId: modId, tituloNivel: 'Lab 2: Microcontroladores', orden: 2 },
            { moduloId: modId, tituloNivel: 'Hito Tech: Proyecto IoT', orden: 3 }
        ];

        for (const lvl of levels) {
            const lvlResult = await db.insert(schema.niveles).values(lvl).returning({ id: schema.niveles.id }).execute();
            const levelId = lvlResult[0].id;

            // Unlock for student
            await db.insert(schema.progresoNiveles).values({
                estudianteId: studentId,
                nivelId: levelId,
                porcentajeCompletado: 0,
                completado: false
            }).execute();
        }
    }

    console.log('Seeding complete.');
    process.exit(0);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
