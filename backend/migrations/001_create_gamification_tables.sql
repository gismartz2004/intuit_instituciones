-- Create misiones table
CREATE TABLE IF NOT EXISTS misiones (
    id SERIAL PRIMARY KEY,
    tipo VARCHAR(50),
    titulo VARCHAR(100),
    descripcion TEXT,
    xp_recompensa INTEGER,
    icono_url VARCHAR(255),
    objetivo_valor INTEGER,
    es_diaria BOOLEAN DEFAULT false,
    activa BOOLEAN DEFAULT true
);

-- Create progreso_misiones table
CREATE TABLE IF NOT EXISTS progreso_misiones (
    id SERIAL PRIMARY KEY,
    estudiante_id INTEGER REFERENCES usuarios(id),
    mision_id INTEGER REFERENCES misiones(id),
    progreso_actual INTEGER DEFAULT 0,
    completada BOOLEAN DEFAULT false,
    recompensa_reclamada BOOLEAN DEFAULT false,
    fecha_inicio TIMESTAMP DEFAULT NOW(),
    fecha_completado TIMESTAMP
);

-- Insert default missions
INSERT INTO misiones (tipo, titulo, descripcion, xp_recompensa, icono_url, objetivo_valor, es_diaria, activa)
VALUES 
    ('DAILY_LOGIN', 'Login Diario', 'Ingresa a la plataforma', 10, 'login', 1, true, true),
    ('VIEW_CONTENT', 'Explorador', 'Revisa 3 contenidos', 30, 'eye', 3, false, true),
    ('COMPLETE_ACTIVITY', 'Trabajador', 'Completa 5 actividades', 100, 'check', 5, false, true),
    ('STREAK_3', 'Constancia', 'Mantén una racha de 3 días', 50, 'flame', 1, false, true),
    ('STREAK_7', 'Disciplina', 'Mantén una racha de 7 días', 150, 'zap', 1, false, true)
ON CONFLICT DO NOTHING;

-- Insert default achievements into logros table if not exists
INSERT INTO logros (titulo, descripcion, icono, xp_requerida, condicion_tipo, condicion_valor)
VALUES 
    ('Primeros Pasos', 'Alcanza el nivel 2', 'star', 100, 'LEVEL_REACHED', 2),
    ('Aprendiz', 'Alcanza el nivel 5', 'book', 850, 'LEVEL_REACHED', 5),
    ('Experto', 'Alcanza el nivel 10', 'trophy', 4100, 'LEVEL_REACHED', 10),
    ('Racha de Fuego', 'Ingresa 3 días seguidos', 'flame', 0, 'STREAK', 3),
    ('Dedicación Total', 'Ingresa 7 días seguidos', 'zap', 0, 'STREAK', 7),
    ('Coleccionista', 'Acumula 1000 XP', 'target', 1000, 'XP_TOTAL', 1000)
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_progreso_misiones_estudiante ON progreso_misiones(estudiante_id);
CREATE INDEX IF NOT EXISTS idx_progreso_misiones_mision ON progreso_misiones(mision_id);
CREATE INDEX IF NOT EXISTS idx_misiones_tipo ON misiones(tipo);
CREATE INDEX IF NOT EXISTS idx_misiones_activa ON misiones(activa);
