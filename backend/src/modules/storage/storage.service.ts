
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

    async deleteFile(url: string): Promise<void> {
        const storageType = process.env.STORAGE_TYPE || 'local';
        const filename = url.split('/').pop();

        if (!filename) throw new Error('Invalid URL');

        if (storageType === 'local') {
            await this.deleteLocal(filename);
        } else if (storageType === 'sftp') {
            try {
                await this.deleteSftp(filename);
            } catch (error) {
                this.logger.warn(`SFTP Delete failed, trying local: ${error.message}`);
                await this.deleteLocal(filename);
            }
        }
    }

    async uploadFile(file: Express.Multer.File): Promise<string> {
        const storageType = process.env.STORAGE_TYPE || 'local';

        if (storageType === 'local') {
            return this.uploadLocal(file);
        } else if (storageType === 'sftp') {
            try {
                return await this.uploadSftp(file);
            } catch (error) {
                this.logger.warn(`SFTP Upload failed, falling back to local: ${error.message}`);
                return this.uploadLocal(file);
            }
        } else {
            throw new Error(`Invalid STORAGE_TYPE: ${storageType}`);
        }
    }

    private async uploadLocal(file: Express.Multer.File): Promise<string> {
        const uploadDir = './uploads';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const filename = `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
        const filepath = path.join(uploadDir, filename);

        this.logger.log(`Saving file locally to ${filepath}`);
        fs.writeFileSync(filepath, file.buffer);

        const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';
        return `${baseUrl}/uploads/${filename}`;
    }

    private async uploadSftp(file: Express.Multer.File): Promise<string> {
        const config = {
            host: process.env.FTP_HOST,
            port: parseInt(process.env.FTP_PORT || '22'),
            username: process.env.FTP_USER,
            password: process.env.FTP_PASSWORD,
            readyTimeout: 10000, // 10s
        };

        const maxRetries = 2;
        let lastError: Error | null = null;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                this.logger.log(`Attempt ${attempt}: Connecting to SFTP ${config.host}:${config.port}...`);
                await this.sftp.connect(config);

                const remoteDir = process.env.FTP_REMOTE_PATH || '/public_html/uploads';
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

                const publicBaseUrl = process.env.FTP_PUBLIC_URL || '';
                const cleanBaseUrl = publicBaseUrl.replace(/\/$/, '');
                return `${cleanBaseUrl}/${filename}`;

            } catch (err) {
                this.logger.error(`SFTP Attempt ${attempt} Failed`, err.message);
                lastError = err;
                try { await this.sftp.end(); } catch (e) { }

                if (attempt < maxRetries) {
                    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
                }
            }
        }

        throw lastError || new Error('Failed to upload file to remote server');
    }

    private async deleteLocal(filename: string): Promise<void> {
        const uploadDir = './uploads';
        const filepath = path.join(uploadDir, filename);

        if (fs.existsSync(filepath)) {
            this.logger.log(`Deleting local file: ${filepath}`);
            fs.unlinkSync(filepath);
        }
    }

    private async deleteSftp(filename: string): Promise<void> {
        const config = {
            host: process.env.FTP_HOST,
            port: parseInt(process.env.FTP_PORT || '22'),
            username: process.env.FTP_USER,
            password: process.env.FTP_PASSWORD,
            readyTimeout: 10000,
        };

        try {
            await this.sftp.connect(config);
            const remoteDir = process.env.FTP_REMOTE_PATH || '/public_html/uploads';
            const remotePath = `${remoteDir}/${filename}`;

            if (await this.sftp.exists(remotePath)) {
                this.logger.log(`Deleting SFTP file: ${remotePath}`);
                await this.sftp.delete(remotePath);
            }
            await this.sftp.end();
        } catch (error) {
            this.logger.error(`SFTP Delete Failed: ${error.message}`);
            throw error;
        } finally {
            try { await this.sftp.end(); } catch (e) { }
        }
    }
}
