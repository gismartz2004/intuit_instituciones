
import { Inject, Injectable } from '@nestjs/common';
import { DRIZZLE_DB } from '../../database/drizzle.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../shared/schema';
import { eq, asc, desc, and } from 'drizzle-orm';
import { StorageService } from '../storage/storage.service';
import { GamificationService } from './services/gamification.service';

@Injectable()
export class StudentService {
    constructor(
        @Inject(DRIZZLE_DB) private db: NodePgDatabase<typeof schema>,
        private storageService: StorageService,
        private gamificationService: GamificationService
    ) { }

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
        // 1. Traditional Activities
        const activities = await this.db.select()
            .from(schema.actividades)
            .where(eq(schema.actividades.nivelId, levelId));

        let totalTasks = activities.length;
        let completedTasks = 0;

        if (activities.length > 0) {
            const submissions = await this.db.select()
                .from(schema.entregas)
                .where(eq(schema.entregas.estudianteId, studentId));

            const activityIds = activities.map(a => a.id);
            completedTasks = submissions.filter(s =>
                activityIds.includes(s.actividadId!) && s.calificacionNumerica !== null
            ).length;
        }

        // 2. RAG Guides (RAG Templates associated with this level)
        const rags = await this.db.select()
            .from(schema.plantillasRag)
            .where(eq(schema.plantillasRag.nivelId, levelId));

        for (const rag of rags) {
            totalTasks += 1;

            const ragSubmissions = await this.db.select()
                .from(schema.entregasRag)
                .where(and(
                    eq(schema.entregasRag.estudianteId, studentId),
                    eq(schema.entregasRag.plantillaRagId, rag.id)
                ));

            const pasos = (rag.pasosGuiados as any[]) || [];
            if (pasos.length === 0) {
                completedTasks += 1;
                continue;
            }

            const submittedIndices = new Set(ragSubmissions.map(s => s.pasoIndice));
            const allRequiredSubmitted = pasos.every((p, idx) =>
                !p.requiereEntregable || submittedIndices.has(idx)
            );

            if (allRequiredSubmitted) {
                completedTasks += 1;
            }
        }

        // 3. HA Guides (HA Templates associated with this level)
        const has = await this.db.select()
            .from(schema.plantillasHa)
            .where(eq(schema.plantillasHa.nivelId, levelId));

        for (const ha of has) {
            totalTasks += 1;
            const haSubmissions = await this.db.select()
                .from(schema.entregasHa)
                .where(and(
                    eq(schema.entregasHa.estudianteId, studentId),
                    eq(schema.entregasHa.plantillaHaId, ha.id)
                ));

            if (haSubmissions.length > 0) {
                completedTasks += 1;
            }
        }

        if (totalTasks === 0) {
            return { porcentajeCompletado: 100, completado: true };
        }

        const porcentajeCompletado = Math.min(100, Math.round((completedTasks / totalTasks) * 100));
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
                    completado: completado || existing[0].completado, // Don't un-complete if already done
                    fechaCompletado: (completado && !existing[0].completado) ? new Date() : existing[0].fechaCompletado
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

