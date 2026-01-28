import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../shared/schema';
import { eq } from 'drizzle-orm';
import { DRIZZLE_DB } from '../../database/drizzle.provider';

@Injectable()
export class PremiosService {
    constructor(
        @Inject(DRIZZLE_DB)
        private readonly db: NodePgDatabase<typeof schema>,
    ) { }

    async findAll() {
        return this.db.select().from(schema.premios).orderBy(schema.premios.fechaCreacion);
    }

    async findOne(id: number) {
        const results = await this.db.select().from(schema.premios).where(eq(schema.premios.id, id));
        return results[0];
    }

    async create(data: any) {
        const results = await this.db.insert(schema.premios).values(data).returning();
        return results[0];
    }

    async update(id: number, data: any) {
        const results = await this.db.update(schema.premios)
            .set(data)
            .where(eq(schema.premios.id, id))
            .returning();
        return results[0];
    }

    async remove(id: number) {
        return this.db.delete(schema.premios).where(eq(schema.premios.id, id));
    }
}
