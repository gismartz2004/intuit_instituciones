import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { DatabaseModule } from '../../database/database.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { ExcelProcessorService } from '../../shared/services/excel-processor.service';

@Module({
    imports: [DatabaseModule, NotificationsModule],
    controllers: [AdminController],
    providers: [AdminService, ExcelProcessorService],
    exports: [AdminService]
})
export class AdminModule { }
