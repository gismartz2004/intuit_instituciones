import { Controller, Get, Post, Body, Param, NotFoundException } from '@nestjs/common';
import { ModulesService } from './modules.service';

@Controller('modules')
export class ModulesController {
    constructor(private readonly modulesService: ModulesService) { }

    @Post()
    async createModule(@Body() body: any) {
        return this.modulesService.createModule(body);
    }

    @Get('professor/:id')
    async getModules(@Param('id') professorId: string) {
        return this.modulesService.getModulesByProfessor(professorId);
    }

    @Get(':id')
    async getModule(@Param('id') id: string) {
        const mod = await this.modulesService.getModuleById(id);
        if (!mod) throw new NotFoundException('Module not found');
        return mod;
    }

    @Post('levels')
    async createLevel(@Body() body: any) {
        return this.modulesService.createLevel(body);
    }

    @Get(':id/levels')
    async getLevels(@Param('id') moduleId: string) {
        return this.modulesService.getLevelsByModule(moduleId);
    }

    @Get('levels/:id/contents')
    async getContents(@Param('id') levelId: string) {
        return this.modulesService.getContentsByLevel(levelId);
    }

    @Post('contents')
    async createContent(@Body() body: any) {
        return this.modulesService.createContent(body);
    }
}
