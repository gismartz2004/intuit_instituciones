CREATE TABLE "asistencia" (
	"id" serial PRIMARY KEY NOT NULL,
	"estudiante_id" integer,
	"nivel_id" integer,
	"profesor_id" integer,
	"asistio" boolean DEFAULT false,
	"recuperada" boolean DEFAULT false,
	"fecha" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "modulo_profesores" (
	"id" serial PRIMARY KEY NOT NULL,
	"modulo_id" integer,
	"profesor_id" integer,
	"fecha_asignacion" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "plantillas_bd" (
	"id" serial PRIMARY KEY NOT NULL,
	"nivel_id" integer,
	"titulo" varchar(255),
	"secciones" jsonb,
	"impacto" jsonb,
	"fecha_creacion" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "plantillas_it" (
	"id" serial PRIMARY KEY NOT NULL,
	"nivel_id" integer,
	"titulo" varchar(255),
	"descripcion" text,
	"fases" jsonb,
	"fecha_creacion" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "plantillas_pic" (
	"id" serial PRIMARY KEY NOT NULL,
	"nivel_id" integer,
	"titulo" varchar(255),
	"alcance" text,
	"objetivos" jsonb,
	"entregables" jsonb,
	"fecha_creacion" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "modulos" ADD COLUMN "categoria" varchar(20) DEFAULT 'standard';--> statement-breakpoint
ALTER TABLE "modulos" ADD COLUMN "especializacion" varchar(50);--> statement-breakpoint
ALTER TABLE "usuarios" ADD COLUMN "identificacion" varchar(20);--> statement-breakpoint
ALTER TABLE "usuarios" ADD COLUMN "fecha_nacimiento" date;--> statement-breakpoint
ALTER TABLE "usuarios" ADD COLUMN "edad" integer;--> statement-breakpoint
ALTER TABLE "usuarios" ADD COLUMN "institucion" varchar(255);--> statement-breakpoint
ALTER TABLE "usuarios" ADD COLUMN "curso" varchar(100);--> statement-breakpoint
ALTER TABLE "usuarios" ADD COLUMN "especializacion" varchar(100);--> statement-breakpoint
ALTER TABLE "asistencia" ADD CONSTRAINT "asistencia_estudiante_id_usuarios_id_fk" FOREIGN KEY ("estudiante_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asistencia" ADD CONSTRAINT "asistencia_nivel_id_niveles_id_fk" FOREIGN KEY ("nivel_id") REFERENCES "public"."niveles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asistencia" ADD CONSTRAINT "asistencia_profesor_id_usuarios_id_fk" FOREIGN KEY ("profesor_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "modulo_profesores" ADD CONSTRAINT "modulo_profesores_modulo_id_modulos_id_fk" FOREIGN KEY ("modulo_id") REFERENCES "public"."modulos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "modulo_profesores" ADD CONSTRAINT "modulo_profesores_profesor_id_usuarios_id_fk" FOREIGN KEY ("profesor_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plantillas_bd" ADD CONSTRAINT "plantillas_bd_nivel_id_niveles_id_fk" FOREIGN KEY ("nivel_id") REFERENCES "public"."niveles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plantillas_it" ADD CONSTRAINT "plantillas_it_nivel_id_niveles_id_fk" FOREIGN KEY ("nivel_id") REFERENCES "public"."niveles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plantillas_pic" ADD CONSTRAINT "plantillas_pic_nivel_id_niveles_id_fk" FOREIGN KEY ("nivel_id") REFERENCES "public"."niveles"("id") ON DELETE no action ON UPDATE no action;