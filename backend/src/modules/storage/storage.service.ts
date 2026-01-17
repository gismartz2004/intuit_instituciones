
import { Injectable, Logger } from '@nestjs/common';
import Client from 'ssh2-sftp-client';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class StorageService {
    private readonly logger = new Logger(StorageService.name);
    private sftp: Client;

    constructor() {
        this.sftp = new Client();
    }

    async uploadFile(file: Express.Multer.File): Promise<string> {
        const storageType = process.env.STORAGE_TYPE || 'local';

        if (storageType === 'local') {
            return this.uploadLocal(file);
        } else if (storageType === 'sftp') {
            return this.uploadSftp(file);
        } else {
            throw new Error(`Invalid STORAGE_TYPE: ${storageType}`);
        }
    }

    private async uploadLocal(file: Express.Multer.File): Promise<string> {
        // Ideally this would reuse existing logic or just return the path if already saved by diskStorage
        // But since we are moving to memoryStorage for the controller, we need to save it manually if local
        const uploadDir = './uploads';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }

        // Generate a unique filename if not already present
        // Note: If using memoryStorage, file.filename is undefined, we use originalname + timestamp
        const filename = `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
        const filepath = path.join(uploadDir, filename);

        fs.writeFileSync(filepath, file.buffer);

        // Return localhost URL
        const baseUrl = process.env.API_BASE_URL || 'http://localhost:8080';
        return `${baseUrl}/uploads/${filename}`;
    }

    private async uploadSftp(file: Express.Multer.File): Promise<string> {
        const config = {
            host: process.env.FTP_HOST,
            port: parseInt(process.env.FTP_PORT || '22'),
            username: process.env.FTP_USER,
            password: process.env.FTP_PASSWORD,
        };

        try {
            this.logger.log(`Connecting to SFTP ${config.host}:${config.port}...`);
            await this.sftp.connect(config);

            const remoteDir = process.env.FTP_REMOTE_PATH || '/public_html/uploads';
            // Ensure directory exists (recursive)
            const dirExists = await this.sftp.exists(remoteDir);
            if (!dirExists) {
                this.logger.log(`Creating remote directory: ${remoteDir}`);
                await this.sftp.mkdir(remoteDir, true);
            }

            const filename = `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
            const remotePath = `${remoteDir}/${filename}`;

            this.logger.log(`Uploading to ${remotePath}...`);
            await this.sftp.put(file.buffer, remotePath);

            await this.sftp.end();

            // Return Public URL
            const publicBaseUrl = process.env.FTP_PUBLIC_URL || '';
            // Remove trailing slash if present
            const cleanBaseUrl = publicBaseUrl.replace(/\/$/, '');
            return `${cleanBaseUrl}/${filename}`;

        } catch (err) {
            this.logger.error('SFTP Upload Failed', err);
            // Clean up connection just in case
            try { await this.sftp.end(); } catch (e) { }
            throw new Error('Failed to upload file to remote server');
        }
    }
}
