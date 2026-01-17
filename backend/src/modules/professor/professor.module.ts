import { Module } from '@nestjs/common';
import { ProfessorController } from './professor.controller';
import { ProfessorService } from './professor.service';
import { DatabaseModule } from '../../database/database.module';
import { StorageModule } from '../storage/storage.module';

@Module({
    imports: [DatabaseModule, StorageModule],
    controllers: [ProfessorController],
    providers: [ProfessorService],
})
export class ProfessorModule { }
