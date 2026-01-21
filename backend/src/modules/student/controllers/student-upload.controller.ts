
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
import { diskStorage } from 'multer';
import { extname } from 'path';
import { StudentService } from '../student.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'; // Assuming this exists or similar

@Controller('student')
@UseGuards(JwtAuthGuard)
export class StudentUploadController {
    constructor(private readonly studentService: StudentService) { }

    @Post('upload')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: './uploads/evidence',
                filename: (req, file, cb) => {
                    const randomName = Array(32)
                        .fill(null)
                        .map(() => Math.round(Math.random() * 16).toString(16))
                        .join('');
                    cb(null, `${randomName}${extname(file.originalname)}`);
                },
            }),
            limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
        }),
    )
    async uploadFile(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }
        // Return the URL to access the file
        // Assuming backend serves static files from /uploads
        const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';
        return {
            url: `${baseUrl}/uploads/evidence/${file.filename}`,
            filename: file.filename,
            mimetype: file.mimetype,
        };
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
