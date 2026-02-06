import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    ParseIntPipe,
    UseInterceptors,
    UploadedFile,
    BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SuperadminService } from './superadmin.service';
import { SchedulerService } from '../notifications/scheduler.service';

@Controller('superadmin')
export class SuperadminController {
    constructor(
        private readonly superadminService: SuperadminService,
        private readonly schedulerService: SchedulerService,
    ) { }

    /**
     * Get all modules with statistics
     * GET /api/superadmin/modules
     */
    @Get('modules')
    async getAllModules() {
        return this.superadminService.getAllModules();
    }

    @Get('students')
    async getSystemStudents() {
        return this.superadminService.getSystemStudents();
    }

    /**
     * Get complete content of a module (RAG, HA, PIM) - READ ONLY
     * GET /api/superadmin/modules/:id/content
     */
    @Get('modules/:id/content')
    async getModuleContent(@Param('id', ParseIntPipe) moduleId: number) {
        return this.superadminService.getModuleContent(moduleId);
    }

    /**
     * Get all assignments in the system
     * GET /api/superadmin/assignments
     */
    @Get('assignments')
    async getAllAssignments() {
        return this.superadminService.getAllAssignments();
    }

    @Post('assignments/bulk')
    async bulkAssignModules(
        @Body() body: { moduleId: number; studentIds: number[] },
    ) {
        return this.superadminService.bulkAssignModules(
            body.moduleId,
            body.studentIds,
        );
    }

    /**
     * Get students assigned to a specific module
     */
    @Get('modules/:id/assignments')
    async getModuleAssignments(@Param('id', ParseIntPipe) moduleId: number) {
        return this.superadminService.getAssignmentsByModule(moduleId);
    }

    /**
     * Remove assignment
     */
    @Post('modules/:id/assignments/unassign')
    async unassignModule(
        @Param('id', ParseIntPipe) moduleId: number,
        @Body('studentId', ParseIntPipe) studentId: number,
    ) {
        return this.superadminService.unassignModule(moduleId, studentId);
    }

    /**
     * Preview students from Excel file (validation only)
     * POST /api/superadmin/students/preview
     */
    @Post('students/preview')
    @UseInterceptors(FileInterceptor('file'))
    async previewStudentsFromExcel(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('No se proporcionó archivo');
        }

        return this.superadminService.previewStudentsFromExcel(file.buffer);
    }

    /**
     * Import students from Excel file
     * POST /api/superadmin/students/import
     * Body: { onlyValid: boolean }
     */
    @Post('students/import')
    @UseInterceptors(FileInterceptor('file'))
    async importStudentsFromExcel(
        @UploadedFile() file: Express.Multer.File,
        @Body('onlyValid') onlyValid: boolean = true,
    ) {
        if (!file) {
            throw new BadRequestException('No se proporcionó archivo');
        }

        return this.superadminService.importStudentsFromExcel(
            file.buffer,
            onlyValid,
        );
    }

    /**
     * Get system statistics
     * GET /api/superadmin/stats
     */
    @Get('stats')
    async getSystemStats() {
        return this.superadminService.getSystemStats();
    }

    /**
     * Test endpoint to manually trigger notification checks
     */
    @Post('test-notifications')
    async triggerNotifications() {
        await this.schedulerService.checkProfessorCompliance();
        await this.schedulerService.checkStudentActivity();
        return { success: true, message: 'Notification checks triggered' };
    }
}
