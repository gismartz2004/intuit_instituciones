import { Module } from '@nestjs/common';
import { ModulesService } from './modules.service';
import { ModulesController } from './modules.controller';
import { ModuleGeneratorService } from './module-generator.service';

@Module({
  controllers: [ModulesController],
  providers: [ModulesService, ModuleGeneratorService],
  exports: [ModulesService, ModuleGeneratorService],
})
export class ModulesModule {}
