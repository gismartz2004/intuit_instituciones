
import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import { usuarios } from 'src/shared/schema';
import { DRIZZLE_DB } from 'src/database/drizzle.provider';
import * as schema from 'src/shared/schema';

@Injectable()
export class AuthService {
    constructor(
        @Inject(DRIZZLE_DB) private db: NodePgDatabase<typeof schema>,
        private jwtService: JwtService
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        console.log(`Validating user: ${email} with pass: ${pass}`);
        const result = await this.db.select().from(usuarios).where(eq(usuarios.email, email)).limit(1);
        const user = result[0];
        console.log('User found:', user);

        if (user && user.password === pass) {
            const { password, ...result } = user;
            return result;
        }
        console.log('Password mismatch or user not found');
        return null;
    }

    async login(user: any) {
        const payload = { email: user.email, sub: user.id, roleId: user.roleId };
        return {
            access_token: this.jwtService.sign(payload),
            user: user,
        };
    }
}
