import { Inject, Injectable } from '@nestjs/common';
import { DRIZZLE_DB } from '../../database/drizzle.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../shared/schema';
import { eq, and, sql } from 'drizzle-orm';
import { ExcelProcessorService } from '../../shared/services/excel-processor.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
    constructor(
        @Inject(DRIZZLE_DB) private db: NodePgDatabase<typeof schema>,
        private excelProcessor: ExcelProcessorService,
    ) { }

    /**
     * Get all students in the system (including specialists)
     */
    async getSystemStudents() {
        const students = await this.db
            .select({
                id: schema.usuarios.id,
                nombre: schema.usuarios.nombre,
                email: schema.usuarios.email,
                activo: schema.usuarios.activo,
                planId: schema.usuarios.planId,
                rol: schema.roles.nombreRol,
            })
            .from(schema.usuarios)
            .innerJoin(schema.roles, eq(schema.usuarios.roleId, schema.roles.id));

        // Filter for student-type roles
        return students.filter(s =>
            s.rol === 'Estudiante' ||
            s.rol === 'Especialista'
        );
    }

    /**
     * Get all professors in the system (including specialists)
     */
    async getSystemProfessors() {
        const professors = await this.db
            .select({
                id: schema.usuarios.id,
                nombre: schema.usuarios.nombre,
                email: schema.usuarios.email,
                activo: schema.usuarios.activo,
                rol: schema.roles.nombreRol,
            })
            .from(schema.usuarios)
            .innerJoin(schema.roles, eq(schema.usuarios.roleId, schema.roles.id));

        // Filter for professor-type roles
        return professors.filter(p =>
            p.rol === 'Profesor' ||
            p.rol === 'Especialista' ||
            p.rol === 'Profesor Especialista'
        );
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

                // Multi-professor logic (Primary source)
                const moduleProfessors = await this.db
                    .select({
                        id: schema.usuarios.id,
                        nombre: schema.usuarios.nombre,
                        email: schema.usuarios.email
                    })
                    .from(schema.moduloProfesores)
                    .innerJoin(schema.usuarios, eq(schema.moduloProfesores.profesorId, schema.usuarios.id))
                    .where(eq(schema.moduloProfesores.moduloId, mod.id));

                // Determine primary professor name for display
                const professorName = moduleProfessors.length > 0 ? moduleProfessors[0].nombre : null;

                return {
                    ...mod,
                    levelCount: levels.length,
                    studentCount: studentCount,
                    professorName: professorName,
                    professors: moduleProfessors,
                    professorCount: moduleProfessors.length,
                };
            }),
        );

        return modulesWithStats;
    }

    /**
     * Get all courses with stats
     */
    async getAllCourses() {
        const courses = await this.db.select().from(schema.cursos);

        const coursesWithStats = await Promise.all(
            courses.map(async (course) => {
                const courseModules = await this.db
                    .select()
                    .from(schema.modulos)
                    .where(eq(schema.modulos.cursoId, course.id));

                // Get all students assigned to ANY module of this course
                const moduleIds = courseModules.map(m => m.id);
                let studentCount = 0;
                let assignments: any[] = [];

                if (moduleIds.length > 0) {
                    assignments = await this.db
                        .select({
                            estudianteId: schema.asignaciones.estudianteId
                        })
                        .from(schema.asignaciones)
                        .where(sql`${schema.asignaciones.moduloId} IN (${sql.join(moduleIds, sql`, `)})`);

                    const uniqueStudents = new Set(assignments.map(a => a.estudianteId));
                    studentCount = uniqueStudents.size;
                }

                return {
                    ...course,
                    moduleCount: courseModules.length,
                    studentCount: studentCount,
                };
            }),
        );

        return coursesWithStats;
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
     * Get students assigned to a specific course (unique across all modules)
     */
    async getAssignmentsByCourse(courseId: number) {
        // 1. Get all modules for the course
        const courseModules = await this.db
            .select()
            .from(schema.modulos)
            .where(eq(schema.modulos.cursoId, courseId));

        const moduleIds = courseModules.map(m => m.id);
        if (moduleIds.length === 0) return [];

        // 2. Get unique students across all these modules
        return this.db
            .selectDistinct({
                id: schema.usuarios.id,
                nombre: schema.usuarios.nombre,
                email: schema.usuarios.email,
            })
            .from(schema.asignaciones)
            .innerJoin(
                schema.usuarios,
                eq(schema.asignaciones.estudianteId, schema.usuarios.id),
            )
            .where(sql`${schema.asignaciones.moduloId} IN (${sql.join(moduleIds, sql`, `)})`);
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
    /**
     * Assign a professor to all students in a module
     */
    async assignProfessorToModule(moduleId: number, professorId: number | null) {
        // Update the module's primary professor
        await this.db
            .update(schema.modulos)
            .set({ profesorId: professorId })
            .where(eq(schema.modulos.id, moduleId));

        // Sync student-level assignments
        await this.db
            .update(schema.asignaciones)
            .set({ profesorId: professorId })
            .where(eq(schema.asignaciones.moduloId, moduleId));

        // If a professor is being assigned (not null), also ensure they are in modulo_profesores
        if (professorId) {
            await this.addProfessorToModule(moduleId, professorId);
        } else {
            // If setting to null, we might want to keep the join table as is, 
            // but the UI typically wants a full unassign when selecting "Sin profesor"
            // For now, only the old primary assignment is cleared.
        }

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
     * Bulk assign all modules of a course
     */
    async bulkAssignCourse(courseId: number, studentIds: number[], professorId?: number) {
        console.log(`[DEBUG] Bulk assigning course ${courseId} to ${studentIds.length} students`);

        // 1. Get all modules for the course
        const courseModules = await this.db
            .select()
            .from(schema.modulos)
            .where(eq(schema.modulos.cursoId, courseId));

        if (courseModules.length === 0) {
            throw new Error('El curso no tiene módulos para asignar');
        }

        // 2. Assign each module
        let totalAssigned = 0;
        for (const mod of courseModules) {
            const result = await this.bulkAssignModules(mod.id, studentIds, professorId);
            if (result.success) {
                totalAssigned += (result.count || 0);
            }
        }

        return { success: true, modulesCount: courseModules.length, totalAssigned };
    }

    /**
     * Bulk unassign all modules of a course
     */
    async bulkUnassignCourse(courseId: number, studentId: number) {
        // 1. Get all modules for the course
        const courseModules = await this.db
            .select()
            .from(schema.modulos)
            .where(eq(schema.modulos.cursoId, courseId));

        // 2. Unassign each module
        for (const mod of courseModules) {
            await this.unassignModule(mod.id, studentId);
        }

        return { success: true };
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
            console.log(`[FULL RESET] Starting comprehensive reset for user ${userId}`);

            // 1. Delete progress and submissions
            await this.db.delete(schema.asignaciones).where(eq(schema.asignaciones.estudianteId, userId));
            await this.db.delete(schema.progresoNiveles).where(eq(schema.progresoNiveles.estudianteId, userId));
            await this.db.delete(schema.entregasHa).where(eq(schema.entregasHa.estudianteId, userId));
            await this.db.delete(schema.entregasRag).where(eq(schema.entregasRag.estudianteId, userId));
            await this.db.delete(schema.entregas).where(eq(schema.entregas.estudianteId, userId));
            await this.db.delete(schema.asistencia).where(eq(schema.asistencia.estudianteId, userId));

            // 2. Delete gamification and achievements
            await this.db.delete(schema.progresoMisiones).where(eq(schema.progresoMisiones.estudianteId, userId));
            await this.db.delete(schema.logrosDesbloqueados).where(eq(schema.logrosDesbloqueados.estudianteId, userId));
            await this.db.delete(schema.puntosLog).where(eq(schema.puntosLog.estudianteId, userId));

            try {
                await this.db.delete(schema.rankingAwards).where(eq(schema.rankingAwards.estudianteId, userId));
            } catch (e) { }

            try {
                await this.db.delete(schema.certificados).where(eq(schema.certificados.estudianteId, userId));
            } catch (e) { }

            // 3. Reset main gamification record
            const [gamif] = await this.db.select().from(schema.gamificacionEstudiante).where(eq(schema.gamificacionEstudiante.estudianteId, userId));
            if (gamif) {
                await this.db.update(schema.gamificacionEstudiante)
                    .set({ puntosDisponibles: 0, xpTotal: 0, rachaDias: 0, nivelActual: 1, ultimaRachaUpdate: null })
                    .where(eq(schema.gamificacionEstudiante.estudianteId, userId));
            }

            // 4. RESET USER ACCOUNT STATUS (Onboarding + Profile Defaults)
            await this.db.update(schema.usuarios)
                .set({
                    onboardingCompleted: false,
                    avatar: 'avatar_boy',
                    // Potentially reset other fields if needed, but onboarding is the most critical
                })
                .where(eq(schema.usuarios.id, userId));

            console.log(`[FULL RESET] User ${userId} reset to factory settings successfully`);
            return { success: true, message: 'Usuario reseteado completamente (incluye onboarding)' };
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

    /**
     * Create a new plan
     */
    async createPlan(payload: any) {
        const [plan] = await this.db.insert(schema.planes).values(payload).returning();
        return plan;
    }

    /**
     * Update an existing plan
     */
    async updatePlan(id: number, payload: any) {
        const [plan] = await this.db
            .update(schema.planes)
            .set(payload)
            .where(eq(schema.planes.id, id))
            .returning();
        return plan;
    }

    /**
     * Delete a plan
     */
    async deletePlan(id: number) {
        await this.db.delete(schema.planes).where(eq(schema.planes.id, id));
        return { success: true };
    }

    /**
     * Get all professors assigned to a module
     */
    async getModuleProfessors(moduleId: number) {
        return this.db
            .select({
                id: schema.usuarios.id,
                nombre: schema.usuarios.nombre,
                email: schema.usuarios.email,
            })
            .from(schema.moduloProfesores)
            .innerJoin(schema.usuarios, eq(schema.moduloProfesores.profesorId, schema.usuarios.id))
            .where(eq(schema.moduloProfesores.moduloId, moduleId));
    }

    /**
     * Add a professor to a module (multiple support)
     */
    async addProfessorToModule(moduleId: number, professorId: number) {
        // Check if already assigned
        const existing = await this.db
            .select()
            .from(schema.moduloProfesores)
            .where(and(
                eq(schema.moduloProfesores.moduloId, moduleId),
                eq(schema.moduloProfesores.profesorId, professorId)
            ))
            .limit(1);

        if (existing.length > 0) {
            return { success: true, message: 'El profesor ya está asignado' };
        }

        await this.db.insert(schema.moduloProfesores).values({
            moduloId: moduleId,
            profesorId: professorId,
        });

        return { success: true };
    }

    /**
     * Remove a professor from a module
     */
    async unassignProfessorFromModule(moduleId: number, professorId: number) {
        // 1. Remove from join table
        await this.db
            .delete(schema.moduloProfesores)
            .where(and(
                eq(schema.moduloProfesores.moduloId, moduleId),
                eq(schema.moduloProfesores.profesorId, professorId)
            ));

        // 2. Clear from modulos if primary
        await this.db
            .update(schema.modulos)
            .set({ profesorId: null })
            .where(and(
                eq(schema.modulos.id, moduleId),
                eq(schema.modulos.profesorId, professorId)
            ));

        // 3. Clear from asignaciones for this module
        await this.db
            .update(schema.asignaciones)
            .set({ profesorId: null })
            .where(and(
                eq(schema.asignaciones.moduloId, moduleId),
                eq(schema.asignaciones.profesorId, professorId)
            ));

        return { success: true };
    }
}
