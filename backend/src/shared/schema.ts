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
});

// 4. Tabla de Módulos
export const modulos = pgTable('modulos', {
  id: serial('id').primaryKey(),
  nombreModulo: varchar('nombre_modulo', { length: 100 }),
  duracionDias: integer('duracion_dias'),
  fechaCreacion: timestamp('fecha_creacion').defaultNow(),
});

// 5. Tabla de Asignaciones
export const asignaciones = pgTable('asignaciones', {
  id: serial('id').primaryKey(),
  estudianteId: integer('estudiante_id').references(() => usuarios.id),
  profesorId: integer('profesor_id').references(() => usuarios.id),
  moduloId: integer('modulo_id').references(() => modulos.id),
});

// 6. Tabla de Niveles
export const niveles = pgTable('niveles', {
  id: serial('id').primaryKey(),
  moduloId: integer('modulo_id').references(() => modulos.id),
  tituloNivel: varchar('titulo_nivel', { length: 100 }),
  orden: integer('orden'),
});

// 7. Contenidos
export const contenidos = pgTable('contenidos', {
  id: serial('id').primaryKey(),
  nivelId: integer('nivel_id').references(() => niveles.id),
  tipo: varchar('tipo', { length: 20 }), // video, pdf, link, word, slides, entregable, codigo_lab
  urlRecurso: text('url_recurso'),
  // Campos para ejercicios de código
  tituloEjercicio: varchar('titulo_ejercicio', { length: 255 }),
  descripcionEjercicio: text('descripcion_ejercicio'),
  codigoInicial: text('codigo_inicial'),
  codigoEsperado: text('codigo_esperado'),
  lenguaje: varchar('lenguaje', { length: 50 }), // javascript, python, etc.
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

// 15. Plantillas RAG (Recuperación Autónoma Guiada)
export const plantillasRag = pgTable('plantillas_rag', {
  id: serial('id').primaryKey(),
  nivelId: integer('nivel_id').references(() => niveles.id),
  // Identificación General
  programa: varchar('programa', { length: 255 }),
  modulo: varchar('modulo', { length: 255 }),
  hitoAprendizaje: varchar('hito_aprendizaje', { length: 255 }),
  mes: varchar('mes', { length: 50 }),
  semana: varchar('semana', { length: 50 }),
  tipoRag: varchar('tipo_rag', { length: 50 }), // Técnica / Práctica / Mixta
  modalidad: varchar('modalidad', { length: 50 }), // Autónoma / Asincrónica
  duracionEstimada: varchar('duracion_estimada', { length: 50 }),

  // Propósito y Objetivos
  proposito: text('proposito'),
  objetivoAprendizaje: text('objetivo_aprendizaje'),

  // Contenido Clave (Stored as JSON: [{titulo, descripcion}])
  contenidoClave: jsonb('contenido_clave'),

  // Actividad Autónoma
  nombreActividad: varchar('nombre_actividad', { length: 255 }),
  descripcionDesafio: text('descripcion_desafio'),
  pasosGuiados: jsonb('pasos_guiados'), // JSON: [{paso, completado, requiereEntregable}]

  // Ayudas
  pistas: jsonb('pistas'), // JSON: [pista1, pista2...]

  // Evidencia
  tipoEvidencia: varchar('tipo_evidencia', { length: 100 }),
  cantidadEvidencias: integer('cantidad_evidencias'),

  // Competencias (JSON)
  competenciasTecnicas: text('competencias_tecnicas'),
  competenciasBlandas: text('competencias_blandas'),

  // Impacto
  porcentajeAporte: integer('porcentaje_aporte'),
  actualizaRadar: boolean('actualiza_radar').default(false),
  regularizaAsistencia: boolean('regulariza_asistencia').default(false),

  // Criterios de Finalización
  criterioEvidencia: boolean('criterio_evidencia').default(false),
  criterioPasos: boolean('criterio_pasos').default(false),
  criterioTiempo: boolean('criterio_tiempo').default(false),

  // Secciones Dinámicas Globales (Para expandir la plantilla)
  seccionesDinamicas: jsonb('secciones_dinamicas'), // JSON: [{ titulo, tipo: 'texto'|'checklist', contenido: string | [] }]

  imagenUrl: text('imagen_url'), // Main image for the RAG template

  fechaCreacion: timestamp('fecha_creacion').defaultNow(),
});

// 16. Plantillas HA (Hito de Aprendizaje)
export const plantillasHa = pgTable('plantillas_ha', {
  id: serial('id').primaryKey(),
  nivelId: integer('nivel_id').references(() => niveles.id),

  // 1. Fase
  fase: varchar('fase', { length: 255 }),

  // 2. Objetivo de la semana
  objetivoSemana: text('objetivo_semana'),

  // 3. Concepto Clave
  conceptoClave: text('concepto_clave'),

  // 4. Pasos Guiados (Checklist)
  pasosGuiados: jsonb('pasos_guiados'),

  // 5. Resultado Esperado
  resultadoEsperado: text('resultado_esperado'),
  // Nota: El "Estado" (Logrado/En Proceso) se guarda en el progreso del estudiante, no en la plantilla.

  // 6. Evidencia
  evidenciaTipos: jsonb('evidencia_tipos'), // JSON Array: ['Imagen', 'Video']
  evidenciaDescripcion: text('evidencia_descripcion'),

  // 7. Pregunta de Reflexión
  preguntaReflexion: text('pregunta_reflexion'),

  // Secciones Dinámicas
  seccionesDinamicas: jsonb('secciones_dinamicas'), // JSON

  fechaCreacion: timestamp('fecha_creacion').defaultNow(),
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

// 20. Entregas RAG
export const entregasRag = pgTable('entregas_rag', {
  id: serial('id').primaryKey(),
  estudianteId: integer('estudiante_id').references(() => usuarios.id),
  plantillaRagId: integer('plantilla_rag_id').references(() => plantillasRag.id),
  pasoIndice: integer('paso_indice'), // Qué paso es (0, 1, 2...)
  archivoUrl: text('archivo_url'),
  tipoArchivo: varchar('tipo_archivo', { length: 50 }),
  feedbackAvatar: text('feedback_avatar'),
  fechaSubida: timestamp('fecha_subida').defaultNow(),
});

// 21. Entregas HA (Evidencia Hito)
export const entregasHa = pgTable('entregas_ha', {
  id: serial('id').primaryKey(),
  estudianteId: integer('estudiante_id').references(() => usuarios.id),
  plantillaHaId: integer('plantilla_ha_id').references(() => plantillasHa.id),
  archivosUrls: text('archivos_urls'), // JSON Array stringified
  comentarioEstudiante: text('comentario_estudiante'),
  validado: boolean('validado').default(false),
  fechaSubida: timestamp('fecha_subida').defaultNow(),
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

// Types
export type Role = typeof roles.$inferSelect;
export type InsertRole = z.infer<typeof insertRoleSchema>;

export type Plan = typeof planes.$inferSelect;
export type InsertPlan = z.infer<typeof insertPlanSchema>;

export type Usuario = typeof usuarios.$inferSelect;
export type InsertUsuario = z.infer<typeof insertUsuarioSchema>;

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

export const insertPlantillaRagSchema = createInsertSchema(plantillasRag);
export type PlantillaRag = typeof plantillasRag.$inferSelect;
export type InsertPlantillaRag = z.infer<typeof insertPlantillaRagSchema>;

export const insertPlantillaHaSchema = createInsertSchema(plantillasHa);
export type PlantillaHa = typeof plantillasHa.$inferSelect;
export type InsertPlantillaHa = z.infer<typeof insertPlantillaHaSchema>;

export const insertLogroSchema = createInsertSchema(logros);
export const insertLogroDesbloqueadoSchema = createInsertSchema(logrosDesbloqueados);
export const insertGamificacionEstudianteSchema = createInsertSchema(gamificacionEstudiante);
export const insertEntregaRagSchema = createInsertSchema(entregasRag);
export const insertEntregaHaSchema = createInsertSchema(entregasHa);
export const insertMisionSchema = createInsertSchema(misiones);
export const insertProgresoMisionSchema = createInsertSchema(progresoMisiones);


export type Logro = typeof logros.$inferSelect;
export type InsertLogro = z.infer<typeof insertLogroSchema>;

export type LogroDesbloqueado = typeof logrosDesbloqueados.$inferSelect;
export type InsertLogroDesbloqueado = z.infer<typeof insertLogroDesbloqueadoSchema>;

export type GamificacionEstudiante = typeof gamificacionEstudiante.$inferSelect;
export type InsertGamificacionEstudiante = z.infer<typeof insertGamificacionEstudianteSchema>;

export type EntregaRag = typeof entregasRag.$inferSelect;
export type InsertEntregaRag = z.infer<typeof insertEntregaRagSchema>;

export type EntregaHa = typeof entregasHa.$inferSelect;
export type InsertEntregaHa = z.infer<typeof insertEntregaHaSchema>;

export type Mision = typeof misiones.$inferSelect;
export type InsertMision = z.infer<typeof insertMisionSchema>;

export type ProgresoMision = typeof progresoMisiones.$inferSelect;
export type InsertProgresoMision = z.infer<typeof insertProgresoMisionSchema>;

