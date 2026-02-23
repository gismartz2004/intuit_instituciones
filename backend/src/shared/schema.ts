import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  decimal,
  date,
  jsonb,
} from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// 1. Tabla de Roles
export const roles = pgTable('roles', {
  id: serial('id').primaryKey(),
  nombreRol: varchar('nombre_rol', { length: 50 }).notNull(),
});

// 2. Tabla de Planes
export const planes = pgTable('planes', {
  id: serial('id').primaryKey(),
  nombrePlan: varchar('nombre_plan', { length: 50 }).notNull(),
  precio: decimal('precio', { precision: 10, scale: 2 }),
});

// 3. Tabla de Usuarios
export const usuarios = pgTable('usuarios', {
  id: serial('id').primaryKey(),
  roleId: integer('role_id').references(() => roles.id),
  planId: integer('plan_id').references(() => planes.id),
  nombre: varchar('nombre', { length: 100 }),
  email: varchar('email', { length: 100 }).unique(),
  password: varchar('password', { length: 255 }),
  activo: boolean('activo').default(true),
  avatar: varchar('avatar', { length: 255 }).default('avatar_boy'),
  onboardingCompleted: boolean('onboarding_completed').default(false),
  emailPadre: varchar('email_padre', { length: 100 }),
  nombrePadre: varchar('nombre_padre', { length: 100 }),
  celularPadre: varchar('celular_padre', { length: 20 }),
  trabajoPadre: varchar('trabajo_padre', { length: 100 }),
  identificacion: varchar('identificacion', { length: 20 }),
  fechaNacimiento: date('fecha_nacimiento'),
  edad: integer('edad'),
  institucion: varchar('institucion', { length: 255 }),
  curso: varchar('curso', { length: 100 }),
});

// 3.5 Tabla de Cursos (Nivel superior)
export const cursos = pgTable('cursos', {
  id: serial('id').primaryKey(),
  nombre: varchar('nombre', { length: 100 }).notNull(),
  descripcion: text('descripcion'),
  imagenUrl: text('imagen_url'),
  profesorId: integer('profesor_id').references(() => usuarios.id),
  fechaCreacion: timestamp('fecha_creacion').defaultNow(),
});

// 4. Tabla de Módulos
export const modulos = pgTable('modulos', {
  id: serial('id').primaryKey(),
  cursoId: integer('curso_id').references(() => cursos.id),
  nombreModulo: varchar('nombre_modulo', { length: 100 }),
  duracionDias: integer('duracion_dias'),
  profesorId: integer('profesor_id').references(() => usuarios.id),
  categoria: varchar('categoria', { length: 20 }).default('standard'), // 'standard' or 'specialization'
  generadoPorIA: boolean('generado_por_ia').default(false),
  fechaCreacion: timestamp('fecha_creacion').defaultNow(),
});

// 5. Tabla de Asignaciones
export const asignaciones = pgTable('asignaciones', {
  id: serial('id').primaryKey(),
  estudianteId: integer('estudiante_id').references(() => usuarios.id),
  profesorId: integer('profesor_id').references(() => usuarios.id),
  moduloId: integer('modulo_id').references(() => modulos.id),
  fechaAsignacion: timestamp('fecha_asignacion').defaultNow(),
});

// 6. Tabla de Niveles
export const niveles = pgTable('niveles', {
  id: serial('id').primaryKey(),
  moduloId: integer('modulo_id').references(() => modulos.id),
  tituloNivel: varchar('titulo_nivel', { length: 100 }),
  orden: integer('orden'),
  bloqueadoManual: boolean('bloqueado_manual'), // Nullable by default, no fixed default here
  diasParaDesbloquear: integer('dias_para_desbloquear').default(7), // Default to 1 week
  descripcion: text('descripcion'),
  objetivos: jsonb('objetivos'), // Array of learning objectives
});

// 7. Contenidos
export const contenidos = pgTable('contenidos', {
  id: serial('id').primaryKey(),
  nivelId: integer('nivel_id').references(() => niveles.id),
  tipo: varchar('tipo', { length: 20 }), // video, pdf, link, word, slides, entregable, codigo_lab, reto
  urlRecurso: text('url_recurso'),
  // Campos para ejercicios de código
  tituloEjercicio: varchar('titulo_ejercicio', { length: 255 }),
  descripcionEjercicio: text('descripcion_ejercicio'),
  codigoInicial: text('codigo_inicial'),
  codigoEsperado: text('codigo_esperado'),
  lenguaje: varchar('lenguaje', { length: 50 }), // javascript, python, etc.
  // Campos para retos generados por IA
  dificultad: varchar('dificultad', { length: 20 }), // fácil, media, difícil
  archivosBase: jsonb('archivos_base'), // Array of {nombre, contenido, lenguaje}
  criterios: jsonb('criterios'), // Array of {descripcion, puntos}
});

