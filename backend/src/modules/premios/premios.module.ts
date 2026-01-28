import { Module } from '@nestjs/common';
import { PremiosService } from './premios.service';
import { PremiosController } from './premios.controller';
import { DatabaseModule } from '../../database/database.module';

@Module({
    imports: [DatabaseModule],
    controllers: [PremiosController],
    providers: [PremiosService],
    exports: [PremiosService],
})
export class PremiosModule { }
