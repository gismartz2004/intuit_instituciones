import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PremiosService } from './premios.service';

@Controller('premios')
export class PremiosController {
    constructor(private readonly premiosService: PremiosService) { }

    @Get()
    findAll() {
        return this.premiosService.findAll();
    }

    @Post()
    create(@Body() createPremioDto: any) {
        return this.premiosService.create(createPremioDto);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updatePremioDto: any) {
        return this.premiosService.update(+id, updatePremioDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.premiosService.remove(+id);
    }
}
