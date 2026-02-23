import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  NotFoundException,
  ParseIntPipe,
} from '@nestjs/common';
import { ModulesService } from './modules.service';
import { ModuleGeneratorService, ModuleGenerationRequest } from './module-generator.service';

@Controller('modules')
export class ModulesController {
  constructor(
    private readonly modulesService: ModulesService,
    private readonly generatorService: ModuleGeneratorService,
  ) {}

  @Post('generate')
  async generateModule(@Body() body: ModuleGenerationRequest) {
    return this.generatorService.generateModuleFromPrompt(body);
  }

  @Post('save-generated')
  async saveGeneratedModule(
    @Body() body: { module: any; cursoId: number; profesorId: number },
  ) {
    const request: ModuleGenerationRequest = {
      prompt: '',
      cursoId: body.cursoId,
      profesorId: body.profesorId,
    };
    return this.generatorService.saveGeneratedModule(body.module, request);
  }

  @Post()
  async createModule(@Body() body: any) {
    return this.modulesService.createModule(body);
  }

  @Get()
  async getAllModules() {
    return this.modulesService.getAllModules();
  }

  @Post('asignar')
  async assignUser(@Body() body: any) {
    return this.modulesService.assignUserToModule(body);
  }

  @Get('profesor/:id')
  async getModules(@Param('id', ParseIntPipe) professorId: number) {
    return this.modulesService.getModulesByProfessor(professorId);
  }

  @Get(':id')
  async getModule(@Param('id', ParseIntPipe) id: number) {
    const mod = await this.modulesService.getModuleById(id);
    if (!mod) throw new NotFoundException('Module not found');
    return mod;
  }

  @Post('niveles')
  async createLevel(@Body() body: any) {
    return this.modulesService.createLevel(body);
  }

  @Get(':id/niveles')
  async getLevels(@Param('id', ParseIntPipe) moduleId: number) {
    return this.modulesService.getLevelsByModule(moduleId);
  }

  @Get('niveles/:id/contenidos')
  async getContents(@Param('id', ParseIntPipe) levelId: number) {
    return this.modulesService.getContentsByLevel(levelId);
  }

  @Post('contenidos')
  async createContent(@Body() body: any) {
    return this.modulesService.createContent(body);
  }

  @Delete(':id')
  async deleteModule(@Param('id', ParseIntPipe) id: number) {
    return this.modulesService.deleteModule(id);
  }
}
