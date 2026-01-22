CREATE TABLE "misiones" (
	"id" serial PRIMARY KEY NOT NULL,
	"tipo" varchar(50),
	"titulo" varchar(100),
	"descripcion" text,
	"xp_recompensa" integer,
	"icono_url" varchar(255),
	"objetivo_valor" integer,
	"es_diaria" boolean DEFAULT false,
	"activa" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "progreso_misiones" (
	"id" serial PRIMARY KEY NOT NULL,
	"estudiante_id" integer,
	"mision_id" integer,
	"progreso_actual" integer DEFAULT 0,
	"completada" boolean DEFAULT false,
	"recompensa_reclamada" boolean DEFAULT false,
	"fecha_inicio" timestamp DEFAULT now(),
	"fecha_completado" timestamp,
	"semana_inicio" timestamp
);
--> statement-breakpoint
ALTER TABLE "progreso_misiones" ADD CONSTRAINT "progreso_misiones_estudiante_id_usuarios_id_fk" FOREIGN KEY ("estudiante_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "progreso_misiones" ADD CONSTRAINT "progreso_misiones_mision_id_misiones_id_fk" FOREIGN KEY ("mision_id") REFERENCES "public"."misiones"("id") ON DELETE no action ON UPDATE no action;