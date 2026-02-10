import {
    Controller,
    Get,
    Post,
    Patch,
    Body,
    Param,
    ParseIntPipe,
    UseInterceptors,
    UploadedFile,
    BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminService } from './admin.service';
import { SchedulerService } from '../notifications/scheduler.service';

@Controller('admin')
export class AdminController {
    constructor(
        private readonly adminService: AdminService,
        private readonly schedulerService: SchedulerService,
    ) { }

    @Get('modules')
    async getAllModules() {
        return this.adminService.getAllModules();
    }

    @Get('students')
    async getSystemStudents() {
        return this.adminService.getSystemStudents();
    }

    @Get('professors')
    async getSystemProfessors() {
        return this.adminService.getSystemProfessors();
    }

    @Get('modules/:id/content')
    async getModuleContent(@Param('id', ParseIntPipe) moduleId: number) {
        return this.adminService.getModuleContent(moduleId);
    }

    @Get('assignments')
    async getAllAssignments() {
        return this.adminService.getAllAssignments();
    }

    @Post('assignments/bulk')
    async bulkAssignModules(@Body() body: { moduleId: number; studentIds: number[]; professorId?: number }) {
        return this.adminService.bulkAssignModules(body.moduleId, body.studentIds, body.professorId);
    }

    @Get('modules/:id/assignments')
    async getModuleAssignments(@Param('id', ParseIntPipe) moduleId: number) {
        return this.adminService.getAssignmentsByModule(moduleId);
    }

    @Post('modules/:id/professor')
    async assignProfessorToModule(
        @Param('id', ParseIntPipe) moduleId: number,
        @Body('professorId', ParseIntPipe) professorId: number,
    ) {
        return this.adminService.assignProfessorToModule(moduleId, professorId);
    }

    @Get('modules/:id/professors')
    async getModuleProfessors(@Param('id', ParseIntPipe) moduleId: number) {
        return this.adminService.getModuleProfessors(moduleId);
    }

    @Post('modules/:id/professors/add')
    async addProfessorToModule(
        @Param('id', ParseIntPipe) moduleId: number,
        @Body('professorId', ParseIntPipe) professorId: number,
    ) {
        return this.adminService.addProfessorToModule(moduleId, professorId);
    }

    @Post('modules/:id/professors/remove')
    async unassignProfessorFromModule(
        @Param('id', ParseIntPipe) moduleId: number,
        @Body('professorId', ParseIntPipe) professorId: number,
    ) {
        return this.adminService.unassignProfessorFromModule(moduleId, professorId);
    }

    @Post('modules/:id/assignments/unassign')
    async unassignModule(
        @Param('id', ParseIntPipe) moduleId: number,
        @Body('studentId', ParseIntPipe) studentId: number,
    ) {
        return this.adminService.unassignModule(moduleId, studentId);
    }

    @Post('students/preview')
    @UseInterceptors(FileInterceptor('file'))
    async previewStudentsFromExcel(@UploadedFile() file: Express.Multer.File) {
        if (!file) throw new BadRequestException('No file provided');
        return this.adminService.previewStudentsFromExcel(file.buffer);
    }

    @Post('students/import')
    @UseInterceptors(FileInterceptor('file'))
    async importStudentsFromExcel(
        @UploadedFile() file: Express.Multer.File,
        @Body('onlyValid') onlyValid: boolean = true,
    ) {
        if (!file) throw new BadRequestException('No file provided');
        return this.adminService.importStudentsFromExcel(file.buffer, onlyValid);
    }

    @Get('stats')
    async getSystemStats() {
        return this.adminService.getSystemStats();
    }

    @Get('planes')
    async getPlanes() {
        return this.adminService.getPlanes();
    }

    @Post('planes')
    async createPlan(@Body() payload: any) {
        return this.adminService.createPlan(payload);
    }

    @Patch('planes/:id')
    async updatePlan(
        @Param('id', ParseIntPipe) id: number,
        @Body() payload: any,
    ) {
        return this.adminService.updatePlan(id, payload);
    }

    @Post('planes/:id/delete') // Usamos POST para delete por simplicidad o DELETE directo
    async deletePlan(@Param('id', ParseIntPipe) id: number) {
        return this.adminService.deletePlan(id);
    }

    @Post('test-notifications')
    async triggerNotifications() {
        await this.schedulerService.checkProfessorCompliance();
        await this.schedulerService.checkStudentActivity();
        return { success: true, message: 'Notification checks triggered' };
    }

    @Post('users/:id/reset')
    async resetUserProgress(@Param('id', ParseIntPipe) userId: number) {
        return this.adminService.resetUserProgress(userId);
    }

    @Post('users/bulk-reset')
    async bulkResetUsers(@Body() body: { userIds: number[] }) {
        if (!body.userIds || !Array.isArray(body.userIds)) {
            throw new BadRequestException('Invalid userIds format');
        }
        const ids = body.userIds.map(id => Number(id)).filter(id => !isNaN(id));
        return this.adminService.bulkResetUsers(ids);
    }
}
