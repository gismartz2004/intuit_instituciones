import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../../shared/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { DRIZZLE_DB } from '../../../database/drizzle.provider';

// XP thresholds for each level
const LEVEL_THRESHOLDS = [
    0,      // Level 1
    100,    // Level 2
    250,    // Level 3
    500,    // Level 4
    850,    // Level 5
    1300,   // Level 6
    1850,   // Level 7
    2500,   // Level 8
    3250,   // Level 9
    4100,   // Level 10
];

// Calculate XP needed for any level beyond 10
function getXpForLevel(level: number): number {
    if (level <= 10) return LEVEL_THRESHOLDS[level - 1];
    // Formula: 100 * (level - 1)^1.5
    return Math.floor(100 * Math.pow(level - 1, 1.5));
}

@Injectable()
export class GamificationService {
    constructor(
        @Inject(DRIZZLE_DB) private db: NodePgDatabase<typeof schema>,
    ) { }

    /**
     * Award XP to a student and check for level-up
     */
    async awardXP(studentId: number, amount: number, reason: string): Promise<{ leveledUp: boolean; newLevel?: number; xpAwarded: number }> {
        // Log the points
        await this.db.insert(schema.puntosLog).values({
            estudianteId: studentId,
            cantidad: amount,
            motivo: reason,
        });

        // Get or create gamification record
        let gamification = await this.db.select()
            .from(schema.gamificacionEstudiante)
            .where(eq(schema.gamificacionEstudiante.estudianteId, studentId))
            .limit(1);

        // Check if student is Pro (Plan ID 3) for bonus
        const studentRecord = await this.db.select({ planId: schema.usuarios.planId })
            .from(schema.usuarios)
            .where(eq(schema.usuarios.id, studentId))
            .limit(1);

        const isPro = studentRecord.length > 0 && studentRecord[0].planId === 3;
        const finalAmount = isPro ? Math.floor(amount * 1.2) : amount;

        if (gamification.length === 0) {
            // Create initial record
            await this.db.insert(schema.gamificacionEstudiante).values({
                estudianteId: studentId,
                xpTotal: finalAmount,
                nivelActual: 1,
                puntosDisponibles: finalAmount,
                rachaDias: 0,
            });

            // Check if this XP is enough to level up from level 1
            const newLevel = this.calculateLevel(finalAmount);
            if (newLevel > 1) {
                await this.db.update(schema.gamificacionEstudiante)
                    .set({ nivelActual: newLevel })
                    .where(eq(schema.gamificacionEstudiante.estudianteId, studentId));

                await this.checkAchievements(studentId);
                return { leveledUp: true, newLevel, xpAwarded: finalAmount };
            }

            return { leveledUp: false, xpAwarded: finalAmount };
        }

        // Update existing record
        const currentXP = gamification[0].xpTotal || 0;
        const currentLevel = gamification[0].nivelActual || 1;
        const newXP = currentXP + finalAmount;
        const newLevel = this.calculateLevel(newXP);

        await this.db.update(schema.gamificacionEstudiante)
            .set({
                xpTotal: newXP,
                nivelActual: newLevel,
                puntosDisponibles: sql`${schema.gamificacionEstudiante.puntosDisponibles} + ${finalAmount}`,
            })
            .where(eq(schema.gamificacionEstudiante.estudianteId, studentId));

        // Check for achievements after XP update
        await this.checkAchievements(studentId);

        return {
            leveledUp: newLevel > currentLevel,
            newLevel: newLevel > currentLevel ? newLevel : undefined,
            xpAwarded: finalAmount,
        };
    }

    /**
     * Calculate level based on total XP
     */
    calculateLevel(xp: number): number {
        let level = 1;
        while (getXpForLevel(level + 1) <= xp) {
            level++;
        }
        return level;
    }

    /**
     * Get XP needed for next level
     */
    getXpForNextLevel(currentLevel: number): number {
        return getXpForLevel(currentLevel + 1);
    }

