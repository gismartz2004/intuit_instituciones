import { Inject, Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { DRIZZLE_DB } from '../../database/drizzle.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../shared/schema';
import { eq, and, asc } from 'drizzle-orm';

@Injectable()
export class ProfessorService {
    constructor(@Inject(DRIZZLE_DB) private db: NodePgDatabase<typeof schema>) { }

    async getModulesByProfessor(professorId: number) {
        const assignedModules = await this.db.select({
            module: schema.modulos
        })
            .from(schema.asignaciones)
            .innerJoin(schema.modulos, eq(schema.asignaciones.moduloId, schema.modulos.id))
            .where(eq(schema.asignaciones.profesorId, professorId));

        const modulesWithDetails = await Promise.all(assignedModules.map(async (row) => {
            const mod = row.module;

            const studentAssignments = await this.db.select({
                user: schema.usuarios
            }).from(schema.asignaciones)
                .innerJoin(schema.usuarios, eq(schema.asignaciones.estudianteId, schema.usuarios.id))
                .where(eq(schema.asignaciones.moduloId, mod.id));

            return {
                ...mod,
                studentsCount: studentAssignments.length,
                students: studentAssignments.map(s => s.user),
                levels: await this.db.select().from(schema.niveles).where(eq(schema.niveles.moduloId, mod.id)).orderBy(asc(schema.niveles.orden))
            };
        }));

        return modulesWithDetails;
    }

    async createStudentAndAssign(data: { name: string, email: string, password: string, moduleId: number }) {
        // 1. Create User
        // Check if email exists
        const existing = await this.db.select().from(schema.usuarios).where(eq(schema.usuarios.email, data.email));
        if (existing.length > 0) {
            throw new ConflictException("El email ya está registrado");
        }

        const [newUser] = await this.db.insert(schema.usuarios).values({
            nombre: data.name,
            email: data.email,
            password: data.password, // Plain text as per current simplified implementation
            roleId: 3, // Student
            planId: 1, // Basic
            activo: true
        }).returning();

        // 2. Assign to Module
        await this.db.insert(schema.asignaciones).values({
            estudianteId: newUser.id,
            moduloId: data.moduleId
        });

        return newUser;
    }

    // Level Management
    async createLevel(moduleId: number, data: { tituloNivel: string, orden: number }) {
        const [newLevel] = await this.db.insert(schema.niveles).values({
            moduloId: moduleId,
            tituloNivel: data.tituloNivel,
            orden: data.orden
        }).returning();
        return newLevel;
    }

    async getLevelsByModule(moduleId: number) {
        const levels = await this.db.select()
            .from(schema.niveles)
            .where(eq(schema.niveles.moduloId, moduleId))
            .orderBy(asc(schema.niveles.orden));

        // For each level, get its contents
        const levelsWithContents = await Promise.all(levels.map(async (level) => {
            const contents = await this.db.select()
                .from(schema.contenidos)
                .where(eq(schema.contenidos.nivelId, level.id));

            return {
                ...level,
                contents
            };
        }));

        return levelsWithContents;
    }

    // Content Management
    async createContent(levelId: number, data: { tipo: string, urlRecurso: string }) {
        const [newContent] = await this.db.insert(schema.contenidos).values({
            nivelId: levelId,
            tipo: data.tipo,
            urlRecurso: data.urlRecurso
        }).returning();
        return newContent;
    }

    async getContentsByLevel(levelId: number) {
        return await this.db.select()
            .from(schema.contenidos)
            .where(eq(schema.contenidos.nivelId, levelId));
    }

    async deleteContent(contentId: number) {
        await this.db.delete(schema.contenidos)
            .where(eq(schema.contenidos.id, contentId));
        return { success: true };
    }

    async getLevelContents(levelId: number) {
        const contents = await this.db.select()
            .from(schema.contenidos)
            .where(eq(schema.contenidos.nivelId, levelId));
        return contents;
    }

    // Resource Library
    async createResource(data: { profesorId: number, nombre: string, tipo: string, url: string, peso: number }) {
        const [resource] = await this.db.insert(schema.recursos).values({
            profesorId: data.profesorId,
            nombre: data.nombre,
            tipo: data.tipo,
            url: data.url,
            peso: data.peso
        }).returning();
        return resource;
    }

    async getResources(profesorId: number) {
        return await this.db.select()
            .from(schema.recursos)
            //.where(eq(schema.recursos.profesorId, profesorId)) // Descomentar cuando tengamos auth real
            .orderBy(asc(schema.recursos.fechaSubida));
    }
}
