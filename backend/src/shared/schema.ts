import { pgTable, serial, text, varchar, integer, boolean, timestamp, decimal, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// 1. Tabla de Roles
export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  nombreRol: varchar("nombre_rol", { length: 50 }).notNull(),
});

// 2. Tabla de Planes
export const planes = pgTable("planes", {
  id: serial("id").primaryKey(),
  nombrePlan: varchar("nombre_plan", { length: 50 }).notNull(),
  precio: decimal("precio", { precision: 10, scale: 2 }),
});

// 3. Tabla de Usuarios
export const usuarios = pgTable("usuarios", {
  id: serial("id").primaryKey(),
  roleId: integer("role_id").references(() => roles.id),
  planId: integer("plan_id").references(() => planes.id),
  nombre: varchar("nombre", { length: 100 }),
  email: varchar("email", { length: 100 }).unique(),
  password: varchar("password", { length: 255 }),
  activo: boolean("activo").default(true),
  avatar: varchar("avatar", { length: 255 }).default('avatar_boy'),
  onboardingCompleted: boolean("onboarding_completed").default(false),
});

// 4. Tabla de Módulos
export const modulos = pgTable("modulos", {
  id: serial("id").primaryKey(),
  nombreModulo: varchar("nombre_modulo", { length: 100 }),
  duracionDias: integer("duracion_dias"),
  fechaCreacion: timestamp("fecha_creacion").defaultNow(),
});

// 5. Tabla de Asignaciones
export const asignaciones = pgTable("asignaciones", {
  id: serial("id").primaryKey(),
  estudianteId: integer("estudiante_id").references(() => usuarios.id),
  profesorId: integer("profesor_id").references(() => usuarios.id),
  moduloId: integer("modulo_id").references(() => modulos.id),
});

// 6. Tabla de Niveles
export const niveles = pgTable("niveles", {
  id: serial("id").primaryKey(),
  moduloId: integer("modulo_id").references(() => modulos.id),
  tituloNivel: varchar("titulo_nivel", { length: 100 }),
  orden: integer("orden"),
});

// 7. Contenidos
export const contenidos = pgTable("contenidos", {
  id: serial("id").primaryKey(),
  nivelId: integer("nivel_id").references(() => niveles.id),
  tipo: varchar("tipo", { length: 20 }), // video, pdf, link, word, slides, entregable, codigo_lab
  urlRecurso: text("url_recurso"),
  // Campos para ejercicios de código
  tituloEjercicio: varchar("titulo_ejercicio", { length: 255 }),
  descripcionEjercicio: text("descripcion_ejercicio"),
  codigoInicial: text("codigo_inicial"),
  codigoEsperado: text("codigo_esperado"),
  lenguaje: varchar("lenguaje", { length: 50 }), // javascript, python, etc.
});

// 8. Tabla Maestra de Puntos
export const puntosLog = pgTable("puntos_log", {
  id: serial("id").primaryKey(),
  estudianteId: integer("estudiante_id").references(() => usuarios.id),
  cantidad: integer("cantidad"),
  motivo: varchar("motivo", { length: 255 }),
  fechaObtencion: timestamp("fecha_obtencion").defaultNow(),
});

// 9. Actividades
export const actividades = pgTable("actividades", {
  id: serial("id").primaryKey(),
  nivelId: integer("nivel_id").references(() => niveles.id),
  tipo: varchar("tipo", { length: 20 }), // entregable, quiz, codigo, simulador
  titulo: varchar("titulo", { length: 100 }),
  puntosMaximos: integer("puntos_maximos"),
  fechaPlazo: timestamp("fecha_plazo"),
});

// 10. Entregas
export const entregas = pgTable("entregas", {
  id: serial("id").primaryKey(),
  actividadId: integer("actividad_id").references(() => actividades.id),
  estudianteId: integer("estudiante_id").references(() => usuarios.id),
  puntosLogId: integer("puntos_log_id").references(() => puntosLog.id),
  archivoUrl: text("archivo_url"),
  calificacionNumerica: integer("calificacion_numerica"),
  feedbackProfe: text("feedback_profe"),
});

// 11. Ranking Genios Awards
export const rankingAwards = pgTable("ranking_awards", {
  id: serial("id").primaryKey(),
  estudianteId: integer("estudiante_id").references(() => usuarios.id),
  puntosTotalesId: integer("puntos_totales_id").references(() => puntosLog.id),
  posicionActual: integer("posicion_actual"),
  ultimoRewindUrl: text("ultimo_rewind_url"),
});

// 12. Certificados
export const certificados = pgTable("certificados", {
  id: serial("id").primaryKey(),
  estudianteId: integer("estudiante_id").references(() => usuarios.id),
  moduloId: integer("modulo_id").references(() => modulos.id),
  codigoVerificacion: varchar("codigo_verificacion", { length: 100 }),
  urlPdf: text("url_pdf"),
  fechaEmision: date("fecha_emision").defaultNow(),
});

// 13. Recursos (Sistema de Archivos)
export const recursos = pgTable("recursos", {
  id: serial("id").primaryKey(),
  profesorId: integer("profesor_id").references(() => usuarios.id),
  nombre: varchar("nombre", { length: 255 }).notNull(),
  tipo: varchar("tipo", { length: 50 }), // mime type
  url: text("url").notNull(),
  peso: integer("peso"),
  fechaSubida: timestamp("fecha_subida").defaultNow(),
});

// 14. Progreso de Niveles
export const progresoNiveles = pgTable("progreso_niveles", {
  id: serial("id").primaryKey(),
  estudianteId: integer("estudiante_id").references(() => usuarios.id),
  nivelId: integer("nivel_id").references(() => niveles.id),
  porcentajeCompletado: integer("porcentaje_completado").default(0),
  completado: boolean("completado").default(false),
  fechaInicio: timestamp("fecha_inicio").defaultNow(),
  fechaCompletado: timestamp("fecha_completado"),
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
