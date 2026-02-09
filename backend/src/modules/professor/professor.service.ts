import {
  Inject,
  Injectable,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { DRIZZLE_DB } from '../../database/drizzle.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../shared/schema';
import { eq, and, asc, sql, like, or } from 'drizzle-orm';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class ProfessorService {
  constructor(
    @Inject(DRIZZLE_DB) private db: NodePgDatabase<typeof schema>,
    private readonly storageService: StorageService,
  ) { }

  async getModulesByProfessor(professorId: number) {
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
          levels: await this.db
            .select()
            .from(schema.niveles)
            .where(eq(schema.niveles.moduloId, mod.id))
            .orderBy(asc(schema.niveles.orden)),
        };
      }),
    );

    return modulesWithDetails;
  }

  async createStudentAndAssign(data: {
    name: string;
    email: string;
    password: string;
    moduleId: number;
  }) {
    // 1. Create User
    // Check if email exists
    const existing = await this.db
      .select()
      .from(schema.usuarios)
      .where(eq(schema.usuarios.email, data.email));
    if (existing.length > 0) {
      throw new ConflictException('El email ya está registrado');
    }

    const [newUser] = await this.db
      .insert(schema.usuarios)
      .values({
        nombre: data.name,
        email: data.email,
        password: data.password, // Plain text as per current simplified implementation
        roleId: 3, // Student
        planId: 1, // Basic
        activo: true,
      })
      .returning();

    // 2. Assign to Module
    await this.db.insert(schema.asignaciones).values({
      estudianteId: newUser.id,
      moduloId: data.moduleId,
    });

    return newUser;
  }

  // Level Management
  async createLevel(
    moduleId: number,
    data: { tituloNivel: string; orden: number },
  ) {
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

  async getLevelsByModule(moduleId: number) {
    const levels: schema.Nivel[] = await this.db
      .select()
      .from(schema.niveles)
      .where(eq(schema.niveles.moduloId, moduleId))
      .orderBy(asc(schema.niveles.orden));

    // For each level, get its contents
    const levelsWithContents = await Promise.all(
      levels.map(async (lvl: any) => {
        const contents = await this.db
          .select()
          .from(schema.contenidos)
          .where(eq(schema.contenidos.nivelId, lvl.id));

        return {
          ...lvl,
          contents,
        };
      }),
    );

    return levelsWithContents;
  }

  // Content Management
  async createContent(
    levelId: number,
    data: { tipo: string; urlRecurso: string },
  ) {
    const [newContent] = await this.db
      .insert(schema.contenidos)
      .values({
        nivelId: levelId,
        tipo: data.tipo,
        urlRecurso: data.urlRecurso,
      })
      .returning();
    return newContent;
  }

  async getContentsByLevel(levelId: number) {
    return await this.db
      .select()
      .from(schema.contenidos)
      .where(eq(schema.contenidos.nivelId, levelId));
  }

  async deleteContent(contentId: number) {
    await this.db
      .delete(schema.contenidos)
      .where(eq(schema.contenidos.id, contentId));
    return { success: true };
  }

  async getLevelContents(levelId: number) {
    const contents = await this.db
      .select()
      .from(schema.contenidos)
      .where(eq(schema.contenidos.nivelId, levelId));
    return contents;
  }

  // Resource Library
  async createResource(data: {
    profesorId: number;
    nombre: string;
    tipo: string;
    url: string;
    peso: number;
    carpeta?: string;
  }) {
    const [resource] = await this.db
      .insert(schema.recursos)
      .values({
        profesorId: data.profesorId,
        nombre: data.nombre,
        tipo: data.tipo,
        url: data.url,
        peso: data.peso,
        carpeta: data.carpeta,
      })
      .returning();
    return resource;
  }

  async getResources(profesorId: number) {
    return await this.db
      .select()
      .from(schema.recursos)
      //.where(eq(schema.recursos.profesorId, profesorId)) // Descomentar cuando tengamos auth real
      .orderBy(asc(schema.recursos.fechaSubida));
  }

  async deleteResource(id: number) {
    const [resource] = await this.db
      .select()
      .from(schema.recursos)
      .where(eq(schema.recursos.id, id));

    if (!resource) return { success: false, message: 'Recurso no encontrado' };

    // Delete physical file
    try {
      await this.storageService.deleteFile(resource.url);
    } catch (error) {
      console.error(`Error deleting file for resource ${id}:`, error);
      // Continue with DB deletion even if file deletion fails (e.g. file already gone)
    }

    // Delete from DB
    await this.db
      .delete(schema.recursos)
      .where(eq(schema.recursos.id, id));

    return { success: true };
  }

  async deleteFolder(path: string) {
    // Find all resources in this folder or subfolders
    const items = await this.db
      .select()
      .from(schema.recursos)
      .where(
        or(
          eq(schema.recursos.carpeta, path),
          like(schema.recursos.carpeta, `${path}/%`)
        )
      );

    for (const item of items) {
      await this.deleteResource(item.id);
    }

    return { success: true, count: items.length };
  }

  async getHaTemplate(levelId: number) {
    return await this.db
      .select()
      .from(schema.plantillasHa)
      .where(eq(schema.plantillasHa.nivelId, levelId))
      .execute()
      .then((res) => res[0]);
  }

  async createHaTemplate(levelId: number, data: any) {
    console.log('Saving HA for level:', levelId);
    try {
      // Remove 'id' if present to avoid PK violation
      const { id, ...payload } = data;
      payload.fechaCreacion = null;

      const existing = await this.getHaTemplate(levelId);
      if (existing) {
        const [updated] = await this.db
          .update(schema.plantillasHa)
          .set({ ...payload })
          .where(eq(schema.plantillasHa.id, existing.id)) // Use existing ID for update
          .returning();
        return updated;
      } else {
        const [inserted] = await this.db
          .insert(schema.plantillasHa)
          .values({ ...payload, nivelId: levelId })
          .returning();
        return inserted;
      }
    } catch (error) {
      console.log('Error in createHaTemplate:', error);
      throw new BadRequestException('Error en la creación de la plantilla HA');
    }
  }

  // PIM Templates
  async getPimTemplate(nivelId: number) {
    return await this.db
      .select()
      .from(schema.plantillasPim)
      .where(eq(schema.plantillasPim.nivelId, nivelId))
      .execute()
      .then((res) => res[0] || null);
  }

  async createPimTemplate(nivelId: number, data: any) {
    const { id, fechaCreacion, ...payload } = data;
    const existing = await this.getPimTemplate(nivelId);

    if (existing) {
      const [result] = await this.db
        .update(schema.plantillasPim)
        .set(payload)
        .where(eq(schema.plantillasPim.id, existing.id))
        .returning();
      return result;
    } else {
      const [result] = await this.db
        .insert(schema.plantillasPim)
        .values({ ...payload, nivelId })
        .returning();
      return result;
    }
  }

  async deleteLevel(levelId: number) {
    // Cascade delete RAG
    await this.db
      .delete(schema.plantillasRag)
      .where(eq(schema.plantillasRag.nivelId, levelId));
    // Cascade delete HA
    await this.db
      .delete(schema.plantillasHa)
      .where(eq(schema.plantillasHa.nivelId, levelId));

    // Cascade delete PIM (Proyecto Integrador Multidisciplinario)
    await this.db
      .delete(schema.plantillasPim)
      .where(eq(schema.plantillasPim.nivelId, levelId));

    // Cascade delete student progress for this level
    await this.db
      .delete(schema.progresoNiveles)
      .where(eq(schema.progresoNiveles.nivelId, levelId));

    // Cascade delete contents
    await this.db
      .delete(schema.contenidos)
      .where(eq(schema.contenidos.nivelId, levelId));

    // Cascade delete activities
    await this.db
      .delete(schema.actividades)
      .where(eq(schema.actividades.nivelId, levelId));

    // Delete level
    await this.db.delete(schema.niveles).where(eq(schema.niveles.id, levelId));
    return { success: true };
  }

  async updateLevel(levelId: number, data: any) {
    console.log(`[UPDATE LEVEL] ID: ${levelId}, Data:`, data);
    const { id, moduloId, ...payload } = data;
    try {
      const [updated] = await this.db
        .update(schema.niveles)
        .set(payload)
        .where(eq(schema.niveles.id, levelId))
        .returning();
      console.log(`[UPDATE LEVEL] Success:`, updated);
      return updated;
    } catch (error) {
      console.error(`[UPDATE LEVEL] Error:`, error);
      throw error;
    }
  }

  // RAG Templates
  async createRagTemplate(nivelId: number, data: any) {
    try {
      // Remove 'id' if present and reset timestamps to avoid issues
      const { id, fechaCreacion, ...payload } = data;

      // Check if exists update, otherwise insert
      const existing = await this.db
        .select()
        .from(schema.plantillasRag)
        .where(eq(schema.plantillasRag.nivelId, nivelId));

      let result;
      if (existing.length > 0) {
        // Update
        [result] = await this.db
          .update(schema.plantillasRag)
          .set(payload)
          .where(eq(schema.plantillasRag.id, existing[0].id))
          .returning();
      } else {
        // Insert
        [result] = await this.db
          .insert(schema.plantillasRag)
          .values({
            ...payload,
            nivelId,
          })
          .returning();
      }
      return result;
    } catch (error) {
      console.error('Error in createRagTemplate:', error);
      throw new BadRequestException('Error en la creación de la plantilla RAG');
    }
  }

  async getRagTemplate(nivelId: number) {
    const templates = await this.db
      .select()
      .from(schema.plantillasRag)
      .where(eq(schema.plantillasRag.nivelId, nivelId));
    return templates[0] || null;
  }

  // Grading
  async getSubmissions(professorId: number) {
    // This is a simplified query. In a real scenario, we should filter by modules assigned to the professor.
    // RAG Submissions
    const ragSubmissions = await this.db.select({
      id: schema.entregasRag.id,
      studentName: schema.usuarios.nombre,
      studentAvatar: schema.usuarios.avatar,
      activityTitle: schema.plantillasRag.hitoAprendizaje,
      stepIndex: schema.entregasRag.pasoIndice,
      fileUrl: schema.entregasRag.archivoUrl,
      fileType: schema.entregasRag.tipoArchivo,
      submittedAt: schema.entregasRag.fechaSubida,
      type: sql<string>`'rag'`,
      feedback: schema.entregasRag.feedbackAvatar
    })
      .from(schema.entregasRag)
      .innerJoin(schema.usuarios, eq(schema.entregasRag.estudianteId, schema.usuarios.id))
      .innerJoin(schema.plantillasRag, eq(schema.entregasRag.plantillaRagId, schema.plantillasRag.id));

    // HA Submissions
    const haSubmissions = await this.db.select({
      id: schema.entregasHa.id,
      studentName: schema.usuarios.nombre,
      studentAvatar: schema.usuarios.avatar,
      activityTitle: schema.plantillasHa.objetivoSemana,
      submittedAt: schema.entregasHa.fechaSubida,
      files: schema.entregasHa.archivosUrls,
      comment: schema.entregasHa.comentarioEstudiante,
      validated: schema.entregasHa.validado,
      type: sql<string>`'ha'`
    })
      .from(schema.entregasHa)
      .innerJoin(schema.usuarios, eq(schema.entregasHa.estudianteId, schema.usuarios.id))
      .innerJoin(schema.plantillasHa, eq(schema.entregasHa.plantillaHaId, schema.plantillasHa.id));

    return { rag: ragSubmissions, ha: haSubmissions };
  }

  async gradeSubmission(id: number, type: 'rag' | 'ha', grade: number, feedback: string) {
    if (type === 'ha') {
      await this.db.update(schema.entregasHa)
        .set({
          validado: grade >= 70, // Example logic
          // ideally we should have a 'grade' column but 'validado' is existing boolean
        })
        .where(eq(schema.entregasHa.id, id));
    }
    // For RAG, currently no grade column in schema, but we can assume feedback logic
    // This part is simplified for the demo
    return { success: true };
  }
}
