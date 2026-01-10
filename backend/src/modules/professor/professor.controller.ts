import { Controller, Get, Post, Delete, Body, Param, ParseIntPipe, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProfessorService } from './professor.service';
import { diskStorage } from 'multer';
import { extname } from 'path';

// Helper for file naming
const editFileName = (req: any, file: any, callback: any) => {
    const name = file.originalname.split('.')[0];
    const fileExtName = extname(file.originalname);
    const randomName = Array(4)
        .fill(null)
        .map(() => Math.round(Math.random() * 16).toString(16))
        .join('');
    callback(null, `${name}-${randomName}${fileExtName}`);
};

@Controller('professor')
export class ProfessorController {
    constructor(private readonly professorService: ProfessorService) { }

    // Resource Library Endpoints
    @Post('upload')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: './uploads',
            filename: editFileName,
        }),
    }))
    async uploadFile(@UploadedFile() file: any, @Body('profesorId') profesorId: string) {
        // Construct the URL. Assuming backend runs on localhost:3000
        const url = `http://localhost:3000/uploads/${file.filename}`;

        return this.professorService.createResource({
            profesorId: parseInt(profesorId) || 1, // Default to 1 if not provided
            nombre: file.originalname,
            tipo: file.mimetype,
            url: url,
            peso: file.size
        });
    }

    @Get('resources')
    async getResources() {
        // Hardcoded ID 1 since we don't have full auth context passed yet
        return this.professorService.getResources(1);
    }

    @Get(':id/modules')
    async getModules(@Param('id', ParseIntPipe) id: number) {
        return this.professorService.getModulesByProfessor(id);
    }

    @Post('students')
    async createStudent(@Body() body: { name: string, email: string, password: string, moduleId: number }) {
        return this.professorService.createStudentAndAssign(body);
    }

    // Level Management
    @Post('modules/:id/levels')
    async createLevel(@Param('id', ParseIntPipe) moduleId: number, @Body() body: { tituloNivel: string, orden: number }) {
        return this.professorService.createLevel(moduleId, body);
    }

    @Get('modules/:id/levels')
    async getLevels(@Param('id', ParseIntPipe) moduleId: number) {
        return this.professorService.getLevelsByModule(moduleId);
    }

    // Content Management
    @Post('levels/:id/contents')
    async createContent(@Param('id', ParseIntPipe) levelId: number, @Body() body: { tipo: string, urlRecurso: string }) {
        return this.professorService.createContent(levelId, body);
    }

    @Get('levels/:id/contents')
    async getContents(@Param('id', ParseIntPipe) levelId: number) {
        return this.professorService.getContentsByLevel(levelId);
    }

    @Delete('contents/:id')
    async deleteContent(@Param('id', ParseIntPipe) contentId: number) {
        return this.professorService.deleteContent(contentId);
    }
}
