import { Inject, Injectable } from '@nestjs/common';
import { DRIZZLE_DB } from '../../database/drizzle.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../shared/schema';
import { eq, asc, and } from 'drizzle-orm';

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

    async calculateLevelProgress(studentId: number, levelId: number) {
        // Get all activities for this level
        const activities = await this.db.select()
            .from(schema.actividades)
            .where(eq(schema.actividades.nivelId, levelId));

        if (activities.length === 0) {
            return { porcentajeCompletado: 100, completado: true }; // No activities = auto-complete
        }

        // Get student's submissions for these activities
        const activityIds = activities.map(a => a.id);
        const submissions = await this.db.select()
            .from(schema.entregas)
            .where(eq(schema.entregas.estudianteId, studentId));

        const completedActivities = submissions.filter(s =>
            activityIds.includes(s.actividadId!) && s.calificacionNumerica !== null
        );

        const porcentajeCompletado = Math.round((completedActivities.length / activities.length) * 100);
        const completado = porcentajeCompletado === 100;

        return { porcentajeCompletado, completado };
    }

    async updateLevelProgress(studentId: number, levelId: number) {
        const { porcentajeCompletado, completado } = await this.calculateLevelProgress(studentId, levelId);

        // Check if progress record exists
        const existing = await this.db.select()
            .from(schema.progresoNiveles)
            .where(and(
                eq(schema.progresoNiveles.estudianteId, studentId),
                eq(schema.progresoNiveles.nivelId, levelId)
            ))
            .limit(1);

        if (existing.length > 0) {
            // Update existing
            await this.db.update(schema.progresoNiveles)
                .set({
                    porcentajeCompletado,
                    completado,
                    fechaCompletado: completado ? new Date() : null
                })
                .where(eq(schema.progresoNiveles.id, existing[0].id));
        } else {
            // Create new
            await this.db.insert(schema.progresoNiveles).values({
                estudianteId: studentId,
                nivelId: levelId,
                porcentajeCompletado,
                completado,
                fechaCompletado: completado ? new Date() : null
            });
        }

        // If completed, unlock next level
        if (completado) {
            await this.unlockNextLevel(studentId, levelId);
        }

        return { porcentajeCompletado, completado };
    }

    async unlockNextLevel(studentId: number, currentLevelId: number) {
        // Get current level info
        const currentLevel = await this.db.select()
            .from(schema.niveles)
            .where(eq(schema.niveles.id, currentLevelId))
            .limit(1);

        if (currentLevel.length === 0) return;

        const moduleId = currentLevel[0].moduloId;
        const currentOrder = currentLevel[0].orden;

        // Find next level
        const nextLevel = await this.db.select()
            .from(schema.niveles)
            .where(and(
                eq(schema.niveles.moduloId, moduleId!),
                eq(schema.niveles.orden, currentOrder! + 1)
            ))
            .limit(1);

        if (nextLevel.length === 0) return; // No next level

        // Create progress record for next level (unlocked but not started)
        const existingNext = await this.db.select()
            .from(schema.progresoNiveles)
            .where(and(
                eq(schema.progresoNiveles.estudianteId, studentId),
                eq(schema.progresoNiveles.nivelId, nextLevel[0].id)
            ))
            .limit(1);

        if (existingNext.length === 0) {
            await this.db.insert(schema.progresoNiveles).values({
                estudianteId: studentId,
                nivelId: nextLevel[0].id,
                porcentajeCompletado: 0,
                completado: false
            });
        }
    }

    async getStudentLevelProgress(studentId: number, moduleId: number) {
        // Get all levels for module
        const levels = await this.db.select()
            .from(schema.niveles)
            .where(eq(schema.niveles.moduloId, moduleId))
            .orderBy(asc(schema.niveles.orden));

        // Get progress for each level
        const progress = await this.db.select()
            .from(schema.progresoNiveles)
            .where(eq(schema.progresoNiveles.estudianteId, studentId));

        return levels.map((level, index) => {
            const levelProgress = progress.find(p => p.nivelId === level.id);
            const isUnlocked = index === 0 || levelProgress !== undefined;

            return {
                ...level,
                porcentajeCompletado: levelProgress?.porcentajeCompletado || 0,
                completado: levelProgress?.completado || false,
                isUnlocked
            };
        });
    }
}
