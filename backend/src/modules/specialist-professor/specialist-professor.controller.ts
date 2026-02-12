import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { SpecialistProfessorService } from './specialist-professor.service';

@Controller('specialist-professor')
export class SpecialistProfessorController {
    constructor(private readonly specialistProfessorService: SpecialistProfessorService) { }

    @Get('modules/:professorId')
    async getModules(@Param('professorId') professorId: string) {
        return this.specialistProfessorService.getModulesByProfessor(parseInt(professorId));
    }

    @Post('modules')
    async createModule(@Body() data: { nombreModulo: string; duracionDias: number; profesorId: number; especializacion?: string }) {
        return this.specialistProfessorService.createModule(data);
    }

    @Get('modules/:id/levels')
    async getLevels(@Param('id') moduleId: string) {
        return this.specialistProfessorService.getLevelsByModule(parseInt(moduleId));
    }

    @Post('modules/:id/levels')
    async createLevel(@Param('id') moduleId: string, @Body() data: { tituloNivel: string; orden: number }) {
        return this.specialistProfessorService.createLevel(parseInt(moduleId), data);
    }

    @Delete('modules/:moduleId/levels/:levelId')
    async deleteLevel(@Param('moduleId') moduleId: string, @Param('levelId') levelId: string) {
        return this.specialistProfessorService.deleteLevel(parseInt(levelId));
    }

    // BD Templates
    @Get('levels/:id/bd')
    async getBdTemplate(@Param('id') levelId: string) {
        return this.specialistProfessorService.getBdTemplate(parseInt(levelId));
    }

    @Post('levels/:id/bd')
    async saveBdTemplate(@Param('id') levelId: string, @Body() data: any) {
        return this.specialistProfessorService.saveBdTemplate(parseInt(levelId), data);
    }

    // IT Templates
    @Get('levels/:id/it')
    async getItTemplate(@Param('id') levelId: string) {
        return this.specialistProfessorService.getItTemplate(parseInt(levelId));
    }

    @Post('levels/:id/it')
    async saveItTemplate(@Param('id') levelId: string, @Body() data: any) {
        return this.specialistProfessorService.saveItTemplate(parseInt(levelId), data);
    }

    // PIC Templates
    @Get('levels/:id/pic')
    async getPicTemplate(@Param('id') levelId: string) {
        return this.specialistProfessorService.getPicTemplate(parseInt(levelId));
    }

    @Post('levels/:id/pic')
    async savePicTemplate(@Param('id') levelId: string, @Body() data: any) {
        return this.specialistProfessorService.savePicTemplate(parseInt(levelId), data);
    }
}
