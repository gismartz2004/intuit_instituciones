import { Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';

interface ValidationError {
    row: number;
    field: string;
    message: string;
}

interface StudentRow {
    nombre?: string;
    email?: string;
    password?: string;
    plan?: string;
    email_padre?: string;
}

export interface ParsedStudent {
    nombre: string;
    email: string;
    password: string;
    plan: string;
    emailPadre?: string;
    isValid: boolean;
    errors: ValidationError[];
}

@Injectable()
export class ExcelProcessorService {
    /**
     * Parse Excel file and extract student data with validation
     */
    parseStudentsFromExcel(buffer: Buffer): {
        students: ParsedStudent[];
        totalRows: number;
        validRows: number;
        invalidRows: number;
    } {
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert sheet to JSON with header detection
        const rawData: StudentRow[] = XLSX.utils.sheet_to_json(worksheet, {
            defval: undefined,
        });

        const students: ParsedStudent[] = [];

        rawData.forEach((row, index) => {
            const errors: ValidationError[] = [];
            const rowNumber = index + 2; // Excel rows start at 1, header is row 1

            // Extract and normalize data
            const nombre = this.normalizeString(row.nombre);
            const email = this.normalizeString(row.email);
            const password = this.normalizeString(row.password);
            const plan = this.normalizeString(row.plan) || 'Basic';
            const emailPadre = this.normalizeString(row.email_padre);

            // Validate required fields
            if (!nombre) {
                errors.push({
                    row: rowNumber,
                    field: 'nombre',
                    message: 'El nombre es requerido',
                });
            }

            if (!email) {
                errors.push({
                    row: rowNumber,
                    field: 'email',
                    message: 'El email es requerido',
                });
            } else if (!this.isValidEmail(email)) {
                errors.push({
                    row: rowNumber,
                    field: 'email',
                    message: 'Formato de email inválido',
                });
            }

            // Validate plan if provided
            if (plan && !['Basic', 'Pro'].includes(plan)) {
                errors.push({
                    row: rowNumber,
                    field: 'plan',
                    message: 'Plan debe ser "Basic" o "Pro"',
                });
            }

            // Generate password if not provided
            const finalPassword = password || this.generatePassword();

            students.push({
                nombre: nombre || '',
                email: email || '',
                password: finalPassword,
                plan: plan,
                emailPadre: emailPadre,
                isValid: errors.length === 0,
                errors,
            });
        });

        const validRows = students.filter((s) => s.isValid).length;
        const invalidRows = students.length - validRows;

        return {
            students,
            totalRows: students.length,
            validRows,
            invalidRows,
        };
    }

    /**
     * Validate email uniqueness against existing users
     */
    async validateEmailUniqueness(
        students: ParsedStudent[],
        existingEmails: string[],
    ): Promise<ParsedStudent[]> {
        const emailSet = new Set(existingEmails.map((e) => e.toLowerCase()));

        return students.map((student, index) => {
            if (emailSet.has(student.email.toLowerCase())) {
                student.errors.push({
                    row: index + 2,
                    field: 'email',
                    message: 'Este email ya existe en el sistema',
                });
                student.isValid = false;
            }
            return student;
        });
    }

    /**
     * Normalize string (trim and handle empty values)
     */
    private normalizeString(value: any): string {
        if (value === null || value === undefined) return '';
        return String(value).trim();
    }

    /**
     * Validate email format
     */
    private isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Generate random password
     */
    private generatePassword(length: number = 8): string {
        const charset =
            'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let password = '';
        for (let i = 0; i < length; i++) {
            password += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        return password;
    }

    /**
     * Get detected columns from Excel
     */
    getExcelColumns(buffer: Buffer): string[] {
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
        const columns: string[] = [];

        for (let col = range.s.c; col <= range.e.c; col++) {
            const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
            const cell = worksheet[cellAddress];
            if (cell && cell.v) {
                columns.push(String(cell.v));
            }
        }

        return columns;
    }
}
