ALTER TABLE "plantillas_ha" ALTER COLUMN "pasos_guiados" SET DATA TYPE jsonb;--> statement-breakpoint
ALTER TABLE "plantillas_ha" ALTER COLUMN "evidencia_tipos" SET DATA TYPE jsonb;--> statement-breakpoint
ALTER TABLE "plantillas_ha" ALTER COLUMN "secciones_dinamicas" SET DATA TYPE jsonb;--> statement-breakpoint
ALTER TABLE "plantillas_rag" ALTER COLUMN "contenido_clave" SET DATA TYPE jsonb;--> statement-breakpoint
ALTER TABLE "plantillas_rag" ALTER COLUMN "pasos_guiados" SET DATA TYPE jsonb;--> statement-breakpoint
ALTER TABLE "plantillas_rag" ALTER COLUMN "pistas" SET DATA TYPE jsonb;--> statement-breakpoint
ALTER TABLE "plantillas_rag" ALTER COLUMN "secciones_dinamicas" SET DATA TYPE jsonb;