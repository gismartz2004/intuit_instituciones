import { Injectable, Logger, Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DRIZZLE_DB } from '../../database/drizzle.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../shared/schema';
import { eq, isNull, and, lt } from 'drizzle-orm';
import { EmailService } from './email.service';

@Injectable()
export class SchedulerService {
    private readonly logger = new Logger(SchedulerService.name);

    constructor(
        @Inject(DRIZZLE_DB) private db: NodePgDatabase<typeof schema>,
        private emailService: EmailService
    ) { }

    /**
     * Check every day at 9 AM for missing content from professors
     */
    @Cron(CronExpression.EVERY_DAY_AT_9AM)
    async checkProfessorCompliance() {
        this.logger.log('Running scheduled check for professor content compliance...');

        // Find assignments where professor is assigned but module has no levels
        const assignments = await this.db
            .select({
                profeEmail: schema.usuarios.email,
                profeNombre: schema.usuarios.nombre,
                moduloNombre: schema.modulos.nombreModulo,
                moduloId: schema.modulos.id,
                fechaAsignacion: schema.asignaciones.fechaAsignacion,
            })
            .from(schema.asignaciones)
            .innerJoin(schema.usuarios, eq(schema.asignaciones.profesorId, schema.usuarios.id))
            .innerJoin(schema.modulos, eq(schema.asignaciones.moduloId, schema.modulos.id));

        for (const assign of assignments) {
            // Check if module has levels
            const levels = await this.db
                .select()
                .from(schema.niveles)
                .where(eq(schema.niveles.moduloId, assign.moduloId));

            if (levels.length === 0) {
                // If it's been more than 3 days since assignment
                const threeDaysAgo = new Date();
                threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

                if (assign.fechaAsignacion && new Date(assign.fechaAsignacion) < threeDaysAgo) {
                    await this.emailService.sendProfessorContentReminder(
                        assign.profeEmail || '',
                        assign.profeNombre || 'Docente',
                        assign.moduloNombre || 'Módulo'
                    );
                }
            }
        }
    }

    /**
     * Check every day at 9 AM for student inactivity
     */
    @Cron(CronExpression.EVERY_DAY_AT_9AM)
    async checkStudentActivity() {
        this.logger.log('Running scheduled check for student activity...');

        const fiveDaysAgo = new Date();
        fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

        // Find students who haven't updated their progress in 5 days
        const inactiveStudents = await this.db
            .select({
                estudianteNombre: schema.usuarios.nombre,
                emailPadre: schema.usuarios.emailPadre,
                moduloNombre: schema.modulos.nombreModulo,
                porcentaje: schema.progresoNiveles.porcentajeCompletado,
                fechaInicio: schema.progresoNiveles.fechaInicio,
            })
            .from(schema.progresoNiveles)
            .innerJoin(schema.usuarios, eq(schema.progresoNiveles.estudianteId, schema.usuarios.id))
            .innerJoin(schema.niveles, eq(schema.progresoNiveles.nivelId, schema.niveles.id))
            .innerJoin(schema.modulos, eq(schema.niveles.moduloId, schema.modulos.id))
            .where(
                and(
                    eq(schema.progresoNiveles.completado, false),
                    lt(schema.progresoNiveles.fechaInicio, fiveDaysAgo)
                )
            );

        for (const stud of inactiveStudents) {
            if (stud.emailPadre) {
                await this.emailService.sendParentInactivityAlert(
                    stud.emailPadre,
                    stud.estudianteNombre || 'Estudiante',
                    stud.moduloNombre || 'Módulo'
                );
            }
        }
    }
}
