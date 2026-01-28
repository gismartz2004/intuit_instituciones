import { Inject, Injectable } from '@nestjs/common';
import { DRIZZLE_DB } from '../../database/drizzle.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../shared/schema';
import { eq } from 'drizzle-orm';
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
            .where(eq(schema.roles.nombreRol, 'student'));
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

                // Count students assigned
                const assignments = await this.db
                    .select()
                    .from(schema.asignaciones)
                    .where(eq(schema.asignaciones.moduloId, mod.id));

                // Count professors assigned
                const professors = await this.db
                    .select()
                    .from(schema.asignaciones)
                    .where(eq(schema.asignaciones.moduloId, mod.id))
                    .groupBy(schema.asignaciones.profesorId);

                return {
                    ...mod,
                    levelCount: levels.length,
                    studentCount: assignments.length,
                    professorCount: professors.length,
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
     * Bulk assign module to multiple students
     */
    async bulkAssignModules(moduleId: number, studentIds: number[]) {
        const assignments = studentIds.map((studentId) => ({
            moduloId: moduleId,
            estudianteId: studentId,
            profesorId: null, // Or get from context
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
            .where(eq(schema.roles.nombreRol, 'student'));

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
        const modules = await this.db.select().from(schema.modulos);
        const students = await this.db
            .select()
            .from(schema.usuarios)
            .innerJoin(schema.roles, eq(schema.usuarios.roleId, schema.roles.id))
            .where(eq(schema.roles.nombreRol, 'student'));

        const professors = await this.db
            .select()
            .from(schema.usuarios)
            .innerJoin(schema.roles, eq(schema.usuarios.roleId, schema.roles.id))
            .where(eq(schema.roles.nombreRol, 'professor'));

        const assignments = await this.db.select().from(schema.asignaciones);

        return {
            totalModules: modules?.length || 0,
            totalStudents: students?.length || 0,
            totalProfessors: professors?.length || 0,
            totalAssignments: assignments?.length || 0,
        };
    }
}
