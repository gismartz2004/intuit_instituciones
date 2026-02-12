import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { DRIZZLE_DB } from '../../database/drizzle.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../shared/schema';
import { eq, and, asc } from 'drizzle-orm';

@Injectable()
export class SpecialistProfessorService {
    constructor(
        @Inject(DRIZZLE_DB) private db: NodePgDatabase<typeof schema>,
    ) { }

    async getModulesByProfessor(professorId: number) {
        return await this.db
            .select()
            .from(schema.modulos)
            .where(
                and(
                    eq(schema.modulos.profesorId, professorId),
                    eq(schema.modulos.categoria, 'specialization')
                )
            );
    }

    async createModule(data: { nombreModulo: string; duracionDias: number; profesorId: number; especializacion?: string }) {
        const [newModule] = await this.db
            .insert(schema.modulos)
            .values({
                nombreModulo: data.nombreModulo,
                duracionDias: data.duracionDias,
                profesorId: data.profesorId,
                categoria: 'specialization',
                especializacion: data.especializacion,
            })
            .returning();
        return newModule;
    }

    async getLevelsByModule(moduleId: number) {
        return await this.db
            .select()
            .from(schema.niveles)
            .where(eq(schema.niveles.moduloId, moduleId))
            .orderBy(asc(schema.niveles.orden));
    }

    async createLevel(moduleId: number, data: { tituloNivel: string; orden: number }) {
        const [newLevel] = await this.db
            .insert(schema.niveles)
            .values({
                moduloId: moduleId,
                tituloNivel: data.tituloNivel,
                orden: data.orden,
            })
            .returning();
        return newLevel;
    }

    async deleteLevel(levelId: number) {
        // Cascade manually since we have many templates
        await this.db.delete(schema.plantillasBd).where(eq(schema.plantillasBd.nivelId, levelId));
        await this.db.delete(schema.plantillasIt).where(eq(schema.plantillasIt.nivelId, levelId));
        await this.db.delete(schema.plantillasPic).where(eq(schema.plantillasPic.nivelId, levelId));
        await this.db.delete(schema.plantillasRag).where(eq(schema.plantillasRag.nivelId, levelId));
        await this.db.delete(schema.plantillasHa).where(eq(schema.plantillasHa.nivelId, levelId));

        return await this.db
            .delete(schema.niveles)
            .where(eq(schema.niveles.id, levelId))
            .returning();
    }

    // Template BD
    async saveBdTemplate(levelId: number, data: any) {
        const { id, ...payload } = data;
        const existing = await this.db
            .select()
            .from(schema.plantillasBd)
            .where(eq(schema.plantillasBd.nivelId, levelId))
            .then(res => res[0]);

        if (existing) {
            const [updated] = await this.db
                .update(schema.plantillasBd)
                .set(payload)
                .where(eq(schema.plantillasBd.id, existing.id))
                .returning();
            return updated;
        } else {
            const [inserted] = await this.db
                .insert(schema.plantillasBd)
                .values({ ...payload, nivelId: levelId })
                .returning();
            return inserted;
        }
    }

    async getBdTemplate(levelId: number) {
        return await this.db
            .select()
            .from(schema.plantillasBd)
            .where(eq(schema.plantillasBd.nivelId, levelId))
            .then(res => res[0] || null);
    }

    // Template IT
    async saveItTemplate(levelId: number, data: any) {
        const { id, ...payload } = data;
        const existing = await this.db
            .select()
            .from(schema.plantillasIt)
            .where(eq(schema.plantillasIt.nivelId, levelId))
            .then(res => res[0]);

        if (existing) {
            const [updated] = await this.db
                .update(schema.plantillasIt)
                .set(payload)
                .where(eq(schema.plantillasIt.id, existing.id))
                .returning();
            return updated;
        } else {
            const [inserted] = await this.db
                .insert(schema.plantillasIt)
                .values({ ...payload, nivelId: levelId })
                .returning();
            return inserted;
        }
    }

    async getItTemplate(levelId: number) {
        return await this.db
            .select()
            .from(schema.plantillasIt)
            .where(eq(schema.plantillasIt.nivelId, levelId))
            .then(res => res[0] || null);
    }

    // Template PIC
    async savePicTemplate(levelId: number, data: any) {
        const { id, ...payload } = data;
        const existing = await this.db
            .select()
            .from(schema.plantillasPic)
            .where(eq(schema.plantillasPic.nivelId, levelId))
            .then(res => res[0]);

        if (existing) {
            const [updated] = await this.db
                .update(schema.plantillasPic)
                .set(payload)
                .where(eq(schema.plantillasPic.id, existing.id))
                .returning();
            return updated;
        } else {
            const [inserted] = await this.db
                .insert(schema.plantillasPic)
                .values({ ...payload, nivelId: levelId })
                .returning();
            return inserted;
        }
    }

    async getPicTemplate(levelId: number) {
        return await this.db
            .select()
            .from(schema.plantillasPic)
            .where(eq(schema.plantillasPic.nivelId, levelId))
            .then(res => res[0] || null);
    }
}
