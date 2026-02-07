CREATE TABLE "premios" (
	"id" serial PRIMARY KEY NOT NULL,
	"nombre" varchar(100) NOT NULL,
	"descripcion" text,
	"costo_puntos" integer DEFAULT 0,
	"imagen_url" text,
	"stock" integer,
	"activo" boolean DEFAULT true,
	"fecha_creacion" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "modulos" ADD COLUMN "profesor_id" integer;--> statement-breakpoint
ALTER TABLE "plantillas_pim" ADD COLUMN "problematica_general" text;--> statement-breakpoint
ALTER TABLE "plantillas_pim" ADD COLUMN "contexto_problema" text;--> statement-breakpoint
ALTER TABLE "plantillas_pim" ADD COLUMN "objetivo_proyecto" text;--> statement-breakpoint
ALTER TABLE "recursos" ADD COLUMN "carpeta" varchar(255);--> statement-breakpoint
ALTER TABLE "usuarios" ADD COLUMN "nombre_padre" varchar(100);--> statement-breakpoint
ALTER TABLE "usuarios" ADD COLUMN "celular_padre" varchar(20);--> statement-breakpoint
ALTER TABLE "usuarios" ADD COLUMN "trabajo_padre" varchar(100);--> statement-breakpoint
ALTER TABLE "modulos" ADD CONSTRAINT "modulos_profesor_id_usuarios_id_fk" FOREIGN KEY ("profesor_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;