import { Controller, Get, Post, Param, ParseIntPipe, Body } from '@nestjs/common';
import { StudentService } from './student.service';

@Controller('student')
export class StudentController {
    constructor(private readonly studentService: StudentService) { }

    @Get(':id/modules')
    async getModules(@Param('id', ParseIntPipe) id: number) {
        return this.studentService.getStudentModules(id);
    }

    @Get(':id/progress')
    async getProgress(@Param('id', ParseIntPipe) id: number) {
        return this.studentService.getStudentProgress(id);
    }

    @Get(':id/curriculum')
    async getCurriculum(@Param('id', ParseIntPipe) id: number) {
        return this.studentService.getStudentCurriculum(id);
    }

    @Get('level/:levelId/contents')
    async getLevelContents(@Param('levelId', ParseIntPipe) levelId: number) {
        return this.studentService.getLevelContents(levelId);
    }

    @Post(':id/content/view')
    async trackContentView(@Param('id', ParseIntPipe) studentId: number) {
        return this.studentService['gamificationService'].trackContentView(studentId);
    }

    @Get(':id/module/:moduleId/progress')
    async getModuleLevelProgress(
        @Param('id', ParseIntPipe) studentId: number,
        @Param('moduleId', ParseIntPipe) moduleId: number
    ) {
        return this.studentService.getStudentLevelProgress(studentId, moduleId);
    }

    @Get(':id/level/:levelId/progress')
    async getLevelProgress(
        @Param('id', ParseIntPipe) studentId: number,
        @Param('levelId', ParseIntPipe) levelId: number
    ) {
        return this.studentService.calculateLevelProgress(studentId, levelId);
    }

    @Get(':id/level/:levelId/attendance')
    async getAttendanceStatus(
        @Param('id', ParseIntPipe) studentId: number,
        @Param('levelId', ParseIntPipe) levelId: number
    ) {
        return this.studentService.getAttendanceStatus(studentId, levelId);
    }

    @Get(':id/gamification')
    async getGamificationStats(@Param('id', ParseIntPipe) studentId: number) {
        return this.studentService.getGamificationStats(studentId);
    }

    @Get(':id/missions')
    async getMissions(@Param('id', ParseIntPipe) studentId: number) {
        return this.studentService.getAvailableMissions(studentId);
    }

    @Get('leaderboard/global')
    async getLeaderboard() {
        return this.studentService.getGlobalLeaderboard();
    }

    @Get(':id/xp/add')
    async addXP(
        @Param('id', ParseIntPipe) studentId: number,
        @Body() body: { amount: number; reason: string }
    ) {
        return this.studentService.addXP(studentId, body.amount, body.reason);
    }

    @Get(':id/rag/:templateId/submissions')
    async getRagSubmissions(
        @Param('id', ParseIntPipe) studentId: number,
        @Param('templateId', ParseIntPipe) templateId: number
    ) {
        if (!templateId || isNaN(templateId)) return [];
        return this.studentService.getRagSubmissions(studentId, templateId);
    }

    @Get(':id/ha/:templateId/submissions')
    async getHaSubmissions(
        @Param('id', ParseIntPipe) studentId: number,
        @Param('templateId', ParseIntPipe) templateId: number
    ) {
        if (!templateId || isNaN(templateId)) return [];
        return this.studentService.getHaSubmissions(studentId, templateId);
    }

}
