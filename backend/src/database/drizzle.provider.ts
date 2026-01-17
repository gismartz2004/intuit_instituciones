import { Provider } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../shared/schema';

export const DRIZZLE_DB = 'DRIZZLE_DB_PROVIDER';

export const drizzleProvider: Provider = {
  provide: DRIZZLE_DB,
  useFactory: () => {
    const connectionString =
      process.env.DATABASE_URL ||
      'postgres://postgres:password@localhost:5432/edu_connect';
    console.log('--- DB CONNECTION ---');
    console.log(
      'Using URL:',
      connectionString.includes('@ep-holy-scene')
        ? 'NEON DB (Cloud)'
        : 'LOCALHOST (Fallback)',
    );
    const pool = new Pool({
      connectionString,
    });
    return drizzle(pool, { schema });
  },
};
