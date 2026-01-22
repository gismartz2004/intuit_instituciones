
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

async function seed() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        console.error('DATABASE_URL not found');
        process.exit(1);
    }

    const pool = new Pool({ connectionString });

    const missions = [
        {
            tipo: 'DAILY_LOGIN',
            titulo: 'Login Diario',
            descripcion: 'Ingresa a la plataforma',
            xpRecompensa: 10,
            iconoUrl: 'login',
            objetivoValor: 1,
            esDiaria: true,
            activa: true,
        },
        {
            tipo: 'VIEW_CONTENT',
            titulo: 'Explorador',
            descripcion: 'Revisa 3 contenidos',
            xpRecompensa: 30,
            iconoUrl: 'eye',
            objetivoValor: 3,
            esDiaria: false,
            activa: true,
        },
        {
            tipo: 'COMPLETE_ACTIVITY',
            titulo: 'Trabajador',
            descripcion: 'Completa 5 actividades',
            xpRecompensa: 100,
            iconoUrl: 'check',
            objetivoValor: 5,
            esDiaria: false,
            activa: true,
        },
        {
            tipo: 'STREAK_3',
            titulo: 'Constancia',
            descripcion: 'Mantén una racha de 3 días',
            xpRecompensa: 50,
            iconoUrl: 'flame',
            objetivoValor: 1,
            esDiaria: false,
            activa: true,
        },
        {
            tipo: 'STREAK_7',
            titulo: 'Disciplina',
            descripcion: 'Mantén una racha de 7 días',
            xpRecompensa: 150,
            iconoUrl: 'zap',
            objetivoValor: 1,
            esDiaria: false,
            activa: true,
        },
        {
            tipo: 'LOGIN_CONSECUTIVE_2',
            titulo: 'Dúo Dinámico',
            descripcion: 'Ingresa 2 días seguidos',
            xpRecompensa: 40,
            iconoUrl: 'users',
            objetivoValor: 1,
            esDiaria: false,
            activa: true,
        },
        {
            tipo: 'VIEW_CONTENT_4',
            titulo: 'Avance Imparable',
            descripcion: 'Mira 4 contenidos seguidos',
            xpRecompensa: 80,
            iconoUrl: 'trending-up',
            objetivoValor: 4,
            esDiaria: false,
            activa: true,
        }
    ];

    try {
        console.log('--- Seeding Missions via SQL ---');
        for (const mission of missions) {
            const res = await pool.query('SELECT id FROM misiones WHERE titulo = $1', [mission.titulo]);
            if (res.rowCount === 0) {
                await pool.query(
                    'INSERT INTO misiones (tipo, titulo, descripcion, xp_recompensa, icono_url, objetivo_valor, es_diaria, activa) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
                    [mission.tipo, mission.titulo, mission.descripcion, mission.xpRecompensa, mission.iconoUrl, mission.objetivoValor, mission.esDiaria, mission.activa]
                );
                console.log(`✅ Seeded: ${mission.titulo}`);
            } else {
                console.log(`⏭️ Skipped: ${mission.titulo} (already exists)`);
            }
        }
    } catch (err) {
        console.error('❌ Error seeding missions:', err.message);
    } finally {
        await pool.end();
    }
}

seed();