    /**
     * Update daily login streak
     */
    async updateStreak(studentId: number): Promise<{ streak: number; bonusXP: number }> {
        const gamification = await this.db.select()
            .from(schema.gamificacionEstudiante)
            .where(eq(schema.gamificacionEstudiante.estudianteId, studentId))
            .limit(1);

        if (gamification.length === 0) {
            // First login ever
            await this.db.insert(schema.gamificacionEstudiante).values({
                estudianteId: studentId,
                xpTotal: 0,
                nivelActual: 1,
                puntosDisponibles: 0,
                rachaDias: 1,
                ultimaRachaUpdate: new Date(),
            });
            return { streak: 1, bonusXP: 0 };
        }

        const lastUpdate = gamification[0].ultimaRachaUpdate;
        const currentStreak = gamification[0].rachaDias || 0;
        const now = new Date();

        if (!lastUpdate) {
            // First time tracking streak
            await this.db.update(schema.gamificacionEstudiante)
                .set({ rachaDias: 1, ultimaRachaUpdate: now })
                .where(eq(schema.gamificacionEstudiante.estudianteId, studentId));
            return { streak: 1, bonusXP: 0 };
        }

        // Calculate days difference
        const lastUpdateDate = new Date(lastUpdate);
        const daysDiff = Math.floor((now.getTime() - lastUpdateDate.getTime()) / (1000 * 60 * 60 * 24));

        let newStreak = currentStreak;
        let bonusXP = 0;

        if (daysDiff === 0) {
            // Same day, no change
            return { streak: currentStreak, bonusXP: 0 };
        } else if (daysDiff === 1) {
            // Consecutive day
            newStreak = currentStreak + 1;

            // Award bonus XP for milestones
            if (newStreak === 3) bonusXP = 50;
            if (newStreak === 7) bonusXP = 150;
            if (newStreak % 7 === 0 && newStreak > 7) bonusXP = 200; // Weekly bonus
        } else {
            // Streak broken
            newStreak = 1;
        }

        await this.db.update(schema.gamificacionEstudiante)
            .set({ rachaDias: newStreak, ultimaRachaUpdate: now })
            .where(eq(schema.gamificacionEstudiante.estudianteId, studentId));

        // Award bonus XP if any
        if (bonusXP > 0) {
            await this.awardXP(studentId, bonusXP, `Racha de ${newStreak} días`);
        }

        // Update mission progress for streak-based missions
        await this.updateMissionProgress(studentId, 'STREAK_3', newStreak >= 3 ? 1 : 0);
        await this.updateMissionProgress(studentId, 'STREAK_7', newStreak >= 7 ? 1 : 0);
        await this.updateMissionProgress(studentId, 'LOGIN_CONSECUTIVE_2', newStreak >= 2 ? 1 : 0);

        return { streak: newStreak, bonusXP };
    }

    /**
     * Check and unlock achievements
     */
    async checkAchievements(studentId: number): Promise<void> {
        // Get student's current stats
        const gamification = await this.db.select()
            .from(schema.gamificacionEstudiante)
            .where(eq(schema.gamificacionEstudiante.estudianteId, studentId))
            .limit(1);

        if (gamification.length === 0) return;

        const stats = gamification[0];

        // Get all achievements
        const allAchievements = await this.db.select().from(schema.logros);

        // Get already unlocked achievements
        const unlocked = await this.db.select()
            .from(schema.logrosDesbloqueados)
            .where(eq(schema.logrosDesbloqueados.estudianteId, studentId));

        const unlockedIds = new Set(unlocked.map(u => u.logroId));

        // Check each achievement
        for (const achievement of allAchievements) {
            if (unlockedIds.has(achievement.id)) continue; // Already unlocked

            let shouldUnlock = false;

            switch (achievement.condicionTipo) {
                case 'LEVEL_REACHED':
                    shouldUnlock = (stats.nivelActual || 1) >= (achievement.condicionValor || 0);
                    break;
                case 'STREAK':
                    shouldUnlock = (stats.rachaDias || 0) >= (achievement.condicionValor || 0);
                    break;
                case 'XP_TOTAL':
                    shouldUnlock = (stats.xpTotal || 0) >= (achievement.condicionValor || 0);
                    break;
            }

            if (shouldUnlock) {
                await this.db.insert(schema.logrosDesbloqueados).values({
                    estudianteId: studentId,
                    logroId: achievement.id,
                });
            }
        }
    }