// 8. Tabla Maestra de Puntos
export const puntosLog = pgTable('puntos_log', {
  id: serial('id').primaryKey(),
  estudianteId: integer('estudiante_id').references(() => usuarios.id),
  cantidad: integer('cantidad'),
  motivo: varchar('motivo', { length: 255 }),
  fechaObtencion: timestamp('fecha_obtencion').defaultNow(),
});

// 9. Actividades
export const actividades = pgTable('actividades', {
  id: serial('id').primaryKey(),
  nivelId: integer('nivel_id').references(() => niveles.id),
  tipo: varchar('tipo', { length: 20 }), // entregable, quiz, codigo, simulador
  titulo: varchar('titulo', { length: 100 }),
  puntosMaximos: integer('puntos_maximos'),
  fechaPlazo: timestamp('fecha_plazo'),
});

// 10. Entregas
export const entregas = pgTable('entregas', {
  id: serial('id').primaryKey(),
  actividadId: integer('actividad_id').references(() => actividades.id),
  estudianteId: integer('estudiante_id').references(() => usuarios.id),
  puntosLogId: integer('puntos_log_id').references(() => puntosLog.id),
  archivoUrl: text('archivo_url'),
  calificacionNumerica: integer('calificacion_numerica'),
  feedbackProfe: text('feedback_profe'),
});

// 11. Ranking Genios Awards
export const rankingAwards = pgTable('ranking_awards', {
  id: serial('id').primaryKey(),
  estudianteId: integer('estudiante_id').references(() => usuarios.id),
  puntosTotalesId: integer('puntos_totales_id').references(() => puntosLog.id),
  posicionActual: integer('posicion_actual'),
  ultimoRewindUrl: text('ultimo_rewind_url'),
});

// 12. Certificados
export const certificados = pgTable('certificados', {
  id: serial('id').primaryKey(),
  estudianteId: integer('estudiante_id').references(() => usuarios.id),
  moduloId: integer('modulo_id').references(() => modulos.id),
  codigoVerificacion: varchar('codigo_verificacion', { length: 100 }),
  urlPdf: text('url_pdf'),
  fechaEmision: date('fecha_emision').defaultNow(),
});

// 13. Recursos (Sistema de Archivos)
export const recursos = pgTable('recursos', {
  id: serial('id').primaryKey(),
  profesorId: integer('profesor_id').references(() => usuarios.id),
  nombre: varchar('nombre', { length: 255 }).notNull(),
  tipo: varchar('tipo', { length: 50 }), // mime type
  url: text('url').notNull(),
  peso: integer('peso'),
  carpeta: varchar('carpeta', { length: 255 }), // Path for folder organization
  fechaSubida: timestamp('fecha_subida').defaultNow(),
});

// 14. Progreso de Niveles
export const progresoNiveles = pgTable('progreso_niveles', {
  id: serial('id').primaryKey(),
  estudianteId: integer('estudiante_id').references(() => usuarios.id),
  nivelId: integer('nivel_id').references(() => niveles.id),
  porcentajeCompletado: integer('porcentaje_completado').default(0),
  completado: boolean('completado').default(false),
  fechaInicio: timestamp('fecha_inicio').defaultNow(),
  fechaCompletado: timestamp('fecha_completado'),
});

// 17. Logros (Achievements)
export const logros = pgTable('logros', {
  id: serial('id').primaryKey(),
  titulo: varchar('titulo', { length: 100 }),
  descripcion: text('descripcion'),
  icono: varchar('icono', { length: 50 }),
  xpRequerida: integer('xp_requerida'),
  condicionTipo: varchar('condicion_tipo', { length: 50 }), // LEVEL_REACHED, STREAK, MISSION_COMPLETE
  condicionValor: integer('condicion_valor'),
});

// 18. Logros Desbloqueados
export const logrosDesbloqueados = pgTable('logros_desbloqueados', {
  id: serial('id').primaryKey(),
  estudianteId: integer('estudiante_id').references(() => usuarios.id),
  logroId: integer('logro_id').references(() => logros.id),
  fechaDesbloqueo: timestamp('fecha_desbloqueo').defaultNow(),
});

