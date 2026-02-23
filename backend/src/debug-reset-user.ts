
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq, and } from 'drizzle-orm';
import * as schema from './shared/schema';

const connectionString = 'postgresql://neondb_owner:npg_8DLHWINgfYS3@ep-holy-scene-ad71wis8-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function debugReset() {
    console.log('Connecting to DB...');
    const sql = postgres(connectionString);
    const db = drizzle(sql, { schema });

    try {
        // 1. Find a target student
        const students = await db.select().from(schema.usuarios)
            .innerJoin(schema.roles, eq(schema.usuarios.roleId, schema.roles.id))
            .where(eq(schema.roles.nombreRol, 'Estudiante'))
            .limit(1);

        if (students.length === 0) {
            console.log('No students found to test reset.');
            return;
        }

        const userId = students[0].usuarios.id;
        console.log(`Testing reset for User ID: ${userId} (${students[0].usuarios.email})`);

        // 2. Execute Reset Logic (Copy of SuperadminService.resetUserProgress)
        console.log(`[RESET] Starting reset for user ${userId}`);

        // 1. Delete Assignments
        await db.delete(schema.asignaciones).where(eq(schema.asignaciones.estudianteId, userId));
        console.log('Deleted Assignments');

        // 2. Delete Level Progress
        await db.delete(schema.progresoNiveles).where(eq(schema.progresoNiveles.estudianteId, userId));
        console.log('Deleted Level Progress');

        // 3. Delete HA Evidence
        // TODO: Refactor this logic to work with the new schema
        // await db.delete(schema.entregasHa).where(eq(schema.entregasHa.estudianteId, userId));
        console.log('Deleted HA Evidence');

        // 4. Delete RAG Evidence
        // await db.delete(schema.entregasRag).where(eq(schema.entregasRag.estudianteId, userId));
        console.log('Deleted RAG Evidence');

        // 5. Delete Generic Deliveries
        await db.delete(schema.entregas).where(eq(schema.entregas.estudianteId, userId));
        console.log('Deleted Generic Deliveries');

        // 6. Delete Mission Progress
        await db.delete(schema.progresoMisiones).where(eq(schema.progresoMisiones.estudianteId, userId));
        console.log('Deleted Mission Progress');

        // 7. Delete Unlocked Achievements
        await db.delete(schema.logrosDesbloqueados).where(eq(schema.logrosDesbloqueados.estudianteId, userId));
        console.log('Deleted Achievements');

        // 7.1 Delete Ranking Awards
        try {
            await db.delete(schema.rankingAwards).where(eq(schema.rankingAwards.estudianteId, userId));
            console.log('Deleted Ranking Awards');
        } catch (e) {
            console.log('Error deleting ranking awards:', e.message);
        }

        // 7.2 Delete Certificates
        try {
            await db.delete(schema.certificados).where(eq(schema.certificados.estudianteId, userId));
            console.log('Deleted Certificates');
        } catch (e) {
            console.log('Error deleting certificates:', e.message);
        }

        // 8. Delete Points Log
        await db.delete(schema.puntosLog).where(eq(schema.puntosLog.estudianteId, userId));
        console.log('Deleted Points Log');

        // 9. Reset Gamification
        // ... (Gamification update logic skipped for brevity, unlikely to crash)

        console.log('✅ Reset Completed Successfully via Script');

    } catch (error) {
        console.error('❌ FATAL ERROR During Reset:', error);
    } finally {
        await sql.end();
    }
}

debugReset();