    /**
     * Update mission progress
     */
    async updateMissionProgress(studentId: number, missionType: string, incrementBy: number = 1): Promise<void> {
        // First sync weekly missions if needed
        await this.syncWeeklyMissions(studentId);

        // Find active missions of this type
        const missions = await this.db.select()
            .from(schema.misiones)
            .where(and(
                eq(schema.misiones.tipo, missionType),
                eq(schema.misiones.activa, true)
            ));

        for (const mission of missions) {
            // Get or create progress record
            let progress = await this.db.select()
                .from(schema.progresoMisiones)
                .where(and(
                    eq(schema.progresoMisiones.estudianteId, studentId),
                    eq(schema.progresoMisiones.misionId, mission.id)
                ))
                .limit(1);

            if (progress.length === 0) {
                // If it's a non-daily mission and we are here, it might be a global mission
                // or a weekly one that was sync'd. 
                // For safety, only auto-create if it's daily. Weekly are created by sync.
                if (mission.esDiaria) {
                    await this.db.insert(schema.progresoMisiones).values({
                        estudianteId: studentId,
                        misionId: mission.id,
                        progresoActual: incrementBy,
                        completada: incrementBy >= (mission.objetivoValor || 1),
                        fechaCompletado: incrementBy >= (mission.objetivoValor || 1) ? new Date() : null,
                    });
                }
            } else if (!progress[0].completada) {
                // Update existing progress
                const newProgress = (progress[0].progresoActual || 0) + incrementBy;
                const isComplete = newProgress >= (mission.objetivoValor || 1);

                await this.db.update(schema.progresoMisiones)
                    .set({
                        progresoActual: newProgress,
                        completada: isComplete,
                        fechaCompletado: isComplete ? new Date() : null,
                    })
                    .where(eq(schema.progresoMisiones.id, progress[0].id));
            }
        }
    }

    /**
     * Sync weekly missions for Pro students
     */
    async syncWeeklyMissions(studentId: number): Promise<void> {
        // Check student plan
        const student = await this.db.select({ planId: schema.usuarios.planId })
            .from(schema.usuarios)
            .where(eq(schema.usuarios.id, studentId))
            .limit(1);

        if (student.length === 0 || student[0].planId !== 3) return; // Only Pro gets weekly sync

        // Get current week start (Monday)
        const now = new Date();
        const day = now.getDay() || 7; // Get current day of week (1=Mon, 7=Sun)
        const monday = new Date(now);
        monday.setHours(0, 0, 0, 0);
        monday.setDate(now.getDate() - (day - 1));

        // Check if student has missions for this week
        const currentMissions = await this.db.select()
            .from(schema.progresoMisiones)
            .where(and(
                eq(schema.progresoMisiones.estudianteId, studentId),
                eq(schema.progresoMisiones.semanaInicio, monday)
            ));

        if (currentMissions.length === 0) {
            // Assign weekly missions
            // 1. Dúo Dinámico (Login consecutive 2)
            // 2. Avance Imparable (View 4 contents)
            // 3. Trabajador (Complete 5 activities) - This one is seeded as global, but we can assign as weekly too

            const weeklyTypes = ['LOGIN_CONSECUTIVE_2', 'VIEW_CONTENT_4', 'COMPLETE_ACTIVITY'];
            for (const type of weeklyTypes) {
                const mission = await this.db.select()
                    .from(schema.misiones)
                    .where(and(eq(schema.misiones.tipo, type), eq(schema.misiones.activa, true)))
                    .limit(1);

                if (mission.length > 0) {
                    await this.db.insert(schema.progresoMisiones).values({
                        estudianteId: studentId,
                        misionId: mission[0].id,
                        semanaInicio: monday,
                        progresoActual: 0,
                        completada: false
                    });
                }
            }
        }
    }

    /**
     * Track content view
     */
    async trackContentView(studentId: number): Promise<void> {
        await this.updateMissionProgress(studentId, 'VIEW_CONTENT', 1);
        await this.updateMissionProgress(studentId, 'VIEW_CONTENT_4', 1);
    }

    /**
     * Claim mission reward
     */
    async claimMissionReward(studentId: number, missionId: number): Promise<{ success: boolean; xpAwarded: number }> {
        // Get mission
        const mission = await this.db.select()
            .from(schema.misiones)
            .where(eq(schema.misiones.id, missionId))
            .limit(1);

        if (mission.length === 0) {
            return { success: false, xpAwarded: 0 };
        }

        // Get progress
        const progress = await this.db.select()
            .from(schema.progresoMisiones)
            .where(and(
                eq(schema.progresoMisiones.estudianteId, studentId),
                eq(schema.progresoMisiones.misionId, missionId)
            ))
            .limit(1);

        if (progress.length === 0 || !progress[0].completada || progress[0].recompensaReclamada) {
            return { success: false, xpAwarded: 0 };
        }

        // Mark as claimed
        await this.db.update(schema.progresoMisiones)
            .set({ recompensaReclamada: true })
            .where(eq(schema.progresoMisiones.id, progress[0].id));

        // Award XP
        const xpAwarded = mission[0].xpRecompensa || 0;
        await this.awardXP(studentId, xpAwarded, `Misión completada: ${mission[0].titulo}`);

        return { success: true, xpAwarded };
    }