// 19. Gamificación Estudiante (Estado Actual)
export const gamificacionEstudiante = pgTable('gamificacion_estudiante', {
  id: serial('id').primaryKey(),
  estudianteId: integer('estudiante_id').references(() => usuarios.id).unique(),
  xpTotal: integer('xp_total').default(0),
  nivelActual: integer('nivel_actual').default(1),
  puntosDisponibles: integer('puntos_disponibles').default(0), // Para tienda
  rachaDias: integer('racha_dias').default(0),
  ultimaRachaUpdate: timestamp('ultima_racha_update'),
});

// 22. Misiones (Mission Definitions)
export const misiones = pgTable('misiones', {
  id: serial('id').primaryKey(),
  tipo: varchar('tipo', { length: 50 }), // DAILY_LOGIN, VIEW_CONTENT, COMPLETE_ACTIVITY, STREAK_3, STREAK_7
  titulo: varchar('titulo', { length: 100 }),
  descripcion: text('descripcion'),
  xpRecompensa: integer('xp_recompensa'),
  iconoUrl: varchar('icono_url', { length: 255 }),
  objetivoValor: integer('objetivo_valor'), // e.g., 3 for "view 3 contents"
  esDiaria: boolean('es_diaria').default(false),
  activa: boolean('activa').default(true),
});

// 23. Progreso de Misiones (Student Mission Progress)
export const progresoMisiones = pgTable('progreso_misiones', {
  id: serial('id').primaryKey(),
  estudianteId: integer('estudiante_id').references(() => usuarios.id),
  misionId: integer('mision_id').references(() => misiones.id),
  progresoActual: integer('progreso_actual').default(0),
  completada: boolean('completada').default(false),
  recompensaReclamada: boolean('recompensa_reclamada').default(false),
  fechaInicio: timestamp('fecha_inicio').defaultNow(),
  fechaCompletado: timestamp('fecha_completado'),
  semanaInicio: timestamp('semana_inicio'), // For weekly mission reset/sync
});

// 24. PIM Templates (Proyectos Integradores Modulares)
export const pimTemplates = pgTable('pim_templates', {
  id: serial('id').primaryKey(),
  levelId: integer('level_id').references(() => niveles.id).unique().notNull(),
  tituloProyecto: varchar('titulo_proyecto', { length: 255 }),
  descripcionGeneral: text('descripcion_general'),
  problematicaGeneral: text('problematica_general'),
  contextoProblema: text('contexto_problema'),
  objetivoProyecto: text('objetivo_proyecto'),
  imagenUrl: text('imagen_url'),
  modulos: jsonb('modulos'), // Almacena la estructura de módulos como JSON
  fechaCreacion: timestamp('fecha_creacion').defaultNow(),
  fechaActualizacion: timestamp('fecha_actualizacion').defaultNow(),
});

// 25. PIC Templates (Proyectos de Innovación y Creatividad)
export const picTemplates = pgTable('pic_templates', {
  id: serial('id').primaryKey(),
  levelId: integer('level_id').references(() => niveles.id).unique().notNull(),
  templateData: jsonb('template_data'), // Almacena toda la plantilla como un único objeto JSON
  fechaCreacion: timestamp('fecha_creacion').defaultNow(),
});

// 24. Premios (Prizes for Raffle)
export const premios = pgTable('premios', {
  id: serial('id').primaryKey(),
  nombre: varchar('nombre', { length: 100 }).notNull(),
  descripcion: text('descripcion'),
  costoPuntos: integer('costo_puntos').default(0),
  imagenUrl: text('imagen_url'),
  stock: integer('stock'),
  activo: boolean('activo').default(true),
  fechaCreacion: timestamp('fecha_creacion').defaultNow(),
});

// 25. Asistencia
export const asistencia = pgTable('asistencia', {
  id: serial('id').primaryKey(),
  estudianteId: integer('estudiante_id').references(() => usuarios.id),
  nivelId: integer('nivel_id').references(() => niveles.id),
  profesorId: integer('profesor_id').references(() => usuarios.id),
  asistio: boolean('asistio').default(false),
  recuperada: boolean('recuperada').default(false),
  fecha: timestamp('fecha').defaultNow(),
});

// 26. Módulos - Profesores (Join Table for many-to-many)
export const moduloProfesores = pgTable('modulo_profesores', {
  id: serial('id').primaryKey(),
  moduloId: integer('modulo_id').references(() => modulos.id),
  profesorId: integer('profesor_id').references(() => usuarios.id),
  fechaAsignacion: timestamp('fecha_asignacion').defaultNow(),
});

