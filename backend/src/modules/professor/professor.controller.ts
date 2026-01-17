import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProfessorService } from './professor.service';
import { StorageService } from '../storage/storage.service';
import { memoryStorage } from 'multer';

@Controller('professor')
export class ProfessorController {
  constructor(
    private readonly professorService: ProfessorService,
    private readonly storageService: StorageService,
  ) {}

  // Resource Library Endpoints
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(), // Store in memory so we can buffer upload to SFTP
    }),
  )
  async uploadFile(
    @UploadedFile() file: any,
    @Body('profesorId') profesorId: string,
  ) {
    // Upload via StorageService (Local or SFTP)
    const url = await this.storageService.uploadFile(file);

    return this.professorService.createResource({
      profesorId: parseInt(profesorId) || 1, // Default to 1
      nombre: file.originalname,
      tipo: file.mimetype,
      url: url,
      peso: file.size,
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
  async createStudent(
    @Body()
    body: {
      name: string;
      email: string;
      password: string;
      moduleId: number;
    },
  ) {
    return this.professorService.createStudentAndAssign(body);
  }

  // Level Management
  @Post('modules/:id/levels')
  async createLevel(
    @Param('id', ParseIntPipe) moduleId: number,
    @Body() body: { tituloNivel: string; orden: number },
  ) {
    return this.professorService.createLevel(moduleId, body);
  }

  @Get('modules/:id/levels')
  async getLevels(@Param('id', ParseIntPipe) moduleId: number) {
    return this.professorService.getLevelsByModule(moduleId);
  }

  // Content Management
  @Post('levels/:id/contents')
  async createContent(
    @Param('id', ParseIntPipe) levelId: number,
    @Body() body: { tipo: string; urlRecurso: string },
  ) {
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

  @Delete('levels/:id')
  async deleteLevel(@Param('id', ParseIntPipe) levelId: number) {
    return this.professorService.deleteLevel(levelId);
  }

  // RAG Templates
  @Post('levels/:id/rag')
  async createRag(
    @Param('id', ParseIntPipe) levelId: number,
    @Body() body: any,
  ) {
    return this.professorService.createRagTemplate(levelId, body);
  }

  @Get('levels/:id/rag')
  async getRagTemplate(@Param('id', ParseIntPipe) levelId: number) {
    try {
      const ragTemplate = await this.professorService.getRagTemplate(levelId);
      return ragTemplate;
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  // HA Routes
  @Post('levels/:id/ha')
  async createHaTemplate(
    @Param('id', ParseIntPipe) levelId: number,
    @Body() body: any,
  ) {
    return this.professorService.createHaTemplate(levelId, body);
  }

  @Get('levels/:id/ha')
  async getHaTemplate(@Param('id', ParseIntPipe) levelId: number) {
    return this.professorService.getHaTemplate(levelId);
  }
}
