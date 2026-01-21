
import { Inject, Injectable } from '@nestjs/common';
import { DRIZZLE_DB } from '../../database/drizzle.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../shared/schema';
import { eq, asc, desc, and } from 'drizzle-orm';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class StudentService {
    constructor(
        @Inject(DRIZZLE_DB) private db: NodePgDatabase<typeof schema>,
        private storageService: StorageService
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
            .from(schema.gamificacionEstudiante)
            .innerJoin(schema.usuarios, eq(schema.gamificacionEstudiante.estudianteId, schema.usuarios.id))
            .orderBy(desc(schema.gamificacionEstudiante.xpTotal))
            .limit(limit);

        return leaderboard;
    }

    async addXP(studentId: number, amount: number, reason: string) {
        // Update gamification record
        const current = await this.db.select()
            .from(schema.gamificacionEstudiante)
            .where(eq(schema.gamificacionEstudiante.estudianteId, studentId))
            .limit(1);

        if (current.length === 0) {
            await this.getGamificationStats(studentId); // Initialize
        }

        const newXP = (current[0]?.xpTotal || 0) + amount;
        const newLevel = this.calculateLevelFromXP(newXP);

        await this.db.update(schema.gamificacionEstudiante)
            .set({
                xpTotal: newXP,
                nivelActual: newLevel,
                puntosDisponibles: (current[0]?.puntosDisponibles || 0) + amount
            })
            .where(eq(schema.gamificacionEstudiante.estudianteId, studentId));

        // Log points
        await this.db.insert(schema.puntosLog).values({
            estudianteId: studentId,
            cantidad: amount,
            motivo: reason
        });

        return { newXP, newLevel, amount, reason };
    }

    private calculateLevelFromXP(xp: number): number {
        const levels = [
            { level: 1, minXP: 0 },
            { level: 2, minXP: 500 },
            { level: 3, minXP: 1500 },
            { level: 4, minXP: 3000 },
            { level: 5, minXP: 5000 },
            { level: 6, minXP: 8000 },
            { level: 7, minXP: 12000 },
        ];

        for (let i = levels.length - 1; i >= 0; i--) {
            if (xp >= levels[i].minXP) {
                return levels[i].level;
            }
        }
        return 1;
    }

    // =========== FILE UPLOADS ===========
    // =========== SUBMISSIONS (URL BASED) ===========
    async submitHaEvidence(data: { studentId: number; plantillaHaId: number; archivosUrls: string[]; comentarioEstudiante: string }) {
        const { studentId, plantillaHaId, archivosUrls, comentarioEstudiante } = data;

        // Get levelId for this template
        const template = await this.db.select({ nivelId: schema.plantillasHa.nivelId })
            .from(schema.plantillasHa)
            .where(eq(schema.plantillasHa.id, plantillaHaId))
            .limit(1);

        // Check if evidence already exists
        const existing = await this.db.select()
            .from(schema.entregasHa)
            .where(and(
                eq(schema.entregasHa.estudianteId, studentId),
                eq(schema.entregasHa.plantillaHaId, plantillaHaId)
            ))
            .limit(1);

        let resId: number;
        if (existing.length > 0) {
            // Update existing
            await this.db.update(schema.entregasHa)
                .set({
                    archivosUrls: JSON.stringify(archivosUrls),
                    comentarioEstudiante: comentarioEstudiante || existing[0].comentarioEstudiante,
                    fechaSubida: new Date()
                })
                .where(eq(schema.entregasHa.id, existing[0].id));
            resId = existing[0].id;
        } else {
            // Create new
            const res = await this.db.insert(schema.entregasHa).values({
                estudianteId: studentId,
                plantillaHaId: plantillaHaId,
                archivosUrls: JSON.stringify(archivosUrls),
                comentarioEstudiante: comentarioEstudiante,
                validado: false
            }).returning();
            resId = res[0].id;
        }

        // Trigger progress update
        if (template.length > 0 && template[0].nivelId) {
            await this.updateLevelProgress(studentId, template[0].nivelId);
        }

        return { success: true, action: existing.length > 0 ? 'updated' : 'created', id: resId };
    }

    async submitRagProgress(data: { studentId: number; plantillaRagId: number; pasoIndice: number; archivoUrl: string; tipoArchivo: string }) {
        const { studentId, plantillaRagId, pasoIndice, archivoUrl, tipoArchivo } = data;

        // Get levelId for this template
        const template = await this.db.select({ nivelId: schema.plantillasRag.nivelId })
            .from(schema.plantillasRag)
            .where(eq(schema.plantillasRag.id, plantillaRagId))
            .limit(1);

        await this.db.insert(schema.entregasRag).values({
            estudianteId: studentId,
            plantillaRagId: plantillaRagId,
            pasoIndice: pasoIndice,
            archivoUrl: archivoUrl,
            tipoArchivo: tipoArchivo,
            feedbackAvatar: '¡Excelente trabajo! Entregable recibido.'
        });

        // Add points for submission
        await this.addXP(studentId, 50, 'Entrega de avance RAG');

        // Trigger progress update
        if (template.length > 0 && template[0].nivelId) {
            await this.updateLevelProgress(studentId, template[0].nivelId);
        }

        return { success: true, pasoIndice };
    }
}
