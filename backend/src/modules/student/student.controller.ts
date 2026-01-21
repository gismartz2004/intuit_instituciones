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

    @Get('level/:levelId/contents')
    async getLevelContents(@Param('levelId', ParseIntPipe) levelId: number) {
        return this.studentService.getLevelContents(levelId);
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

    @Get(':id/gamification')
    async getGamificationStats(@Param('id', ParseIntPipe) studentId: number) {
        return this.studentService.getGamificationStats(studentId);
    }

    @Post(':id/xp/add')
    async addXP(
        @Param('id', ParseIntPipe) studentId: number,
        @Body() body: { amount: number; reason: string }
    ) {
        return this.studentService.addXP(studentId, body.amount, body.reason);
    }


}
