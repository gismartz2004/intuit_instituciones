CREATE TABLE "actividades" (
	"id" serial PRIMARY KEY NOT NULL,
	"nivel_id" integer,
	"tipo" varchar(20),
	"titulo" varchar(100),
	"puntos_maximos" integer,
	"fecha_plazo" timestamp
);
--> statement-breakpoint
CREATE TABLE "asignaciones" (
	"id" serial PRIMARY KEY NOT NULL,
	"estudiante_id" integer,
	"profesor_id" integer,
	"modulo_id" integer
);
--> statement-breakpoint
CREATE TABLE "certificados" (
	"id" serial PRIMARY KEY NOT NULL,
	"estudiante_id" integer,
	"modulo_id" integer,
	"codigo_verificacion" varchar(100),
	"url_pdf" text,
	"fecha_emision" date DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "contenidos" (
	"id" serial PRIMARY KEY NOT NULL,
	"nivel_id" integer,
	"tipo" varchar(20),
	"url_recurso" text,
	"titulo_ejercicio" varchar(255),
	"descripcion_ejercicio" text,
	"codigo_inicial" text,
	"codigo_esperado" text,
	"lenguaje" varchar(50)
);
--> statement-breakpoint
CREATE TABLE "entregas" (
	"id" serial PRIMARY KEY NOT NULL,
	"actividad_id" integer,
	"estudiante_id" integer,
	"puntos_log_id" integer,
	"archivo_url" text,
	"calificacion_numerica" integer,
	"feedback_profe" text
);
--> statement-breakpoint
CREATE TABLE "entregas_ha" (
	"id" serial PRIMARY KEY NOT NULL,
	"estudiante_id" integer,
	"plantilla_ha_id" integer,
	"archivos_urls" text,
	"comentario_estudiante" text,
	"validado" boolean DEFAULT false,
	"fecha_subida" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "entregas_rag" (
	"id" serial PRIMARY KEY NOT NULL,
	"estudiante_id" integer,
	"plantilla_rag_id" integer,
	"paso_indice" integer,
	"archivo_url" text,
	"tipo_archivo" varchar(50),
	"feedback_avatar" text,
	"fecha_subida" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "gamificacion_estudiante" (
	"id" serial PRIMARY KEY NOT NULL,
	"estudiante_id" integer,
	"xp_total" integer DEFAULT 0,
	"nivel_actual" integer DEFAULT 1,
	"puntos_disponibles" integer DEFAULT 0,
	"racha_dias" integer DEFAULT 0,
	"ultima_racha_update" timestamp,
	CONSTRAINT "gamificacion_estudiante_estudiante_id_unique" UNIQUE("estudiante_id")
);
--> statement-breakpoint
CREATE TABLE "logros" (
	"id" serial PRIMARY KEY NOT NULL,
	"titulo" varchar(100),
	"descripcion" text,
	"icono" varchar(50),
	"xp_requerida" integer,
	"condicion_tipo" varchar(50),
	"condicion_valor" integer
);
--> statement-breakpoint
CREATE TABLE "logros_desbloqueados" (
	"id" serial PRIMARY KEY NOT NULL,
	"estudiante_id" integer,
	"logro_id" integer,
	"fecha_desbloqueo" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "modulos" (
	"id" serial PRIMARY KEY NOT NULL,
	"nombre_modulo" varchar(100),
	"duracion_dias" integer,
	"fecha_creacion" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "niveles" (
	"id" serial PRIMARY KEY NOT NULL,
	"modulo_id" integer,
	"titulo_nivel" varchar(100),
	"orden" integer
);
--> statement-breakpoint
CREATE TABLE "planes" (
	"id" serial PRIMARY KEY NOT NULL,
	"nombre_plan" varchar(50) NOT NULL,
	"precio" numeric(10, 2)
);
--> statement-breakpoint
CREATE TABLE "plantillas_ha" (
	"id" serial PRIMARY KEY NOT NULL,
	"nivel_id" integer,
	"fase" varchar(255),
	"objetivo_semana" text,
	"concepto_clave" text,
	"pasos_guiados" text,
	"resultado_esperado" text,
	"evidencia_tipos" text,
	"evidencia_descripcion" text,
	"pregunta_reflexion" text,
	"secciones_dinamicas" text,
	"fecha_creacion" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "plantillas_rag" (
	"id" serial PRIMARY KEY NOT NULL,
	"nivel_id" integer,
	"programa" varchar(255),
	"modulo" varchar(255),
	"hito_aprendizaje" varchar(255),
	"mes" varchar(50),
	"semana" varchar(50),
	"tipo_rag" varchar(50),
	"modalidad" varchar(50),
	"duracion_estimada" varchar(50),
	"proposito" text,
	"objetivo_aprendizaje" text,
	"contenido_clave" text,
	"nombre_actividad" varchar(255),
	"descripcion_desafio" text,
	"pasos_guiados" text,
	"pistas" text,
	"tipo_evidencia" varchar(100),
	"cantidad_evidencias" integer,
	"competencias_tecnicas" text,
	"competencias_blandas" text,
	"porcentaje_aporte" integer,
	"actualiza_radar" boolean DEFAULT false,
	"regulariza_asistencia" boolean DEFAULT false,
	"criterio_evidencia" boolean DEFAULT false,
	"criterio_pasos" boolean DEFAULT false,
	"criterio_tiempo" boolean DEFAULT false,
	"secciones_dinamicas" text,
	"fecha_creacion" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "progreso_niveles" (
	"id" serial PRIMARY KEY NOT NULL,
	"estudiante_id" integer,
	"nivel_id" integer,
	"porcentaje_completado" integer DEFAULT 0,
	"completado" boolean DEFAULT false,
	"fecha_inicio" timestamp DEFAULT now(),
	"fecha_completado" timestamp
);
--> statement-breakpoint
CREATE TABLE "puntos_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"estudiante_id" integer,
	"cantidad" integer,
	"motivo" varchar(255),
	"fecha_obtencion" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ranking_awards" (
	"id" serial PRIMARY KEY NOT NULL,
	"estudiante_id" integer,
	"puntos_totales_id" integer,
	"posicion_actual" integer,
	"ultimo_rewind_url" text
);
--> statement-breakpoint
CREATE TABLE "recursos" (
	"id" serial PRIMARY KEY NOT NULL,
	"profesor_id" integer,
	"nombre" varchar(255) NOT NULL,
	"tipo" varchar(50),
	"url" text NOT NULL,
	"peso" integer,
	"fecha_subida" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"nombre_rol" varchar(50) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "usuarios" (
	"id" serial PRIMARY KEY NOT NULL,
	"role_id" integer,
	"plan_id" integer,
	"nombre" varchar(100),
	"email" varchar(100),
	"password" varchar(255),
	"activo" boolean DEFAULT true,
	"avatar" varchar(255) DEFAULT 'avatar_boy',
	"onboarding_completed" boolean DEFAULT false,
	CONSTRAINT "usuarios_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "actividades" ADD CONSTRAINT "actividades_nivel_id_niveles_id_fk" FOREIGN KEY ("nivel_id") REFERENCES "public"."niveles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asignaciones" ADD CONSTRAINT "asignaciones_estudiante_id_usuarios_id_fk" FOREIGN KEY ("estudiante_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asignaciones" ADD CONSTRAINT "asignaciones_profesor_id_usuarios_id_fk" FOREIGN KEY ("profesor_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asignaciones" ADD CONSTRAINT "asignaciones_modulo_id_modulos_id_fk" FOREIGN KEY ("modulo_id") REFERENCES "public"."modulos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certificados" ADD CONSTRAINT "certificados_estudiante_id_usuarios_id_fk" FOREIGN KEY ("estudiante_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certificados" ADD CONSTRAINT "certificados_modulo_id_modulos_id_fk" FOREIGN KEY ("modulo_id") REFERENCES "public"."modulos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contenidos" ADD CONSTRAINT "contenidos_nivel_id_niveles_id_fk" FOREIGN KEY ("nivel_id") REFERENCES "public"."niveles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entregas" ADD CONSTRAINT "entregas_actividad_id_actividades_id_fk" FOREIGN KEY ("actividad_id") REFERENCES "public"."actividades"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entregas" ADD CONSTRAINT "entregas_estudiante_id_usuarios_id_fk" FOREIGN KEY ("estudiante_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entregas" ADD CONSTRAINT "entregas_puntos_log_id_puntos_log_id_fk" FOREIGN KEY ("puntos_log_id") REFERENCES "public"."puntos_log"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entregas_ha" ADD CONSTRAINT "entregas_ha_estudiante_id_usuarios_id_fk" FOREIGN KEY ("estudiante_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entregas_ha" ADD CONSTRAINT "entregas_ha_plantilla_ha_id_plantillas_ha_id_fk" FOREIGN KEY ("plantilla_ha_id") REFERENCES "public"."plantillas_ha"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entregas_rag" ADD CONSTRAINT "entregas_rag_estudiante_id_usuarios_id_fk" FOREIGN KEY ("estudiante_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entregas_rag" ADD CONSTRAINT "entregas_rag_plantilla_rag_id_plantillas_rag_id_fk" FOREIGN KEY ("plantilla_rag_id") REFERENCES "public"."plantillas_rag"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gamificacion_estudiante" ADD CONSTRAINT "gamificacion_estudiante_estudiante_id_usuarios_id_fk" FOREIGN KEY ("estudiante_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "logros_desbloqueados" ADD CONSTRAINT "logros_desbloqueados_estudiante_id_usuarios_id_fk" FOREIGN KEY ("estudiante_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "logros_desbloqueados" ADD CONSTRAINT "logros_desbloqueados_logro_id_logros_id_fk" FOREIGN KEY ("logro_id") REFERENCES "public"."logros"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "niveles" ADD CONSTRAINT "niveles_modulo_id_modulos_id_fk" FOREIGN KEY ("modulo_id") REFERENCES "public"."modulos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plantillas_ha" ADD CONSTRAINT "plantillas_ha_nivel_id_niveles_id_fk" FOREIGN KEY ("nivel_id") REFERENCES "public"."niveles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plantillas_rag" ADD CONSTRAINT "plantillas_rag_nivel_id_niveles_id_fk" FOREIGN KEY ("nivel_id") REFERENCES "public"."niveles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "progreso_niveles" ADD CONSTRAINT "progreso_niveles_estudiante_id_usuarios_id_fk" FOREIGN KEY ("estudiante_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "progreso_niveles" ADD CONSTRAINT "progreso_niveles_nivel_id_niveles_id_fk" FOREIGN KEY ("nivel_id") REFERENCES "public"."niveles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "puntos_log" ADD CONSTRAINT "puntos_log_estudiante_id_usuarios_id_fk" FOREIGN KEY ("estudiante_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ranking_awards" ADD CONSTRAINT "ranking_awards_estudiante_id_usuarios_id_fk" FOREIGN KEY ("estudiante_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ranking_awards" ADD CONSTRAINT "ranking_awards_puntos_totales_id_puntos_log_id_fk" FOREIGN KEY ("puntos_totales_id") REFERENCES "public"."puntos_log"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recursos" ADD CONSTRAINT "recursos_profesor_id_usuarios_id_fk" FOREIGN KEY ("profesor_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_plan_id_planes_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."planes"("id") ON DELETE no action ON UPDATE no action;