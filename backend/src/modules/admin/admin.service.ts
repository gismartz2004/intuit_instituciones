import { Inject, Injectable } from '@nestjs/common';
import { DRIZZLE_DB } from '../../database/drizzle.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../shared/schema';
import { eq, and } from 'drizzle-orm';
import { ExcelProcessorService } from '../../shared/services/excel-processor.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
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
     * Get all professors in the system
     */
    async getSystemProfessors() {
        return this.db
            .select({
                id: schema.usuarios.id,
                nombre: schema.usuarios.nombre,
                email: schema.usuarios.email,
                activo: schema.usuarios.activo,
            })
            .from(schema.usuarios)
            .innerJoin(schema.roles, eq(schema.usuarios.roleId, schema.roles.id))
            .where(eq(schema.roles.nombreRol, 'Profesor'));
    }

    /**
     * Get all modules in the system with stats
     */
    async getAllModules() {
        const modules = await this.db.select().from(schema.modulos);

        const modulesWithStats = await Promise.all(
            modules.map(async (mod) => {
                const levels = await this.db
                    .select()
                    .from(schema.niveles)
                    .where(eq(schema.niveles.moduloId, mod.id));

                const allAssignments = await this.db
                    .select()
                    .from(schema.asignaciones)
                    .where(eq(schema.asignaciones.moduloId, mod.id));

                const studentCount = allAssignments.filter(a => a.estudianteId !== null).length;

                let professorName = null;
                if (mod.profesorId) {
                    const [prof] = await this.db
                        .select({ nombre: schema.usuarios.nombre })
                        .from(schema.usuarios)
                        .where(eq(schema.usuarios.id, mod.profesorId));
                    professorName = prof?.nombre || null;
                }

                return {
                    ...mod,
                    levelCount: levels.length,
                    studentCount: studentCount,
                    professorName: professorName,
                };
            }),
        );

        return modulesWithStats;
    }

    /**
     * Get complete content of a module (RAG, HA, PIM)
     */
    async getModuleContent(moduleId: number) {
        const [module] = await this.db
            .select()
            .from(schema.modulos)
            .where(eq(schema.modulos.id, moduleId));

        if (!module) {
            throw new Error('Módulo no encontrado');
        }

        const levels = await this.db
            .select()
            .from(schema.niveles)
            .where(eq(schema.niveles.moduloId, moduleId));

        const levelsWithContent = await Promise.all(
            levels.map(async (level) => {
                const ragTemplates = await this.db
                    .select()
                    .from(schema.plantillasRag)
                    .where(eq(schema.plantillasRag.nivelId, level.id));

                const haTemplates = await this.db
                    .select()
                    .from(schema.plantillasHa)
                    .where(eq(schema.plantillasHa.nivelId, level.id));

                const pimTemplates = await this.db
                    .select()
                    .from(schema.plantillasPim)
                    .where(eq(schema.plantillasPim.nivelId, level.id));

                const contents = await this.db
                    .select()
                    .from(schema.contenidos)
                    .where(eq(schema.contenidos.nivelId, level.id));

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
     * Get all assignments
     */
    async getAllAssignments() {
        return this.db
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
     * Unassign a module
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
     * Assign a professor to all students in a module
     */
    async assignProfessorToModule(moduleId: number, professorId: number) {
        await this.db
            .update(schema.modulos)
            .set({ profesorId: professorId })
            .where(eq(schema.modulos.id, moduleId));

        // Also sync existing assignments for this module
        await this.db
            .update(schema.asignaciones)
            .set({ profesorId: professorId })
            .where(eq(schema.asignaciones.moduloId, moduleId));

        return { success: true };
    }

    /**
     * Bulk assign
     */
    async bulkAssignModules(moduleId: number, studentIds: number[], professorId?: number) {
        const existing = await this.db
            .select({ studentId: schema.asignaciones.estudianteId })
            .from(schema.asignaciones)
            .where(eq(schema.asignaciones.moduloId, moduleId));

        const existingIds = new Set(existing.map((e) => e.studentId));
        const newStudentIds = studentIds.filter((id) => !existingIds.has(id));

        if (newStudentIds.length === 0) {
            return { success: true, count: 0, message: 'Todos los estudiantes ya estaban asignados' };
        }

        // Check if module has a professor assigned
        const [module] = await this.db.select().from(schema.modulos).where(eq(schema.modulos.id, moduleId));
        const effectiveProfessorId = professorId || module?.profesorId || null;

        const assignments = newStudentIds.map((studentId) => ({
            moduloId: moduleId,
            estudianteId: studentId,
            profesorId: effectiveProfessorId,
            fechaAsignacion: new Date(),
        }));

        console.log(`[DEBUG] Bulk assigning ${assignments.length} students to module ${moduleId} with professor ${professorId}`);
        await this.db.insert(schema.asignaciones).values(assignments);

        return { success: true, count: assignments.length };
    }

    /**
     * Excel Previews
     */
    async previewStudentsFromExcel(fileBuffer: Buffer) {
        const parsed = this.excelProcessor.parseStudentsFromExcel(fileBuffer);
        const existingUsers = await this.db.select().from(schema.usuarios);
        const existingEmails = existingUsers.map((u) => u.email || '');

        const studentsWithValidation = await this.excelProcessor.validateEmailUniqueness(
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
     * Excel Import
     */
    async importStudentsFromExcel(fileBuffer: Buffer, onlyValid: boolean = true) {
        const preview = await this.previewStudentsFromExcel(fileBuffer);
        const studentsToImport = onlyValid
            ? preview.students.filter((s) => s.isValid)
            : preview.students;

        if (studentsToImport.length === 0) {
            throw new Error('No hay estudiantes válidos para importar');
        }

        const [studentRole] = await this.db
            .select()
            .from(schema.roles)
            .where(eq(schema.roles.nombreRol, 'Estudiante'));

        const planes = await this.db.select().from(schema.planes);
        const planMap = new Map(planes.map((p) => [p.nombrePlan, p.id]));

        const usersToCreate = await Promise.all(
            studentsToImport.map(async (student) => {
                const hashedPassword = await bcrypt.hash(student.password, 10);
                const planId = planMap.get(student.plan) || 1;

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

        const createdUsers = await this.db
            .insert(schema.usuarios)
            .values(usersToCreate)
            .returning();

        return {
            success: true,
            imported: createdUsers.length,
            users: createdUsers,
        };
    }

    /**
     * Get Stats
     */
    async getSystemStats() {
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
    }

    /**
     * Get Plans from DB
     */
    async getPlanes() {
        return this.db.select().from(schema.planes);
    }

    /**
     * Reset user progress
     */
    async resetUserProgress(userId: number) {
        try {
            await this.db.delete(schema.asignaciones).where(eq(schema.asignaciones.estudianteId, userId));
            await this.db.delete(schema.progresoNiveles).where(eq(schema.progresoNiveles.estudianteId, userId));
            await this.db.delete(schema.entregasHa).where(eq(schema.entregasHa.estudianteId, userId));
            await this.db.delete(schema.entregasRag).where(eq(schema.entregasRag.estudianteId, userId));
            await this.db.delete(schema.entregas).where(eq(schema.entregas.estudianteId, userId));
            await this.db.delete(schema.progresoMisiones).where(eq(schema.progresoMisiones.estudianteId, userId));
            await this.db.delete(schema.logrosDesbloqueados).where(eq(schema.logrosDesbloqueados.estudianteId, userId));

            try {
                await this.db.delete(schema.rankingAwards).where(eq(schema.rankingAwards.estudianteId, userId));
            } catch (e) { }

            try {
                await this.db.delete(schema.certificados).where(eq(schema.certificados.estudianteId, userId));
            } catch (e) { }

            await this.db.delete(schema.puntosLog).where(eq(schema.puntosLog.estudianteId, userId));

            const [gamif] = await this.db.select().from(schema.gamificacionEstudiante).where(eq(schema.gamificacionEstudiante.estudianteId, userId));
            if (gamif) {
                await this.db.update(schema.gamificacionEstudiante)
                    .set({ puntosDisponibles: 0, xpTotal: 0, rachaDias: 0, nivelActual: 1 })
                    .where(eq(schema.gamificacionEstudiante.estudianteId, userId));
            }

            return { success: true, message: 'Usuario reseteado exitosamente' };
        } catch (error) {
            console.error(`[RESET ERROR] ${userId}:`, error);
            throw error;
        }
    }

    /**
     * Bulk Reset
     */
    async bulkResetUsers(userIds: number[]) {
        if (!userIds || userIds.length === 0) return { success: false, message: 'No IDs provided' };
        const results = await Promise.allSettled(userIds.map(id => this.resetUserProgress(id)));
        const successful = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;
        return { success: true, message: `${successful} reseteados, ${failed} fallidos`, successful, failed };
    }
}