// Schemas for insertions
export const insertRoleSchema = createInsertSchema(roles);
export const insertPlanSchema = createInsertSchema(planes);
export const insertUsuarioSchema = createInsertSchema(usuarios);
export const insertModuloSchema = createInsertSchema(modulos);
export const insertAsignacionSchema = createInsertSchema(asignaciones);
export const insertNivelSchema = createInsertSchema(niveles);
export const insertContenidoSchema = createInsertSchema(contenidos);
export const insertPuntoLogSchema = createInsertSchema(puntosLog);
export const insertActividadSchema = createInsertSchema(actividades);
export const insertEntregaSchema = createInsertSchema(entregas);
export const insertRankingAwardSchema = createInsertSchema(rankingAwards);
export const insertCertificadoSchema = createInsertSchema(certificados);
export const insertProgresoNivelSchema = createInsertSchema(progresoNiveles);
export const insertCursoSchema = createInsertSchema(cursos);

// Types
export type Role = typeof roles.$inferSelect;
export type InsertRole = z.infer<typeof insertRoleSchema>;

export type Plan = typeof planes.$inferSelect;
export type InsertPlan = z.infer<typeof insertPlanSchema>;

export type Usuario = typeof usuarios.$inferSelect;
export type InsertUsuario = z.infer<typeof insertUsuarioSchema>;

export type Curso = typeof cursos.$inferSelect;
export type InsertCurso = z.infer<typeof insertCursoSchema>;

export type Modulo = typeof modulos.$inferSelect;
export type InsertModulo = z.infer<typeof insertModuloSchema>;

export type Asignacion = typeof asignaciones.$inferSelect;
export type InsertAsignacion = z.infer<typeof insertAsignacionSchema>;

export type Nivel = typeof niveles.$inferSelect;
export type InsertNivel = z.infer<typeof insertNivelSchema>;

export type Contenido = typeof contenidos.$inferSelect;
export type InsertContenido = z.infer<typeof insertContenidoSchema>;

export type PuntoLog = typeof puntosLog.$inferSelect;
export type InsertPuntoLog = z.infer<typeof insertPuntoLogSchema>;

export type Actividad = typeof actividades.$inferSelect;
export type InsertActividad = z.infer<typeof insertActividadSchema>;

export type Entrega = typeof entregas.$inferSelect;
export type InsertEntrega = z.infer<typeof insertEntregaSchema>;

export type RankingAward = typeof rankingAwards.$inferSelect;
export type InsertRankingAward = z.infer<typeof insertRankingAwardSchema>;

export type Certificado = typeof certificados.$inferSelect;
export type InsertCertificado = z.infer<typeof insertCertificadoSchema>;

export type ProgresoNivel = typeof progresoNiveles.$inferSelect;
export type InsertProgresoNivel = z.infer<typeof insertProgresoNivelSchema>;

export const insertLogroSchema = createInsertSchema(logros);
export const insertLogroDesbloqueadoSchema = createInsertSchema(logrosDesbloqueados);
export const insertGamificacionEstudianteSchema = createInsertSchema(gamificacionEstudiante);
export const insertMisionSchema = createInsertSchema(misiones);
export const insertProgresoMisionSchema = createInsertSchema(progresoMisiones);
export const insertPremioSchema = createInsertSchema(premios);
export const insertAsistenciaSchema = createInsertSchema(asistencia);
export const insertModuloProfesorSchema = createInsertSchema(moduloProfesores);


export type Logro = typeof logros.$inferSelect;
export type InsertLogro = z.infer<typeof insertLogroSchema>;

export type LogroDesbloqueado = typeof logrosDesbloqueados.$inferSelect;
export type InsertLogroDesbloqueado = z.infer<typeof insertLogroDesbloqueadoSchema>;

export type GamificacionEstudiante = typeof gamificacionEstudiante.$inferSelect;
export type InsertGamificacionEstudiante = z.infer<typeof insertGamificacionEstudianteSchema>;

export type Mision = typeof misiones.$inferSelect;
export type InsertMision = z.infer<typeof insertMisionSchema>;

export type ProgresoMision = typeof progresoMisiones.$inferSelect;
export type InsertProgresoMision = z.infer<typeof insertProgresoMisionSchema>;

export type Premio = typeof premios.$inferSelect;
export type InsertPremio = z.infer<typeof insertPremioSchema>;

export type Asistencia = typeof asistencia.$inferSelect;
export type InsertAsistencia = z.infer<typeof insertAsistenciaSchema>;

export type ModuloProfesor = typeof moduloProfesores.$inferSelect;
export type InsertModuloProfesor = z.infer<typeof insertModuloProfesorSchema>;
