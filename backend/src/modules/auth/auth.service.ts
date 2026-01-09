import { Inject, Injectable } from '@nestjs/common';
import { users, InsertUser, User } from 'src/shared/schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from 'src/shared/schema';
import { eq } from 'drizzle-orm';
import { DRIZZLE_DB } from 'src/database/drizzle.provider';

@Injectable()
export class UsersService {
    constructor(@Inject(DRIZZLE_DB) private db: NodePgDatabase<typeof schema>) { }

    async validateUser(username: string, pass: string): Promise<User | null> {
        const user = await this.getUserByUsername(username);
        if (user && user.password === pass) {
            // In a real app, use bcrypt compare here
            return user;
        }
        return null;
    }
}
