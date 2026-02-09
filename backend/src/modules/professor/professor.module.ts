import { Module } from '@nestjs/common';
import { ProfessorController } from './professor.controller';
import { ProfessorService } from './professor.service';
import { GradingController } from './controllers/grading.controller';
import { DatabaseModule } from '../../database/database.module';
import { StorageModule } from '../storage/storage.module';
import { StudentModule } from '../student/student.module';

@Module({
    imports: [DatabaseModule, StorageModule, StudentModule],
    controllers: [ProfessorController, GradingController],
    providers: [ProfessorService],
})
export class ProfessorModule { }
