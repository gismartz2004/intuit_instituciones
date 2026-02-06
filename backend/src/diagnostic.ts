
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DRIZZLE_DB } from './database/drizzle.provider';
import * as schema from './shared/schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const db = app.get<NodePgDatabase<typeof schema>>(DRIZZLE_DB);

    console.log('--- DIAGNOSTIC START ---');

    // Check roles
    const roles = await db.select().from(schema.roles);
    console.log('Roles in DB:', JSON.stringify(roles, null, 2));

    // Check user counts per role
    const users = await db.select().from(schema.usuarios);
    console.log('Total users:', users.length);

    if (users.length > 0) {
        console.log('Sample user:', JSON.stringify(users[0], null, 2));
    }

    // Check student role specific query
    const studentRole = roles.find(r => r.nombreRol.toLowerCase() === 'student');
    if (studentRole) {
        const students = await db.select().from(schema.usuarios).where(eq(schema.usuarios.roleId, studentRole.id));
        console.log('Students found by roleId:', students.length);
    } else {
        console.log('Student role NOT FOUND in roles list');
    }

    console.log('--- DIAGNOSTIC END ---');
    await app.close();
}

// Helper eq if needed
import { eq } from 'drizzle-orm';

bootstrap().catch(err => {
    console.error('Diagnostic failed:', err);
    process.exit(1);
});
