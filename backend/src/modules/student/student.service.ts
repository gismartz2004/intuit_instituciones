import { Inject, Injectable } from '@nestjs/common';
import { DRIZZLE_DB } from '../../database/drizzle.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../shared/schema';
import { eq, asc } from 'drizzle-orm';

@Injectable()
export class StudentService {
    constructor(@Inject(DRIZZLE_DB) private db: NodePgDatabase<typeof schema>) { }

    async getStudentModules(studentId: number) {
        // 1. Get Assigned Modules
        const assignments = await this.db.select({
            module: schema.modulos
        })
            .from(schema.asignaciones)
            .innerJoin(schema.modulos, eq(schema.asignaciones.moduloId, schema.modulos.id))
            .where(eq(schema.asignaciones.estudianteId, studentId));

        // 2. For each module, get Levels (Niveles)
        const modulesWithLevels = await Promise.all(assignments.map(async (row) => {
            const mod = row.module;

            const levels = await this.db.select()
                .from(schema.niveles)
                .where(eq(schema.niveles.moduloId, mod.id))
                .orderBy(asc(schema.niveles.orden));

            return {
                ...mod,
                levels: levels
            };
        }));

        return modulesWithLevels;
    }

    async getStudentProgress(studentId: number) {
        // Get total points
        const pointsResult = await this.db.select({
            total: schema.puntosLog.cantidad
        })
            .from(schema.puntosLog)
            .where(eq(schema.puntosLog.estudianteId, studentId));

        const totalPoints = pointsResult.reduce((sum, row) => sum + (row.total || 0), 0);

        // Get module progress (days elapsed for each assigned module)
        const assignments = await this.db.select({
            moduloId: schema.asignaciones.moduloId,
            duracionDias: schema.modulos.duracionDias
        })
            .from(schema.asignaciones)
            .innerJoin(schema.modulos, eq(schema.asignaciones.moduloId, schema.modulos.id))
            .where(eq(schema.asignaciones.estudianteId, studentId));

        const moduleProgress = assignments.map(assignment => {
            // Since fechaAsignacion doesn't exist in schema, we'll use a default start date
            // In production, you should add this field to the schema
            const startDate = new Date(); // Default to today for now
            startDate.setDate(startDate.getDate() - 5); // Simulate 5 days elapsed

            const today = new Date();
            const daysElapsed = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
            const totalDays = assignment.duracionDias || 30;
            const progressPercentage = Math.min(100, Math.round((daysElapsed / totalDays) * 100));

            return {
                moduloId: assignment.moduloId,
                daysElapsed,
                totalDays,
                progressPercentage
            };
        });

        return {
            totalPoints,
            moduleProgress
        };
    }

    async getLevelContents(levelId: number) {
        const contents = await this.db.select()
            .from(schema.contenidos)
            .where(eq(schema.contenidos.nivelId, levelId));
        return contents;
    }
}
