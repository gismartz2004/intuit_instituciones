import {
  Inject,
  Injectable,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { DRIZZLE_DB } from '../database/drizzle.provider';
import {
  modulos,
  niveles,
  contenidos,
  InsertModulo,
  InsertNivel,
  InsertContenido,
} from '../shared/schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../shared/schema';
import { eq, and } from 'drizzle-orm';

@Injectable()
export class ModulesService {
  constructor(@Inject(DRIZZLE_DB) private db: NodePgDatabase<typeof schema>) {}

  async createModule(data: InsertModulo) {
    const [newModule] = await this.db.insert(modulos).values(data).returning();
    return newModule;
  }

  async getModulesByProfessor(professorId: number) {
    // Get modules assigned to this professor
    const assignedModules = await this.db
      .select({
        module: schema.modulos,
      })
      .from(schema.asignaciones)
      .innerJoin(
        schema.modulos,
        eq(schema.asignaciones.moduloId, schema.modulos.id),
      )
      .where(eq(schema.asignaciones.profesorId, professorId));

    const modulesWithDetails = await Promise.all(
      assignedModules.map(async (row) => {
        const mod = row.module;

        // Get students for this module
        const studentAssignments = await this.db
          .select({
            user: schema.usuarios,
          })
          .from(schema.asignaciones)
          .innerJoin(
            schema.usuarios,
            eq(schema.asignaciones.estudianteId, schema.usuarios.id),
          )
          .where(eq(schema.asignaciones.moduloId, mod.id));

        return {
          ...mod,
          studentsCount: studentAssignments.length,
          students: studentAssignments.map((s) => s.user),
        };
      }),
    );

    return modulesWithDetails;
  }

  async getModuleById(id: number) {
    const [mod] = await this.db
      .select()
      .from(modulos)
      .where(eq(modulos.id, id));
    return mod;
  }

  async createLevel(data: InsertNivel) {
    const [newLevel] = await this.db.insert(niveles).values(data).returning();
    return newLevel;
  }

  async getLevelsByModule(moduleId: number) {
    return this.db
      .select()
      .from(niveles)
      .where(eq(niveles.moduloId, moduleId))
      .orderBy(niveles.orden);
  }

  async createContent(data: InsertContenido) {
    const [newContent] = await this.db
      .insert(contenidos)
      .values(data)
      .returning();
    return newContent;
  }

  async getContentsByLevel(levelId: number) {
    return this.db
      .select()
      .from(contenidos)
      .where(eq(contenidos.nivelId, levelId));
  }

  async getAllModules() {
    const _modules = await this.db.select().from(modulos);

    const modulesWithDetails = await Promise.all(
      _modules.map(async (mod) => {
        // Better approach: Get all assignments for this module, then fetch users.
        // Or simpler:
        const studentAssignments = await this.db
          .select({
            user: schema.usuarios,
          })
          .from(schema.asignaciones)
          .innerJoin(
            schema.usuarios,
            eq(schema.asignaciones.estudianteId, schema.usuarios.id),
          )
          .where(eq(schema.asignaciones.moduloId, mod.id));

        const professorAssignments = await this.db
          .select({
            user: schema.usuarios,
          })
          .from(schema.asignaciones)
          .innerJoin(
            schema.usuarios,
            eq(schema.asignaciones.profesorId, schema.usuarios.id),
          )
          .where(eq(schema.asignaciones.moduloId, mod.id));

        return {
          ...mod,
          studentsCount: studentAssignments.length,
          students: studentAssignments.map((s) => s.user),
          professors: professorAssignments.map((p) => p.user),
          professor:
            professorAssignments.length > 0
              ? professorAssignments[0].user.nombre
              : 'Sin asignar',
        };
      }),
    );

    return modulesWithDetails;
  }

  async assignUserToModule(data: {
    estudianteId?: number;
    profesorId?: number;
    moduloId: number;
  }) {
    // Check for existing assignment
    let updateCondition;
    if (data.estudianteId) {
      updateCondition = eq(schema.asignaciones.estudianteId, data.estudianteId);
    } else if (data.profesorId) {
      updateCondition = eq(schema.asignaciones.profesorId, data.profesorId);
    } else {
      throw new BadRequestException(
        'Debe proporcionar estudianteId o profesorId',
      );
    }

    const existing = await this.db
      .select()
      .from(schema.asignaciones)
      .where(
        and(eq(schema.asignaciones.moduloId, data.moduloId), updateCondition),
      )
      .limit(1);

    if (existing.length > 0) {
      throw new ConflictException('El usuario ya está asignado a este módulo.');
    }

    const [assignment] = await this.db
      .insert(schema.asignaciones)
      .values(data)
      .returning();
    return assignment;
  }

  async deleteModule(moduleId: number) {
    // 1. Delete assignments
    await this.db
      .delete(schema.asignaciones)
      .where(eq(schema.asignaciones.moduloId, moduleId));

    // 2. Get Levels to delete their contents first
    const levels = await this.db
      .select()
      .from(schema.niveles)
      .where(eq(schema.niveles.moduloId, moduleId));

    for (const level of levels) {
      await this.db
        .delete(schema.contenidos)
        .where(eq(schema.contenidos.nivelId, level.id));
      await this.db
        .delete(schema.actividades)
        .where(eq(schema.actividades.nivelId, level.id));
    }

    // 3. Delete Levels
    await this.db
      .delete(schema.niveles)
      .where(eq(schema.niveles.moduloId, moduleId));

    // 4. Delete Certificados
    await this.db
      .delete(schema.certificados)
      .where(eq(schema.certificados.moduloId, moduleId));

    // 5. Delete Module
    await this.db.delete(schema.modulos).where(eq(schema.modulos.id, moduleId));

    return { success: true };
  }
}
