CREATE TABLE "plantillas_pim" (
	"id" serial PRIMARY KEY NOT NULL,
	"nivel_id" integer,
	"titulo_proyecto" varchar(255),
	"anio_nivel" varchar(100),
	"descripcion_general" text,
	"modulos" jsonb,
	"imagen_url" text,
	"fecha_creacion" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "plantillas_pim" ADD CONSTRAINT "plantillas_pim_nivel_id_niveles_id_fk" FOREIGN KEY ("nivel_id") REFERENCES "public"."niveles"("id") ON DELETE no action ON UPDATE no action;