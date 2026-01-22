
import {
    Controller,
    Post,
    UseInterceptors,
    UploadedFile,
    Body,
    Param,
    UseGuards,
    BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StudentService } from '../student.service';
import { StorageService } from '../../storage/storage.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'; // Assuming this exists or similar

@Controller('student')
// @UseGuards(JwtAuthGuard)
export class StudentUploadController {
    constructor(
        private readonly studentService: StudentService,
        private readonly storageService: StorageService
    ) { }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file', {
        limits: {
            fileSize: 10 * 1024 * 1024, // 10MB
        },
    }))
    async uploadFile(@UploadedFile() file: Express.Multer.File) {
        console.log('--- UPLOAD REQUEST ---');
        console.log('File received:', file ? {
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            hasBuffer: !!file.buffer
        } : 'UNDEFINED');

        if (!file) {
            console.error('Upload Error: No file in request');
            throw new BadRequestException('No file uploaded');
        }

        try {
            const url = await this.storageService.uploadFile(file);
            console.log('Upload Success:', url);
            return {
                url,
                filename: file.originalname,
                mimetype: file.mimetype,
            };
        } catch (error) {
            console.error('Upload error in StorageService:', error);
            throw new BadRequestException('Failed to upload file: ' + error.message);
        }
    }

    @Post('rag/submit')
    async submitRagProgress(
        @Body() body: { studentId: number; plantillaRagId: number; pasoIndice: number; archivoUrl: string; tipoArchivo: string }
    ) {
        return this.studentService.submitRagProgress(body);
    }

    @Post('ha/submit')
    async submitHaEvidence(
        @Body() body: { studentId: number; plantillaHaId: number; archivosUrls: string[]; comentarioEstudiante: string }
    ) {
        return this.studentService.submitHaEvidence(body);
    }
}
