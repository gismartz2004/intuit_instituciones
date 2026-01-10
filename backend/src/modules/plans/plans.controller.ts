import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { PlansService } from './plans.service';

@Controller('plans')
export class PlansController {
    constructor(private readonly plansService: PlansService) { }

    @Get(':id/features')
    getPlanFeatures(@Param('id', ParseIntPipe) planId: number) {
        return this.plansService.getPlanFeatures(planId);
    }

    @Get()
    getAllPlans() {
        return this.plansService.getAllPlans();
    }
}
