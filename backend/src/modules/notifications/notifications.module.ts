import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { EmailService } from './email.service';
import { SchedulerService } from './scheduler.service';

@Module({
    imports: [DatabaseModule],
    providers: [EmailService, SchedulerService],
    exports: [EmailService, SchedulerService],
})
export class NotificationsModule { }