    /**
     * Seed initial achievements
     */
    async seedInitialAchievements(): Promise<void> {
        const achievements = [
            {
                titulo: 'Primeros Pasos',
                descripcion: 'Alcanza el nivel 2',
                icono: 'star',
                xpRequerida: 100,
                condicionTipo: 'LEVEL_REACHED',
                condicionValor: 2,
            },
            {
                titulo: 'Aprendiz',
                descripcion: 'Alcanza el nivel 5',
                icono: 'book',
                xpRequerida: 850,
                condicionTipo: 'LEVEL_REACHED',
                condicionValor: 5,
            },
            {
                titulo: 'Experto',
                descripcion: 'Alcanza el nivel 10',
                icono: 'trophy',
                xpRequerida: 4100,
                condicionTipo: 'LEVEL_REACHED',
                condicionValor: 10,
            },
            {
                titulo: 'Racha de Fuego',
                descripcion: 'Ingresa 3 días seguidos',
                icono: 'flame',
                xpRequerida: 0,
                condicionTipo: 'STREAK',
                condicionValor: 3,
            },
            {
                titulo: 'Dedicación Total',
                descripcion: 'Ingresa 7 días seguidos',
                icono: 'zap',
                xpRequerida: 0,
                condicionTipo: 'STREAK',
                condicionValor: 7,
            },
            {
                titulo: 'Coleccionista',
                descripcion: 'Acumula 1000 XP',
                icono: 'target',
                xpRequerida: 1000,
                condicionTipo: 'XP_TOTAL',
                condicionValor: 1000,
            },
        ];

        for (const achievement of achievements) {
            const existing = await this.db.select()
                .from(schema.logros)
                .where(eq(schema.logros.titulo, achievement.titulo))
                .limit(1);

            if (existing.length === 0) {
                await this.db.insert(schema.logros).values(achievement);
            }
        }
    }

    /**
     * Seed initial missions
     */
    async seedInitialMissions(): Promise<void> {
        const missions = [
            {
                tipo: 'DAILY_LOGIN',
                titulo: 'Login Diario',
                descripcion: 'Ingresa a la plataforma',
                xpRecompensa: 10,
                iconoUrl: 'login',
                objetivoValor: 1,
                esDiaria: true,
                activa: true,
            },
            {
                tipo: 'VIEW_CONTENT',
                titulo: 'Explorador',
                descripcion: 'Revisa 3 contenidos',
                xpRecompensa: 30,
                iconoUrl: 'eye',
                objetivoValor: 3,
                esDiaria: false,
                activa: true,
            },
            {
                tipo: 'COMPLETE_ACTIVITY',
                titulo: 'Trabajador',
                descripcion: 'Completa 5 actividades',
                xpRecompensa: 100,
                iconoUrl: 'check',
                objetivoValor: 5,
                esDiaria: false,
                activa: true,
            },
            {
                tipo: 'STREAK_3',
                titulo: 'Constancia',
                descripcion: 'Mantén una racha de 3 días',
                xpRecompensa: 50,
                iconoUrl: 'flame',
                objetivoValor: 1,
                esDiaria: false,
                activa: true,
            },
            {
                tipo: 'STREAK_7',
                titulo: 'Disciplina',
                descripcion: 'Mantén una racha de 7 días',
                xpRecompensa: 150,
                iconoUrl: 'zap',
                objetivoValor: 1,
                esDiaria: false,
                activa: true,
            },
            {
                tipo: 'LOGIN_CONSECUTIVE_2',
                titulo: 'Dúo Dinámico',
                descripcion: 'Ingresa 2 días seguidos',
                xpRecompensa: 40,
                iconoUrl: 'users',
                objetivoValor: 1,
                esDiaria: false,
                activa: true,
            },
            {
                tipo: 'VIEW_CONTENT_4',
                titulo: 'Avance Imparable',
                descripcion: 'Mira 4 contenidos seguidos',
                xpRecompensa: 80,
                iconoUrl: 'trending-up',
                objetivoValor: 4,
                esDiaria: false,
                activa: true,
            }
        ];

        for (const mission of missions) {
            const existing = await this.db.select()
                .from(schema.misiones)
                .where(eq(schema.misiones.titulo, mission.titulo))
                .limit(1);

            if (existing.length === 0) {
                await this.db.insert(schema.misiones).values(mission);
            }
        }
    }
}
