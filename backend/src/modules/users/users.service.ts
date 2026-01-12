import { Inject, Injectable } from '@nestjs/common';
import { usuarios, InsertUsuario, Usuario } from 'src/shared/schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from 'src/shared/schema';
import { eq } from 'drizzle-orm';
import { DRIZZLE_DB } from 'src/database/drizzle.provider';

@Injectable()
export class UsersService {
    constructor(@Inject(DRIZZLE_DB) private db: NodePgDatabase<typeof schema>) { }

    async getUser(id: number): Promise<Usuario | undefined> {
        const [user] = await this.db.select().from(usuarios).where(eq(usuarios.id, id));
        return user;
    }

    async getUserByEmail(email: string): Promise<Usuario | undefined> {
        const [user] = await this.db.select().from(usuarios).where(eq(usuarios.email, email));
        return user;
    }

    async createUser(user: InsertUsuario): Promise<Usuario> {
        const [newUser] = await this.db.insert(usuarios).values(user).returning();
        return newUser;
    }

    async getAllUsers(): Promise<any[]> {
        const users = await this.db.select().from(usuarios);

        // Fetch assignments for each user (inefficient for large datasets but works for now)
        // A better approach would be a single query with joins, but Drizzle join syntax varies.
        // Let's do a simple map solution for clarity in this iteration.

        const usersWithModules = await Promise.all(users.map(async (user) => {
            const userAssignments = await this.db.select({
                moduloId: schema.asignaciones.moduloId,
                nombreModulo: schema.modulos.nombreModulo
            })
                .from(schema.asignaciones)
                .leftJoin(schema.modulos, eq(schema.asignaciones.moduloId, schema.modulos.id))
                .where(
                    user.roleId === 2
                        ? eq(schema.asignaciones.profesorId, user.id)
                        : eq(schema.asignaciones.estudianteId, user.id)
                );

            return {
                ...user,
                modules: userAssignments,
            };
        }));

        return usersWithModules;
    }

    async updateUser(id: number, updates: Partial<InsertUsuario>): Promise<Usuario> {
        const [updatedUser] = await this.db
            .update(usuarios)
            .set(updates)
            .where(eq(usuarios.id, id))
            .returning();
        return updatedUser;
    }

    async deleteUser(id: number) {
        // Delete related data first (Manual Cascade)
        // 1. Assignments (Asignaciones)
        await this.db.delete(schema.asignaciones).where(eq(schema.asignaciones.estudianteId, id));
        await this.db.delete(schema.asignaciones).where(eq(schema.asignaciones.profesorId, id));

        // 2. Point Logs (PuntosLog)
        await this.db.delete(schema.puntosLog).where(eq(schema.puntosLog.estudianteId, id));

        // 3. Deliveries (Entregas)
        await this.db.delete(schema.entregas).where(eq(schema.entregas.estudianteId, id));

        // 4. Certificates and Rankings
        await this.db.delete(schema.certificados).where(eq(schema.certificados.estudianteId, id));
        await this.db.delete(schema.rankingAwards).where(eq(schema.rankingAwards.estudianteId, id));

        // Finally delete the user
        await this.db.delete(schema.usuarios).where(eq(schema.usuarios.id, id));
        return { success: true };
    }
}
