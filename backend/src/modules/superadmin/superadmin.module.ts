import { Module } from '@nestjs/common';
import { SuperadminController } from './superadmin.controller';
import { SuperadminService } from './superadmin.service';
import { DatabaseModule } from '../../database/database.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { ExcelProcessorService } from '../../shared/services/excel-processor.service';

@Module({
    imports: [DatabaseModule, NotificationsModule],
    controllers: [SuperadminController],
    providers: [SuperadminService, ExcelProcessorService],
    exports: [SuperadminService]
})
export class SuperadminModule { }
