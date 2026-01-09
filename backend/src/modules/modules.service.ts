import { Inject, Injectable } from '@nestjs/common';
import { DRIZZLE_DB } from '../database/drizzle.provider';
import { modules, levels, contents, InsertModule, InsertLevel, InsertContent } from '../shared/schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../shared/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class ModulesService {
    constructor(@Inject(DRIZZLE_DB) private db: NodePgDatabase<typeof schema>) { }

    async createModule(data: InsertModule) {
        const [newModule] = await this.db.insert(modules).values(data).returning();
        return newModule;
    }

    async getModulesByProfessor(professorId: string) {
        return this.db.select().from(modules).where(eq(modules.professorId, professorId));
    }

    async getModuleById(id: string) {
        // Fetch module with levels and contents (simplified join or separate queries)
        // For now, just module info
        const [mod] = await this.db.select().from(modules).where(eq(modules.id, id));
        return mod;
    }

    async createLevel(data: InsertLevel) {
        const [newLevel] = await this.db.insert(levels).values(data).returning();
        return newLevel;
    }

    async getLevelsByModule(moduleId: string) {
        return this.db.select().from(levels).where(eq(levels.moduleId, moduleId)).orderBy(levels.order);
    }

    async createContent(data: InsertContent) {
        const [newContent] = await this.db.insert(contents).values(data).returning();
        return newContent;
    }

    async getContentsByLevel(levelId: string) {
        return this.db.select().from(contents).where(eq(contents.levelId, levelId));
    }
}
