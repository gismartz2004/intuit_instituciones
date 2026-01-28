import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);

    constructor(private readonly mailerService: MailerService) { }

    /**
     * Send a reminder to a professor about missing content in a module
     */
    async sendProfessorContentReminder(email: string, nombreProfe: string, nombreModulo: string) {
        try {
            await this.mailerService.sendMail({
                to: email,
                subject: `⚠️ Recordatorio: Falta contenido en el módulo ${nombreModulo}`,
                html: `
          <div style="font-family: sans-serif; line-height: 1.5; color: #333;">
            <h2 style="color: #0047AB;">¡Hola ${nombreProfe}!</h2>
            <p>Hemos detectado que el módulo <strong>${nombreModulo}</strong> que tienes asignado aún no tiene contenido completo (niveles, RAG o HA).</p>
            <p>Es importante subir este contenido pronto para que tus estudiantes puedan empezar sus misiones.</p>
            <p style="margin-top: 20px;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/teach" 
                 style="background-color: #0047AB; color: white; padding: 10px 20px; text-decoration: none; rounded: 5px;">
                Ir al Panel del Docente
              </a>
            </p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
            <p style="font-size: 12px; color: #777;">ARG Academy - Sistema de Gestión de Aprendizaje</p>
          </div>
        `,
            });
            this.logger.log(`Reminder sent to professor: ${email}`);
        } catch (error) {
            this.logger.error(`Failed to send email to professor ${email}`, error);
        }
    }

    /**
     * Send an alert to a parent about a student's inactivity
     */
    async sendParentInactivityAlert(emailPadre: string, nombreEstudiante: string, nombreModulo: string) {
        if (!emailPadre) return;

        try {
            await this.mailerService.sendMail({
                to: emailPadre,
                subject: `💡 Notificación de Progreso: ${nombreEstudiante}`,
                html: `
          <div style="font-family: sans-serif; line-height: 1.5; color: #333;">
            <h2 style="color: #0047AB;">Estimado/a Padre de Familia,</h2>
            <p>Te escribimos por parte de <strong>ARG Academy</strong> para informarte que hemos notado que <strong>${nombreEstudiante}</strong> no ha tenido actividad reciente en el módulo <strong>${nombreModulo}</strong> durante los últimos días.</p>
            <p>Mantener una racha constante de aprendizaje es clave para el éxito en su formación técnica.</p>
            <p>¡Te invitamos a motivar a ${nombreEstudiante} para que continúe con sus misiones!</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
            <p style="font-size: 12px; color: #777;">ARG Academy - Tu futuro en tecnología</p>
          </div>
        `,
            });
            this.logger.log(`Inactivity alert sent to parent: ${emailPadre}`);
        } catch (error) {
            this.logger.error(`Failed to send email to parent ${emailPadre}`, error);
        }
    }
}
