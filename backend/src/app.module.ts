import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { MailerModule } from '@nestjs-modules/mailer';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './modules/users/users.module';
import { ModulesModule } from './modules/modules.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProfessorModule } from './modules/professor/professor.module';
import { StudentModule } from './modules/student/student.module';
import { PlansModule } from './modules/plans/plans.module';
import { AdminModule } from './modules/admin/admin.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { PremiosModule } from './modules/premios/premios.module';
import { AiModule } from './modules/ai/ai.module';
import { SpecialistModule } from './modules/specialist/specialist.module';
import { SpecialistProfessorModule } from './modules/specialist-professor/specialist-professor.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    MailerModule.forRoot({
      transport: {
        host: process.env.SMTP_HOST || '',
        port: Number(process.env.SMTP_PORT) || 587,
        auth: {
          user: process.env.SMTP_USER || '',
          pass: process.env.SMTP_PASS || '',
        },
      },
      defaults: {
        from: '"ARG Academy" <notifications@arg-academy.com>',
      },
    }),
    DatabaseModule,
    UsersModule,
    ModulesModule,
    AuthModule,
    ProfessorModule,
    StudentModule,
    PlansModule,
    AdminModule,
    NotificationsModule,
    PremiosModule,
    AiModule,
    SpecialistModule,
    SpecialistProfessorModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
