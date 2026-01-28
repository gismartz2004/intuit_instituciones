ALTER TABLE "asignaciones" ADD COLUMN "fecha_asignacion" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "niveles" ADD COLUMN "bloqueado_manual" boolean;--> statement-breakpoint
ALTER TABLE "niveles" ADD COLUMN "dias_para_desbloquear" integer DEFAULT 7;--> statement-breakpoint
ALTER TABLE "usuarios" ADD COLUMN "email_padre" varchar(100);