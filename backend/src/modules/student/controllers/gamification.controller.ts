import { Controller, Get, Post, Param, ParseIntPipe } from '@nestjs/common';
import { GamificationService } from '../services/gamification.service';
import { eq } from 'drizzle-orm';
import * as schema from '../../../shared/schema';

@Controller('student/:studentId/gamification')
export class GamificationController {
    constructor(private readonly gamificationService: GamificationService) { }

    @Get('missions')
    async getMissions(@Param('studentId', ParseIntPipe) studentId: number) {
        // Get all active missions
        const missions = await this.gamificationService['db'].select()
            .from(schema.misiones)
            .where(eq(schema.misiones.activa, true));

        // Get student's progress for each mission
        const progress = await this.gamificationService['db'].select()
            .from(schema.progresoMisiones)
            .where(eq(schema.progresoMisiones.estudianteId, studentId));

        return missions.map(mission => {
            const missionProgress = progress.find(p => p.misionId === mission.id);
            return {
                ...mission,
                progresoActual: missionProgress?.progresoActual || 0,
                completada: missionProgress?.completada || false,
                recompensaReclamada: missionProgress?.recompensaReclamada || false,
            };
        });
    }

    @Post('missions/:missionId/claim')
    async claimMission(
        @Param('studentId', ParseIntPipe) studentId: number,
        @Param('missionId', ParseIntPipe) missionId: number
    ) {
        return this.gamificationService.claimMissionReward(studentId, missionId);
    }

    @Get('achievements')
    async getAchievements(@Param('studentId', ParseIntPipe) studentId: number) {
        // Get unlocked achievements
        const achievements = await this.gamificationService['db'].select({
            logro: schema.logros,
            fechaDesbloqueo: schema.logrosDesbloqueados.fechaDesbloqueo
        })
            .from(schema.logrosDesbloqueados)
            .innerJoin(schema.logros, eq(schema.logrosDesbloqueados.logroId, schema.logros.id))
            .where(eq(schema.logrosDesbloqueados.estudianteId, studentId));

        return achievements.map(a => ({
            ...a.logro,
            unlockedAt: a.fechaDesbloqueo
        }));
    }
}
