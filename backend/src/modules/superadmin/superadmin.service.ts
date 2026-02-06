import { Inject, Injectable } from '@nestjs/common';
import { DRIZZLE_DB } from '../../database/drizzle.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../shared/schema';
import { eq, and, isNotNull } from 'drizzle-orm';
import { ExcelProcessorService } from '../../shared/services/excel-processor.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SuperadminService {
    constructor(
        @Inject(DRIZZLE_DB) private db: NodePgDatabase<typeof schema>,
        private excelProcessor: ExcelProcessorService,
    ) { }

    /**
     * Get all students in the system
     */
    async getSystemStudents() {
        return this.db
            .select({
                id: schema.usuarios.id,
                nombre: schema.usuarios.nombre,
                email: schema.usuarios.email,
                activo: schema.usuarios.activo,
            })
            .from(schema.usuarios)
            .innerJoin(schema.roles, eq(schema.usuarios.roleId, schema.roles.id))
            .where(eq(schema.roles.nombreRol, 'Estudiante'));
    }

    /**
     * Get all modules in the system
     */
    async getAllModules() {
        const modules = await this.db.select().from(schema.modulos);

        const modulesWithStats = await Promise.all(
            modules.map(async (mod) => {
                // Count levels
                const levels = await this.db
                    .select()
                    .from(schema.niveles)
                    .where(eq(schema.niveles.moduloId, mod.id));

                // Get all assignments for this module to count students and unique professors
                const allAssignments = await this.db
                    .select()
                    .from(schema.asignaciones)
                    .where(eq(schema.asignaciones.moduloId, mod.id));

                // Count unique students (where estudianteId is present)
                const studentCount = allAssignments.filter(a => a.estudianteId !== null).length;

                // Count unique professors (where profesorId is present)
                const uniqueProfessors = new Set(
                    allAssignments
                        .filter(a => a.profesorId !== null)
                        .map(a => a.profesorId)
                );

                return {
                    ...mod,
                    levelCount: levels.length,
                    studentCount: studentCount,
                    professorCount: uniqueProfessors.size,
                };
            }),
        );

        return modulesWithStats;
    }

    /**
     * Get complete content of a module (RAG, HA, PIM)
     */
    async getModuleContent(moduleId: number) {
        // Get module info
        const [module] = await this.db
            .select()
            .from(schema.modulos)
            .where(eq(schema.modulos.id, moduleId));

        if (!module) {
            throw new Error('Módulo no encontrado');
        }

        // Get all levels
        const levels = await this.db
            .select()
            .from(schema.niveles)
            .where(eq(schema.niveles.moduloId, moduleId));

        // For each level, get RAG, HA, and PIM
        const levelsWithContent = await Promise.all(
            levels.map(async (level) => {
                // Get RAG templates
                const ragTemplates = await this.db
                    .select()
                    .from(schema.plantillasRag)
                    .where(eq(schema.plantillasRag.nivelId, level.id));

                // Get HA templates
                const haTemplates = await this.db
                    .select()
                    .from(schema.plantillasHa)
                    .where(eq(schema.plantillasHa.nivelId, level.id));

                // Get PIM templates
                const pimTemplates = await this.db
                    .select()
                    .from(schema.plantillasPim)
                    .where(eq(schema.plantillasPim.nivelId, level.id));

                // Get contents
                const contents = await this.db
                    .select()
                    .from(schema.contenidos)
                    .where(eq(schema.contenidos.nivelId, level.id));

                // Get activities
                const activities = await this.db
                    .select()
                    .from(schema.actividades)
                    .where(eq(schema.actividades.nivelId, level.id));

                return {
                    ...level,
                    rag: ragTemplates,
                    ha: haTemplates,
                    pim: pimTemplates,
                    contents,
                    activities,
                };
            }),
        );

        return {
            module,
            levels: levelsWithContent,
        };
    }

    /**
     * Get all assignments in the system
     */
    async getAllAssignments() {
        const assignments = await this.db
            .select({
                assignment: schema.asignaciones,
                student: schema.usuarios,
                module: schema.modulos,
            })
            .from(schema.asignaciones)
            .leftJoin(
                schema.usuarios,
                eq(schema.asignaciones.estudianteId, schema.usuarios.id),
            )
            .leftJoin(
                schema.modulos,
                eq(schema.asignaciones.moduloId, schema.modulos.id),
            );

        return assignments;
    }

    /**
     * Get students assigned to a specific module
     */
    async getAssignmentsByModule(moduleId: number) {
        return this.db
            .select({
                id: schema.usuarios.id,
                nombre: schema.usuarios.nombre,
                email: schema.usuarios.email,
                fechaAsignacion: schema.asignaciones.fechaAsignacion,
            })
            .from(schema.asignaciones)
            .innerJoin(
                schema.usuarios,
                eq(schema.asignaciones.estudianteId, schema.usuarios.id),
            )
            .where(eq(schema.asignaciones.moduloId, moduleId));
    }

    /**
     * Unassign a module from a student
     */
    async unassignModule(moduleId: number, studentId: number) {
        await this.db
            .delete(schema.asignaciones)
            .where(
                and(
                    eq(schema.asignaciones.moduloId, moduleId),
                    eq(schema.asignaciones.estudianteId, studentId),
                ),
            );
        return { success: true };
    }

    /**
     * Bulk assign module to multiple students
     */
    async bulkAssignModules(moduleId: number, studentIds: number[]) {
        // Get existing assignments to avoid duplicates
        const existing = await this.db
            .select({ studentId: schema.asignaciones.estudianteId })
            .from(schema.asignaciones)
            .where(eq(schema.asignaciones.moduloId, moduleId));

        const existingIds = new Set(existing.map((e) => e.studentId));
        const newStudentIds = studentIds.filter((id) => !existingIds.has(id));

        if (newStudentIds.length === 0) {
            return { success: true, count: 0, message: 'Todos los estudiantes ya estaban asignados' };
        }

        const assignments = newStudentIds.map((studentId) => ({
            moduloId: moduleId,
            estudianteId: studentId,
            profesorId: null,
            fechaAsignacion: new Date(),
        }));

        await this.db.insert(schema.asignaciones).values(assignments);

        return { success: true, count: assignments.length };
    }

    /**
     * Preview students from Excel file
     */
    async previewStudentsFromExcel(fileBuffer: Buffer) {
        // Parse Excel
        const parsed = this.excelProcessor.parseStudentsFromExcel(fileBuffer);

        // Get existing emails for validation
        const existingUsers = await this.db.select().from(schema.usuarios);
        const existingEmails = existingUsers.map((u) => u.email || '');

        // Validate email uniqueness
        const studentsWithValidation =
            await this.excelProcessor.validateEmailUniqueness(
                parsed.students,
                existingEmails,
            );

        return {
            ...parsed,
            students: studentsWithValidation,
            validRows: studentsWithValidation.filter((s) => s.isValid).length,
            invalidRows: studentsWithValidation.filter((s) => !s.isValid).length,
            columns: this.excelProcessor.getExcelColumns(fileBuffer),
        };
    }

    /**
     * Import students from Excel file
     */
    async importStudentsFromExcel(
        fileBuffer: Buffer,
        onlyValid: boolean = true,
    ) {
        // Preview first to get validated data
        const preview = await this.previewStudentsFromExcel(fileBuffer);

        // Filter students to import
        const studentsToImport = onlyValid
            ? preview.students.filter((s) => s.isValid)
            : preview.students;

        if (studentsToImport.length === 0) {
            throw new Error('No hay estudiantes válidos para importar');
        }

        // Get role ID for student
        const [studentRole] = await this.db
            .select()
            .from(schema.roles)
            .where(eq(schema.roles.nombreRol, 'Estudiante'));

        // Get plan ID
        const plans = await this.db.select().from(schema.planes);
        const planMap = new Map(plans.map((p) => [p.nombrePlan, p.id]));

        // Hash passwords and prepare user data
        const usersToCreate = await Promise.all(
            studentsToImport.map(async (student) => {
                const hashedPassword = await bcrypt.hash(student.password, 10);
                const planId = planMap.get(student.plan) || 1; // Default to Basic

                return {
                    nombre: student.nombre,
                    email: student.email,
                    password: hashedPassword,
                    roleId: studentRole.id,
                    planId: planId,
                    emailPadre: student.emailPadre,
                    activo: true,
                };
            }),
        );

        // Insert users
        const createdUsers = await this.db
            .insert(schema.usuarios)
            .values(usersToCreate)
            .returning();

        return {
            success: true,
            imported: createdUsers.length,
            skipped: preview.students.length - createdUsers.length,
            users: createdUsers,
        };
    }

    /**
     * Get system statistics
     */
    async getSystemStats() {
        try {
            console.log('Fetching System Stats...');
            const modules = await this.db.select().from(schema.modulos);
            const students = await this.db
                .select()
                .from(schema.usuarios)
                .innerJoin(schema.roles, eq(schema.usuarios.roleId, schema.roles.id))
                .where(eq(schema.roles.nombreRol, 'Estudiante'));

            const professors = await this.db
                .select()
                .from(schema.usuarios)
                .innerJoin(schema.roles, eq(schema.usuarios.roleId, schema.roles.id))
                .where(eq(schema.roles.nombreRol, 'Profesor'));

            const assignments = await this.db.select().from(schema.asignaciones);

            return {
                totalModules: modules?.length || 0,
                totalStudents: students?.length || 0,
                totalProfessors: professors?.length || 0,
                totalAssignments: assignments?.length || 0,
            };
        } catch (error) {
            console.error('Error fetching system stats:', error);
            throw error;
        }
    }

    /**
     * Reset user progress to zero
     * Deletes: assignments, level progress, evidence, resets gamification
     */
    /**
     * Reset user progress to zero
     * Deletes: assignments, level progress, evidence, gamification stats, points log, etc.
     */
    async resetUserProgress(userId: number) {
        try {
            console.log(`[RESET] Starting reset for user ${userId}`);

            // 1. Delete Assignments
            await this.db
                .delete(schema.asignaciones)
                .where(eq(schema.asignaciones.estudianteId, userId));

            // 2. Delete Level Progress
            await this.db
                .delete(schema.progresoNiveles)
                .where(eq(schema.progresoNiveles.estudianteId, userId));

            // 3. Delete HA Evidence
            await this.db
                .delete(schema.entregasHa)
                .where(eq(schema.entregasHa.estudianteId, userId));

            // 4. Delete RAG Evidence
            await this.db
                .delete(schema.entregasRag)
                .where(eq(schema.entregasRag.estudianteId, userId));

            // 5. Delete Generic Deliveries (Assignments)
            await this.db
                .delete(schema.entregas)
                .where(eq(schema.entregas.estudianteId, userId));

            // 6. Delete Mission Progress
            await this.db
                .delete(schema.progresoMisiones)
                .where(eq(schema.progresoMisiones.estudianteId, userId));

            // 7. Delete Unlocked Achievements
            await this.db
                .delete(schema.logrosDesbloqueados)
                .where(eq(schema.logrosDesbloqueados.estudianteId, userId));

            // 7.1 Delete Ranking Awards (Dependent on PuntosLog)
            try {
                await this.db
                    .delete(schema.rankingAwards)
                    .where(eq(schema.rankingAwards.estudianteId, userId));
            } catch (e) {
                console.log('Error deleting ranking awards (might not exist):', e);
            }

            // 7.2 Delete Certificates
            try {
                await this.db
                    .delete(schema.certificados)
                    .where(eq(schema.certificados.estudianteId, userId));
            } catch (e) {
                console.log('Error deleting certificates (might not exist):', e);
            }

            // 8. Delete Points Log (History)
            await this.db
                .delete(schema.puntosLog)
                .where(eq(schema.puntosLog.estudianteId, userId));

            // 9. Reset Gamification Stats (Update or Insert)
            const existingGamification = await this.db
                .select()
                .from(schema.gamificacionEstudiante)
                .where(eq(schema.gamificacionEstudiante.estudianteId, userId))
                .limit(1);

            if (existingGamification.length > 0) {
                await this.db
                    .update(schema.gamificacionEstudiante)
                    .set({
                        puntosDisponibles: 0,
                        xpTotal: 0,
                        rachaDias: 0,
                        nivelActual: 1,
                    })
                    .where(eq(schema.gamificacionEstudiante.estudianteId, userId));
            } else {
                await this.db.insert(schema.gamificacionEstudiante).values({
                    estudianteId: userId,
                    puntosDisponibles: 0,
                    xpTotal: 0,
                    rachaDias: 0,
                    nivelActual: 1,
                });
            }

            console.log(`[RESET] Successful reset for user ${userId}`);
            return {
                success: true,
                message: 'Progreso del usuario reseteado exitosamente',
            };
        } catch (error) {
            console.error(`[RESET ERROR] Failed to reset user ${userId}:`, error);
            throw error; // Re-throw to be caught by allSettled
        }
    }

    /**
     * Bulk reset multiple users
     */
    async bulkResetUsers(userIds: number[]) {
        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return {
                success: false,
                message: 'No se proporcionaron IDs válidos',
                successful: 0,
                failed: 0
            };
        }

        const results = await Promise.allSettled(
            userIds.map((id) => this.resetUserProgress(id)),
        );

        const successful = results.filter((r) => r.status === 'fulfilled').length;
        const failed = results.filter((r) => r.status === 'rejected').length;

        return {
            success: true,
            message: `${successful} usuarios reseteados, ${failed} fallidos`,
            successful,
            failed,
        };
    }
}