        // If newly completed, unlock next level
        if (completado && (existing.length === 0 || !existing[0].completado)) {
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

    async getAvailableMissions(studentId: number) {
        // Get all assignments to find relevant modules
        const assignments = await this.db.select({ moduleId: schema.asignaciones.moduloId })
            .from(schema.asignaciones)
            .where(eq(schema.asignaciones.estudianteId, studentId));

        if (assignments.length === 0) return [];

        const moduleIds = assignments.map(a => a.moduleId).filter((id): id is number => id !== null);

        // Fetch all levels for these modules
        const allLevels = await this.db.select()
            .from(schema.niveles)
            .where(and(
                // In a real scenario, use 'inArray' if available or multiple queries
                // For simplicity, we assume one module or we loop. Let's filter in memory if needed or use raw query.
                // Or better, let's just get all levels and filter by module ID match.
            ))
            .orderBy(asc(schema.niveles.orden));

        // Actually, let's just iterate modules
        let missions = [];

        for (const modId of moduleIds) {
            const levelsInfos = await this.getStudentLevelProgress(studentId, modId);

            // Get RAG/HA templates info for details
            for (const level of levelsInfos) {
                // Fetch Rag info
                const rag = await this.db.select({ id: schema.plantillasRag.id, nombre: schema.plantillasRag.nombreActividad, hito: schema.plantillasRag.hitoAprendizaje })
                    .from(schema.plantillasRag)
                    .where(eq(schema.plantillasRag.nivelId, level.id))
                    .limit(1);

                // Fetch HA info if RAG not found or secondary
                const ha = await this.db.select({ id: schema.plantillasHa.id, fase: schema.plantillasHa.fase })
                    .from(schema.plantillasHa)
                    .where(eq(schema.plantillasHa.nivelId, level.id))
                    .limit(1);

                const missionName = rag[0]?.hito || ha[0]?.fase || `Nivel ${level.orden}`;
                const description = rag[0]?.nombre || "Completar las actividades del nivel.";

                missions.push({
                    id: level.id,
                    title: missionName,
                    description: description,
                    status: level.completado ? 'completed' : (level.isUnlocked ? 'active' : 'locked'),
                    xp: 500, // Fixed for now, could be dynamic
                    location: `Zona ${level.orden}`, // Or actual zone name if we had it
                    type: rag.length > 0 ? 'RAG' : 'HA'
                });
            }
        }

        return missions;
    }


    // =========== GAMIFICATION ===========
    async getGamificationStats(studentId: number) {
        let gamification = await this.db.select()
            .from(schema.gamificacionEstudiante)
            .where(eq(schema.gamificacionEstudiante.estudianteId, studentId))
            .limit(1);

        if (gamification.length === 0) {
            // Initialize gamification for student
            await this.db.insert(schema.gamificacionEstudiante).values({
                estudianteId: studentId,
                xpTotal: 0,
                nivelActual: 1,
                puntosDisponibles: 0,
                rachaDias: 0
            });
            gamification = await this.db.select()
                .from(schema.gamificacionEstudiante)
                .where(eq(schema.gamificacionEstudiante.estudianteId, studentId))
                .limit(1);
        }

        // Get total points from puntos_log
        const pointsResult = await this.db.select({ total: schema.puntosLog.cantidad })
            .from(schema.puntosLog)
            .where(eq(schema.puntosLog.estudianteId, studentId));

        const totalPoints = pointsResult.reduce((sum, row) => sum + (row.total || 0), 0);

        // Get unlocked achievements
        const achievements = await this.db.select({
            logro: schema.logros,
            fechaDesbloqueo: schema.logrosDesbloqueados.fechaDesbloqueo
        })
            .from(schema.logrosDesbloqueados)
            .innerJoin(schema.logros, eq(schema.logrosDesbloqueados.logroId, schema.logros.id))
            .where(eq(schema.logrosDesbloqueados.estudianteId, studentId));

        return {
            ...gamification[0],
            totalPoints,
            achievements: achievements.map(a => ({
                ...a.logro,
                unlockedAt: a.fechaDesbloqueo
            }))
        };
    }

    async getGlobalLeaderboard(limit: number = 10) {
        const leaderboard = await this.db.select({
            studentId: schema.usuarios.id,
            name: schema.usuarios.nombre,
            avatar: schema.usuarios.avatar,
            xp: schema.gamificacionEstudiante.xpTotal,
            level: schema.gamificacionEstudiante.nivelActual,
            streak: schema.gamificacionEstudiante.rachaDias
        })
            .from(schema.usuarios)
            .leftJoin(schema.gamificacionEstudiante, eq(schema.gamificacionEstudiante.estudianteId, schema.usuarios.id))
            .where(and(
                eq(schema.usuarios.roleId, 3), // Only students
                eq(schema.usuarios.planId, 3)   // Only Genio Pro (Liga Oro)
            ))
            .orderBy(desc(schema.gamificacionEstudiante.xpTotal))
            .limit(limit);

        // Map nulls for students without gamification records yet
        const mapped = leaderboard.map(player => ({
            ...player,
            xp: player.xp || 0,
            level: player.level || 1,
            streak: player.streak || 0
        }));

        // Re-sort after mapping to ensure 0 XP students are at the bottom
        return mapped.sort((a, b) => (b.xp || 0) - (a.xp || 0));
    }

    async addXP(studentId: number, amount: number, reason: string) {
        // Delegate to gamification service
        return await this.gamificationService.awardXP(studentId, amount, reason);
    }

    // =========== FILE UPLOADS ===========
    // =========== SUBMISSIONS (URL BASED) ===========
    async submitHaEvidence(data: { studentId: number; plantillaHaId: number; archivosUrls: string[]; comentarioEstudiante: string }) {
        const { studentId, plantillaHaId, archivosUrls, comentarioEstudiante } = data;

        // Check if already submitted
        const existing = await this.db.select()
            .from(schema.entregasHa)
            .where(and(
                eq(schema.entregasHa.estudianteId, studentId),
                eq(schema.entregasHa.plantillaHaId, plantillaHaId)
            ))
            .limit(1);

        if (existing.length > 0) {
            console.log(`Student ${studentId} is updating HA evidence for template ${plantillaHaId}`);
            // Allow update by deleting old one
            await this.db.delete(schema.entregasHa)
                .where(and(
                    eq(schema.entregasHa.estudianteId, studentId),
                    eq(schema.entregasHa.plantillaHaId, plantillaHaId)
                ));
        }

        // Get levelId for this template
        const template = await this.db.select({ nivelId: schema.plantillasHa.nivelId })
            .from(schema.plantillasHa)
            .where(eq(schema.plantillasHa.id, plantillaHaId))
            .limit(1);

        const res = await this.db.insert(schema.entregasHa).values({
            estudianteId: studentId,
            plantillaHaId: plantillaHaId,
            archivosUrls: JSON.stringify(archivosUrls),
            comentarioEstudiante: comentarioEstudiante,
            validado: false
        }).returning();

        const resId = res[0].id;

        // Award XP immediately since HA is a single submission activity
        try {
            const student = await this.db.select({ planId: schema.usuarios.planId })
                .from(schema.usuarios)
                .where(eq(schema.usuarios.id, studentId))
                .limit(1);

            let baseXP = 100;
            const isOro = student.length > 0 && student[0].planId === 3;
            if (isOro) baseXP = Math.floor(baseXP * 1.2);

            if (existing.length === 0) {
                await this.gamificationService.awardXP(studentId, baseXP, `HA completado${isOro ? ' (Bono Oro)' : ''}`);
                await this.gamificationService.updateMissionProgress(studentId, 'COMPLETE_ACTIVITY', 1);
            }
        } catch (error) {
            console.error('Error awarding XP for HA:', error.message);
        }

        // Trigger level progress update
        if (template.length > 0 && template[0].nivelId) {
            await this.updateLevelProgress(studentId, template[0].nivelId);
        }

        return { success: true, action: 'created', id: resId };
    }

    async submitRagProgress(data: { studentId: number; plantillaRagId: number; pasoIndice: number; archivoUrl: string; tipoArchivo: string }) {
        const { studentId, plantillaRagId, pasoIndice, archivoUrl, tipoArchivo } = data;

        // 1. Check if this specific step was already submitted (Optional: log but allow overwrite)
        const existingStep = await this.db.select()
            .from(schema.entregasRag)
            .where(and(
                eq(schema.entregasRag.estudianteId, studentId),
                eq(schema.entregasRag.plantillaRagId, plantillaRagId),
                eq(schema.entregasRag.pasoIndice, pasoIndice)
            ))
            .limit(1);

        if (existingStep.length > 0) {
            console.log(`Student ${studentId} is updating RAG step ${pasoIndice} for template ${plantillaRagId}`);
            // We allow overwrite by deleting the previous attempt
            await this.db.delete(schema.entregasRag)
                .where(and(
                    eq(schema.entregasRag.estudianteId, studentId),
                    eq(schema.entregasRag.plantillaRagId, plantillaRagId),
                    eq(schema.entregasRag.pasoIndice, pasoIndice)
                ));
        }

        // 2. Get RAG template and levelId
        const rag = await this.db.select()
            .from(schema.plantillasRag)
            .where(eq(schema.plantillasRag.id, plantillaRagId))
            .limit(1);

        if (rag.length === 0) throw new Error('Plantilla RAG no encontrada');
        const nivelId = rag[0].nivelId;

        // 3. Pre-check: Is it already finished? (To avoid awarding XP twice)
        const submissionsBefore = await this.db.select().from(schema.entregasRag)
            .where(and(eq(schema.entregasRag.estudianteId, studentId), eq(schema.entregasRag.plantillaRagId, plantillaRagId)));

        const pasos = (rag[0].pasosGuiados as any[]) || [];
        const submittedIndicesBefore = new Set(submissionsBefore.map(s => s.pasoIndice));
        const isAlreadyComplete = pasos.length > 0 && pasos.every((p, idx) => !p.requiereEntregable || submittedIndicesBefore.has(idx));

        // We removed the strict throw to allow updates after completion
        // but we use isAlreadyComplete in Section 5 below.

        // 4. Perform submission
        await this.db.insert(schema.entregasRag).values({
            estudianteId: studentId,
            plantillaRagId: plantillaRagId,
            pasoIndice: pasoIndice,
            archivoUrl: archivoUrl,
            tipoArchivo: tipoArchivo,
            feedbackAvatar: '¡Excelente trabajo! Entregable recibido.'
        });

        // 5. Post-check: Is it NOW complete?
        const submissionsAfter = await this.db.select().from(schema.entregasRag)
            .where(and(eq(schema.entregasRag.estudianteId, studentId), eq(schema.entregasRag.plantillaRagId, plantillaRagId)));
        const submittedIndicesAfter = new Set(submissionsAfter.map(s => s.pasoIndice));
        const isNowComplete = pasos.every((p, idx) => !p.requiereEntregable || submittedIndicesAfter.has(idx));

        if (isNowComplete && !isAlreadyComplete) {
            // Award XP only if this is the transition to completion
            try {
                const student = await this.db.select({ planId: schema.usuarios.planId })
                    .from(schema.usuarios)
                    .where(eq(schema.usuarios.id, studentId))
                    .limit(1);

                let baseXP = 100;
                const isOro = student.length > 0 && student[0].planId === 3;
                if (isOro) baseXP = Math.floor(baseXP * 1.2);

                await this.gamificationService.awardXP(studentId, baseXP, `RAG completado${isOro ? ' (Bono Oro)' : ''}`);
                await this.gamificationService.updateMissionProgress(studentId, 'COMPLETE_ACTIVITY', 1);
            } catch (error) {
                console.error('Error awarding XP for RAG:', error.message);
            }
        }

        // 6. Trigger level progress update
        if (nivelId) {
            await this.updateLevelProgress(studentId, nivelId);
        }

        return { success: true, pasoIndice, isCompleted: isNowComplete };
    }

    async getRagSubmissions(studentId: number, plantillaRagId: number) {
        return this.db.select()
            .from(schema.entregasRag)
            .where(and(
                eq(schema.entregasRag.estudianteId, studentId),
                eq(schema.entregasRag.plantillaRagId, plantillaRagId)
            ));
    }

    async getHaSubmissions(studentId: number, plantillaHaId: number) {
        return this.db.select()
            .from(schema.entregasHa)
            .where(and(
                eq(schema.entregasHa.estudianteId, studentId),
                eq(schema.entregasHa.plantillaHaId, plantillaHaId)
            ));
    }
}
