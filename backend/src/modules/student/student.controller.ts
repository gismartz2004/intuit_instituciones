import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
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
}
