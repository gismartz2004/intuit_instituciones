import { Inject, Injectable } from '@nestjs/common';
import { DRIZZLE_DB } from '../database/drizzle.provider';
import { users, InsertUser, User } from '../shared/schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../shared/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class UsersService {
    constructor(@Inject(DRIZZLE_DB) private db: NodePgDatabase<typeof schema>) { }

    async getUser(id: string): Promise<User | undefined> {
        const [user] = await this.db.select().from(users).where(eq(users.id, id));
        return user;
    }

    async getUserByUsername(username: string): Promise<User | undefined> {
        const [user] = await this.db.select().from(users).where(eq(users.username, username));
        return user;
    }

    async createUser(user: InsertUser): Promise<User> {
        const [newUser] = await this.db.insert(users).values(user).returning();
        return newUser;
    }

    async validateUser(username: string, pass: string): Promise<User | null> {
        const user = await this.getUserByUsername(username);
        if (user && user.password === pass) {
            // In a real app, use bcrypt compare here
            return user;
        }
        return null;
    }
}
