
import { Inject, Injectable } from '@nestjs/common';
import { DRIZZLE_DB } from '../../database/drizzle.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../shared/schema';
import { eq, asc, desc, and, sql } from 'drizzle-orm';
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
        // 1. Get Assigned Modules with Course info
        const results = await this.db.select({
            module: schema.modulos,
            cursoNombre: schema.cursos.nombre
        })
            .from(schema.asignaciones)
            .innerJoin(schema.modulos, eq(schema.asignaciones.moduloId, schema.modulos.id))
            .leftJoin(schema.cursos, eq(schema.modulos.cursoId, schema.cursos.id))
            .where(eq(schema.asignaciones.estudianteId, studentId));

        // 2. For each module, get Levels (Niveles)
        const modulesWithLevels = await Promise.all(results.map(async (row) => {
            const mod = row.module;

            const levels = await this.db.select()
                .from(schema.niveles)
                .where(eq(schema.niveles.moduloId, mod.id))
                .orderBy(asc(schema.niveles.orden));

            return {
                ...mod,
                cursoNombre: row.cursoNombre,
                levelCount: levels.length,
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
            duracionDias: schema.modulos.duracionDias,
            fechaAsignacion: schema.asignaciones.fechaAsignacion
        })
            .from(schema.asignaciones)
            .innerJoin(schema.modulos, eq(schema.asignaciones.moduloId, schema.modulos.id))
            .where(eq(schema.asignaciones.estudianteId, studentId));

        const moduleProgress = await Promise.all(assignments.map(async (assignment) => {
            const startDate = assignment.fechaAsignacion || new Date();
            const today = new Date();
            const daysElapsed = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
            const totalDays = assignment.duracionDias || 30;

            // Calculate actual completion percentage based on finished levels
            const levels = await this.db.select({ id: schema.niveles.id })
                .from(schema.niveles)
                .where(eq(schema.niveles.moduloId, assignment.moduloId!));

            const levelIds = levels.map(l => l.id);
            let finishedLevels = 0;

            if (levelIds.length > 0) {
                const completions = await this.db.select()
                    .from(schema.progresoNiveles)
                    .where(and(
                        eq(schema.progresoNiveles.estudianteId, studentId),
                        sql`${schema.progresoNiveles.nivelId} IN (${sql.join(levelIds, sql`, `)})`,
                        eq(schema.progresoNiveles.completado, true)
                    ));
                finishedLevels = completions.length;
            }

            const progressPercentage = levels.length > 0
                ? Math.round((finishedLevels / levels.length) * 100)
                : 0;

            return {
                moduloId: assignment.moduloId,
                daysElapsed: Math.max(0, daysElapsed),
                totalDays,
                progressPercentage
            };
        }));

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
        // 0. Attendance Check
        const [attendance] = await this.db.select()
            .from(schema.asistencia)
            .where(and(
                eq(schema.asistencia.estudianteId, studentId),
                eq(schema.asistencia.nivelId, levelId)
            ))
            .limit(1);

        const hasAttended = attendance?.asistio === true;

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

            if (hasAttended) {
                completedTasks += 1;
                continue;
            }

            const ragSubmissions = await this.db.select()
                .from(schema.entregasRag)
                .where(and(
                    eq(schema.entregasRag.estudianteId, studentId),
                    eq(schema.entregasRag.plantillaRagId, rag.id)
                ));

            // Safe parsing of pasosGuiados
            let pasos: any[] = [];
            try {
                const rawPasos = rag.pasosGuiados;
                pasos = typeof rawPasos === 'string' ? JSON.parse(rawPasos) : (Array.isArray(rawPasos) ? rawPasos : []);
            } catch (e) {
                pasos = [];
            }

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

    async getAttendanceStatus(studentId: number, levelId: number) {
        const [attendance] = await this.db.select()
            .from(schema.asistencia)
            .where(and(
                eq(schema.asistencia.estudianteId, studentId),
                eq(schema.asistencia.nivelId, levelId)
            ))
            .limit(1);

        return {
            asistio: attendance?.asistio === true,
            recuperada: attendance?.recuperada === true,
            fecha: attendance?.fecha || null
        };
    }

    async getDetailedLevelStatus(studentId: number, levelId: number) {
        // 1. Attendance Check
        const attendance = await this.getAttendanceStatus(studentId, levelId);
        const hasAttended = attendance.asistio || attendance.recuperada;

        // 2. RAG Completion
        const rags = await this.db.select()
            .from(schema.plantillasRag)
            .where(eq(schema.plantillasRag.nivelId, levelId));

        let ragCompleted = hasAttended; // If attended, RAG is practically done for progress
        let ragPendingDeliverables = false;

        if (!ragCompleted && rags.length > 0) {
            const ragSubmissions = await this.db.select()
                .from(schema.entregasRag)
                .where(and(
                    eq(schema.entregasRag.estudianteId, studentId),
                    eq(schema.entregasRag.plantillaRagId, rags[0].id) // Assuming one RAG per level for simplicity
                ));

            // Parse steps
            let pasos: any[] = [];
            try {
                const rawPasos = rags[0].pasosGuiados;
                pasos = typeof rawPasos === 'string' ? JSON.parse(rawPasos) : (Array.isArray(rawPasos) ? rawPasos : []);
            } catch (e) {
                pasos = [];
            }

            if (pasos.length === 0) {
                ragCompleted = true;
            } else {
                const submittedIndices = new Set(ragSubmissions.map(s => s.pasoIndice));
                ragCompleted = pasos.every((p, idx) => !p.requiereEntregable || submittedIndices.has(idx));
                ragPendingDeliverables = pasos.some((p, idx) => p.requiereEntregable && !submittedIndices.has(idx));
            }
        }

        // 3. HA Completion
        const has = await this.db.select()
            .from(schema.plantillasHa)
            .where(eq(schema.plantillasHa.nivelId, levelId));

        let haCompleted = false;
        if (has.length > 0) {
            const haSubmissions = await this.db.select()
                .from(schema.entregasHa)
                .where(and(
                    eq(schema.entregasHa.estudianteId, studentId),
                    eq(schema.entregasHa.plantillaHaId, has[0].id)
                ));
            haCompleted = haSubmissions.length > 0;
        }

        // 4. PIM Completion
        const pims = await this.db.select()
            .from(schema.plantillasPim)
            .where(eq(schema.plantillasPim.nivelId, levelId));
        let pimCompleted = false;
        // PIM logic... (minimal for now)

        // 5. BD, IT, PIC Completion (Specialist Track style)
        const bds = await this.db.select().from(schema.plantillasBd).where(eq(schema.plantillasBd.nivelId, levelId));
        const its = await this.db.select().from(schema.plantillasIt).where(eq(schema.plantillasIt.nivelId, levelId));
        const pics = await this.db.select().from(schema.plantillasPic).where(eq(schema.plantillasPic.nivelId, levelId));

        return {
            attendance,
            rag: rags.length > 0 ? {
                completed: ragCompleted,
                pending: ragPendingDeliverables,
                status: ragCompleted ? 'completed' : (hasAttended ? 'completed' : (ragPendingDeliverables ? 'pending' : 'missing'))
            } : null,
            ha: has.length > 0 ? {
                completed: haCompleted,
                status: haCompleted ? 'completed' : 'pending'
            } : null,
            pim: pims.length > 0 ? {
                completed: pimCompleted,
                status: pimCompleted ? 'completed' : 'pending'
            } : null,
            bd: bds.length > 0 ? {
                completed: false, // Placeholder
                status: 'pending'
            } : null,
            it: its.length > 0 ? {
                completed: false, // Placeholder
                status: 'pending'
            } : null,
            pic: pics.length > 0 ? {
                completed: false, // Placeholder
                status: 'pending'
            } : null
        };
    }

    async updateLevelProgress(studentId: number, levelId: number) {
        const { porcentajeCompletado, completado } = await this.calculateLevelProgress(studentId, levelId);

        // Check for attendance recovery
        if (completado) {
            const [attendance] = await this.db.select()
                .from(schema.asistencia)
                .where(and(
                    eq(schema.asistencia.estudianteId, studentId),
                    eq(schema.asistencia.nivelId, levelId),
                    eq(schema.asistencia.asistio, false),
                    eq(schema.asistencia.recuperada, false)
                ))
                .limit(1);

            if (attendance) {
                console.log(`[ATTENDANCE RECOVERY] Student ${studentId} recovered attendance for level ${levelId}`);
                await this.db.update(schema.asistencia)
                    .set({ recuperada: true })
                    .where(eq(schema.asistencia.id, attendance.id));

                // Award points for recovery
                await this.gamificationService.awardXP(studentId, 150, "Asistencia Recuperada");
            }
        }

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
        console.log(`[GET MODULE PROGRESS] Student: ${studentId}, Module: ${moduleId}`);
        // 1. Get Assignment Info (to find fechaAsignacion)
        const assignment = await this.db.select()
            .from(schema.asignaciones)
            .where(and(
                eq(schema.asignaciones.estudianteId, studentId),
                eq(schema.asignaciones.moduloId, moduleId)
            ))
            .limit(1)
            .then(res => res[0]);

        const fechaAsignacion = assignment?.fechaAsignacion || new Date();
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - fechaAsignacion.getTime());
        const daysPassed = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        // 2. Get all levels for module
        const levels = await this.db.select()
            .from(schema.niveles)
            .where(eq(schema.niveles.moduloId, moduleId))
            .orderBy(asc(schema.niveles.orden));

        // 3. Get progress for each level
        const progress = await this.db.select()
            .from(schema.progresoNiveles)
            .where(eq(schema.progresoNiveles.estudianteId, studentId));

        let previousLevelCompleted = true; // Level 1 is always unlocked by progress

        const results = [];
        for (const level of levels) {
            const levelProgress = progress.find(p => p.nivelId === level.id);
            const isCompleted = !!levelProgress?.completado;

            // 1. Time Check
            const daysRequired = (level.orden || 1) <= 1 ? 0 : (level.diasParaDesbloquear ?? 7);
            const hasEnoughTime = daysPassed >= daysRequired;

            // 1. Core Logic: 3-State Override
            // true = FORCE LOCKED
            // false = FORCE UNLOCKED (Super Unlock)
            // null = SCHEDULED (follows days)
            let isUnlockedByTime = false;
            let isForceUnlocked = false;

            if (level.bloqueadoManual === true) {
                isUnlockedByTime = false;
            } else if (level.bloqueadoManual === false) {
                isUnlockedByTime = true;
                isForceUnlocked = true; // Flag to bypass progress
            } else {
                // Scheduled (null or undefined)
                isUnlockedByTime = hasEnoughTime;
            }

            // 2. Final availability: 
            // If Force Unlocked -> TRUE
            // Else -> Time AND Progress
            const isUnlockedByProgress = previousLevelCompleted;

            const isAvailable = isForceUnlocked || (isUnlockedByTime && isUnlockedByProgress);

            // Helpful derived states for UI
            const isStuck = isUnlockedByTime && !isUnlockedByProgress && !isForceUnlocked;
            const isManuallyBlocked = level.bloqueadoManual === true;

            // Debug Log
            console.log(`[LEVEL CHECK] ID:${level.id} Ord:${level.orden} Man:${level.bloqueadoManual} Time:${hasEnoughTime} Prog:${isUnlockedByProgress} -> Force:${isForceUnlocked} Avail:${isAvailable}`);

            // Update for next iteration
            previousLevelCompleted = isCompleted;

            // 3. Activity Type Detection (BD, IT, PIC, RAG, HA)
            // Using separate parallel queries for better performance
            const [bdRes, itRes, picRes, ragRes, haRes] = await Promise.all([
                this.db.select({ id: schema.plantillasBd.id }).from(schema.plantillasBd).where(eq(schema.plantillasBd.nivelId, level.id)).limit(1),
                this.db.select({ id: schema.plantillasIt.id }).from(schema.plantillasIt).where(eq(schema.plantillasIt.nivelId, level.id)).limit(1),
                this.db.select({ id: schema.plantillasPic.id }).from(schema.plantillasPic).where(eq(schema.plantillasPic.nivelId, level.id)).limit(1),
                this.db.select({ id: schema.plantillasRag.id }).from(schema.plantillasRag).where(eq(schema.plantillasRag.nivelId, level.id)).limit(1),
                this.db.select({ id: schema.plantillasHa.id }).from(schema.plantillasHa).where(eq(schema.plantillasHa.nivelId, level.id)).limit(1),
            ]);

            const bd = bdRes[0];
            const it = itRes[0];
            const pic = picRes[0];
            const rag = ragRes[0];
            const ha = haRes[0];

            let tipoActividad = 'TRADITIONAL';
            if (bd) tipoActividad = 'BD';
            else if (it) tipoActividad = 'IT';
            else if (pic) tipoActividad = 'PIC';
            else if (rag) tipoActividad = 'RAG';
            else if (ha) tipoActividad = 'HA';

            results.push({
                ...level,
                porcentajeCompletado: levelProgress?.porcentajeCompletado || 0,
                completado: isCompleted,
                isUnlocked: isAvailable,
                isUnlockedByTime, // (Time passed and not manually blocked)
                isUnlockedByProgress,
                isStuck,
                isManuallyBlocked,
                daysPassed,
                daysRequired,
                tipoActividad // Added activity type
            });
        }

        return results;
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

    async submitRagProgress(data: { studentId: any; plantillaRagId: any; pasoIndice: number; archivoUrl: string; tipoArchivo: string }) {
        const studentId = parseInt(data.studentId);
        const plantillaRagId = parseInt(data.plantillaRagId);
        const { pasoIndice, archivoUrl, tipoArchivo } = data;

        console.log(`[RAG SUBMIT] Student: ${studentId}, Template: ${plantillaRagId}, Step: ${pasoIndice}`);

        // 1. Check if this specific step was already submitted
        const existingStep = await this.db.select()
            .from(schema.entregasRag)
            .where(and(
                eq(schema.entregasRag.estudianteId, studentId),
                eq(schema.entregasRag.plantillaRagId, plantillaRagId),
                eq(schema.entregasRag.pasoIndice, pasoIndice)
            ))
            .limit(1);

        if (existingStep.length > 0) {
            console.log(`[RAG SUBMIT] Updating existing step. Deleting old record.`);
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

        if (rag.length === 0) {
            console.error(`[RAG SUBMIT] ERROR: Template ${plantillaRagId} not found in DB`);
            throw new Error(`Plantilla RAG #${plantillaRagId} no encontrada`);
        }
        const nivelId = rag[0].nivelId;

        // 3. Pre-check: Is it already finished? (To avoid awarding XP twice)
        const submissionsBefore = await this.db.select().from(schema.entregasRag)
            .where(and(eq(schema.entregasRag.estudianteId, studentId), eq(schema.entregasRag.plantillaRagId, plantillaRagId)));

        // Safe parsing of pasosGuiados
        let pasos: any[] = [];
        try {
            const rawPasos = rag[0].pasosGuiados;
            pasos = typeof rawPasos === 'string' ? JSON.parse(rawPasos) : (Array.isArray(rawPasos) ? rawPasos : []);
        } catch (e) {
            console.error('Error parsing pasosGuiados:', e);
            pasos = [];
        }

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
        const isNowComplete = pasos.length > 0 && pasos.every((p, idx) => !p.requiereEntregable || submittedIndicesAfter.has(idx));

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

    async getStudentCurriculum(studentId: number) {
        // 1. Basic user info
        const student = await this.db.select({
            id: schema.usuarios.id,
            nombre: schema.usuarios.nombre,
            email: schema.usuarios.email,
            avatar: schema.usuarios.avatar,
            planId: schema.usuarios.planId
        })
            .from(schema.usuarios)
            .where(eq(schema.usuarios.id, studentId))
            .limit(1);

        if (student.length === 0) throw new Error('Estudiante no encontrado');

        // 2. Gamification Stats
        const stats = await this.getGamificationStats(studentId);

        // 3. Module Progress
        const moduleAssignments = await this.db.select({
            moduloId: schema.modulos.id,
            nombreModulo: schema.modulos.nombreModulo,
            duracionDias: schema.modulos.duracionDias
        })
            .from(schema.asignaciones)
            .innerJoin(schema.modulos, eq(schema.asignaciones.moduloId, schema.modulos.id))
            .where(eq(schema.asignaciones.estudianteId, studentId));

        const modulesDetailed = await Promise.all(moduleAssignments.map(async (mod) => {
            // Count total levels in module
            const levels = await this.db.select({ id: schema.niveles.id })
                .from(schema.niveles)
                .where(eq(schema.niveles.moduloId, mod.moduloId));

            const levelIds = levels.map(l => l.id);

            let completedLevels = 0;
            if (levelIds.length > 0) {
                const progress = await this.db.select()
                    .from(schema.progresoNiveles)
                    .where(and(
                        eq(schema.progresoNiveles.estudianteId, studentId),
                        sql`${schema.progresoNiveles.nivelId} IN (${sql.join(levelIds, sql`, `)})`,
                        eq(schema.progresoNiveles.completado, true)
                    ));
                completedLevels = progress.length;
            }

            return {
                ...mod,
                totalLevels: levels.length,
                completedLevels,
                percentage: levels.length > 0 ? Math.round((completedLevels / levels.length) * 100) : 0
            };
        }));

        // 4. Points History (Top 20)
        const pointsHistory = await this.db.select()
            .from(schema.puntosLog)
            .where(eq(schema.puntosLog.estudianteId, studentId))
            .orderBy(desc(schema.puntosLog.fechaObtencion))
            .limit(20);

        // 5. Recent Submissions (RAG & HA)
        const recentRag = await this.db.select({
            id: schema.entregasRag.id,
            tipo: sql`'RAG'`,
            titulo: schema.plantillasRag.nombreActividad,
            fecha: schema.entregasRag.fechaSubida
        })
            .from(schema.entregasRag)
            .innerJoin(schema.plantillasRag, eq(schema.entregasRag.plantillaRagId, schema.plantillasRag.id))
            .where(eq(schema.entregasRag.estudianteId, studentId))
            .orderBy(desc(schema.entregasRag.fechaSubida))
            .limit(5);

        const recentHa = await this.db.select({
            id: schema.entregasHa.id,
            tipo: sql`'HA'`,
            titulo: schema.plantillasHa.fase,
            fecha: schema.entregasHa.fechaSubida
        })
            .from(schema.entregasHa)
            .innerJoin(schema.plantillasHa, eq(schema.entregasHa.plantillaHaId, schema.plantillasHa.id))
            .where(eq(schema.entregasHa.estudianteId, studentId))
            .orderBy(desc(schema.entregasHa.fechaSubida))
            .limit(5);

        const activity = [...recentRag, ...recentHa].sort((a, b) => {
            const dateA = a.fecha ? new Date(a.fecha).getTime() : 0;
            const dateB = b.fecha ? new Date(b.fecha).getTime() : 0;
            return dateB - dateA;
        }).slice(0, 10);

        return {
            student: student[0],
            stats,
            modules: modulesDetailed,
            pointsHistory,
            activity
        };
    }
}
