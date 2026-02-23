
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config({ path: join(__dirname, '../.env') });

async function sync() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL || 'postgres://postgres:password@localhost:5432/edu_connect',
    });

    const client = await pool.connect();
    try {
        console.log('--- STARTING MANUAL SYNC ---');

        // 1. Create cursos table
        await client.query(`
      CREATE TABLE IF NOT EXISTS "cursos" (
        "id" serial PRIMARY KEY NOT NULL,
        "nombre" varchar(100) NOT NULL,
        "descripcion" text,
        "imagen_url" text,
        "profesor_id" integer,
        "fecha_creacion" timestamp DEFAULT now()
      );
    `);
        console.log('[✓] Table "cursos" created/verified');

        // 2. Add curso_id to modulos if not exists
        const resModulos = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='modulos' AND column_name='curso_id';
    `);

        if (resModulos.rowCount === 0) {
            await client.query('ALTER TABLE "modulos" ADD COLUMN "curso_id" integer;');
            console.log('[✓] Column "curso_id" added to "modulos"');
        }

        // 3. Remove legacy especializacion columns
        await client.query('ALTER TABLE "modulos" DROP COLUMN IF EXISTS "especializacion";');
        await client.query('ALTER TABLE "usuarios" DROP COLUMN IF EXISTS "especializacion";');
        console.log('[✓] Legacy specialist columns removed');

        // 4. Add constraints
        try {
            await client.query(`
        ALTER TABLE "cursos" 
        ADD CONSTRAINT "cursos_profesor_id_usuarios_id_fk" 
        FOREIGN KEY ("profesor_id") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
      `);
            console.log('[✓] FK constraint added to "cursos"');
        } catch (e) {
            console.log('[!] FK constraint in "cursos" might already exist');
        }

        try {
            await client.query(`
        ALTER TABLE "modulos" 
        ADD CONSTRAINT "modulos_curso_id_cursos_id_fk" 
        FOREIGN KEY ("curso_id") REFERENCES "cursos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
      `);
            console.log('[✓] FK constraint added to "modulos"');
        } catch (e) {
            console.log('[!] FK constraint in "modulos" might already exist');
        }

        console.log('--- SYNC COMPLETED SUCCESSFULLY ---');
    } catch (err) {
        console.error('--- SYNC FAILED ---');
        console.error(err);
    } finally {
        client.release();
        await pool.end();
    }
}

sync();
