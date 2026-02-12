
import { Module } from '@nestjs/common';
import { SpecialistProfessorController } from './specialist-professor.controller';
import { SpecialistProfessorService } from './specialist-professor.service';

@Module({
    controllers: [SpecialistProfessorController],
    providers: [SpecialistProfessorService],
    exports: [SpecialistProfessorService],
})
export class SpecialistProfessorModule { }
