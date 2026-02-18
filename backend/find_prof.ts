import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './src/shared/schema';
import * as dotenv from 'dotenv';
import { eq } from 'drizzle-orm';
import * as fs from 'fs';

dotenv.config();

async function findProfessor() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });

    const db = drizzle(pool, { schema });

    console.log('Auditing Sebastian Muñoz...');
    const users = await db.select().from(schema.usuarios).execute();
    const sebastian = users.find(u => u.nombre?.toLowerCase().includes('sebastian') && u.nombre?.toLowerCase().includes('muñoz'));

    if (!sebastian) {
        console.log('Sebastian Muñoz not found.');
        await pool.end();
        return;
    }

    const case1 = await db.select().from(schema.moduloProfesores).where(eq(schema.moduloProfesores.profesorId, sebastian.id)).execute();
    const case2 = await db.select().from(schema.modulos).where(eq(schema.modulos.profesorId, sebastian.id)).execute();
    const case3 = await db.select().from(schema.asignaciones).where(eq(schema.asignaciones.profesorId, sebastian.id)).execute();
    const uniqueModulesFromAsignaciones = [...new Set(case3.map(a => a.moduloId))];

    const checkModules = [13, 18];
    const moduleStatus = await Promise.all(checkModules.map(async (mid) => {
        const refs = await db.select().from(schema.moduloProfesores).where(eq(schema.moduloProfesores.moduloId, mid)).execute();
        return { moduleId: mid, professorCount: refs.length, professors: refs.map(r => r.profesorId) };
    }));

    const result = {
        user: { id: sebastian.id, nombre: sebastian.nombre, email: sebastian.email },
        moduloProfesores: case1,
        modulosOwning: case2.map(m => ({ id: m.id, nombre: m.nombreModulo })),
        asignacionesModuleIds: uniqueModulesFromAsignaciones,
        checkModulesStatus: moduleStatus
    };

    fs.writeFileSync('audit_result.json', JSON.stringify(result, null, 2));
    console.log('Results saved to audit_result.json');

    await pool.end();
}

findProfessor();
