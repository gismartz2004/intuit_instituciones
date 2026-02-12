
import { Controller } from '@nestjs/common';
import { SpecialistService } from './specialist.service';

@Controller('specialist')
export class SpecialistController {
    constructor(private readonly specialistService: SpecialistService) { }
}
