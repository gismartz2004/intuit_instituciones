
import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ProfessorService } from '../professor.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('professor/grading')
@UseGuards(JwtAuthGuard)
export class GradingController {
    constructor(private readonly professorService: ProfessorService) { }

    @Get('submissions')
    async getSubmissions(@Request() req: any) {
        // Assuming req.user exists from JwtAuthGuard
        // const professorId = req.user.userId; 
        const professorId = 1; // Hardcoded for now until full auth context is verified
        return this.professorService.getSubmissions(professorId);
    }

    @Post('submissions/:id/grade')
    async gradeSubmission(
        @Param('id') id: string,
        @Body() body: { type: 'rag' | 'ha', grade: number, feedback: string }
    ) {
        return this.professorService.gradeSubmission(parseInt(id), body.type, body.grade, body.feedback);
    }
}
