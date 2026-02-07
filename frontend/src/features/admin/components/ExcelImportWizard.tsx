import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, Download } from 'lucide-react';
import { adminApi } from '../services/admin.api';
import { ImportPreview } from '../types/admin.types';
import { useToast } from '@/hooks/use-toast';

interface ExcelImportWizardProps {
    onClose: () => void;
    onSuccess: () => void;
}

export function ExcelImportWizard({ onClose, onSuccess }: ExcelImportWizardProps) {
    const [step, setStep] = useState<'upload' | 'preview' | 'importing'>('upload');
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<ImportPreview['students'] | null>(null);
    const [stats, setStats] = useState<any>(null);
    const [importing, setImporting] = useState(false);
    const { toast } = useToast();

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        setFile(selectedFile);

        // Auto-preview
        try {
            const result = await adminApi.previewStudentsFromExcel(selectedFile);
            setPreview(result.students);
            setStats({
                total: result.totalRows,
                valid: result.validRows,
                invalid: result.invalidRows,
            });
            setStep('preview');
        } catch (error) {
            toast({
                title: 'Error al leer archivo',
                description: 'No se pudo procesar el archivo Excel',
                variant: 'destructive',
            });
        }
    };

    const handleImport = async () => {
        if (!file) return;

        setStep('importing');
        setImporting(true);

        try {
            const result = await adminApi.importStudentsFromExcel(file, true);
            toast({
                title: '¡Importación exitosa!',
                description: `Se crearon ${result.imported} estudiantes`,
            });
            onSuccess();
        } catch (error: any) {
            toast({
                title: 'Error al importar',
                description: error.message || 'No se pudieron crear los estudiantes',
                variant: 'destructive',
            });
            setStep('preview');
        } finally {
            setImporting(false);
        }
    };

    const downloadTemplate = () => {
        const template = 'nombre,email,password,plan\nEstudiante 1,estudiante1@test.com,pass123,Basic\nEstudiante 2,estudiante2@test.com,pass456,Pro';
        const blob = new Blob([template], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'plantilla_estudiantes.csv';
        a.click();
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[80vh]">
                <DialogHeader>
                    <DialogTitle>Importar Estudiantes desde Excel</DialogTitle>
                </DialogHeader>

                {step === 'upload' && (
                    <div className="space-y-4">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-200 rounded-lg">
                                    <Upload className="w-16 h-16 text-slate-300 mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">Selecciona un archivo Excel</h3>
                                    <p className="text-sm text-slate-500 mb-4">
                                        Soporta .xlsx y .xls
                                    </p>
                                    <input
                                        type="file"
                                        accept=".xlsx,.xls"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                        id="file-upload"
                                    />
                                    <label htmlFor="file-upload">
                                        <Button variant="outline" asChild>
                                            <span>
                                                <FileSpreadsheet className="w-4 h-4 mr-2" />
                                                Seleccionar Archivo
                                            </span>
                                        </Button>
                                    </label>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex justify-between items-center">
                            <Button variant="ghost" onClick={downloadTemplate} size="sm">
                                <Download className="w-4 h-4 mr-2" />
                                Descargar Plantilla CSV
                            </Button>
                        </div>
                    </div>
                )}

                {step === 'preview' && preview && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                            <Card>
                                <CardContent className="pt-4 text-center">
                                    <div className="text-2xl font-bold">{stats.total}</div>
                                    <div className="text-xs text-slate-500">Total</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-4 text-center">
                                    <div className="text-2xl font-bold text-green-600">{stats.valid}</div>
                                    <div className="text-xs text-slate-500">Válidos</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-4 text-center">
                                    <div className="text-2xl font-bold text-red-600">{stats.invalid}</div>
                                    <div className="text-xs text-slate-500">Con Errores</div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="max-h-96 overflow-y-auto border rounded-lg">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nombre</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Email Padre</TableHead>
                                        <TableHead>Plan</TableHead>
                                        <TableHead>Estado</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {preview.map((student, idx) => (
                                        <TableRow key={idx} className={!student.isValid ? 'bg-red-50' : ''}>
                                            <TableCell>{student.nombre}</TableCell>
                                            <TableCell>{student.email}</TableCell>
                                            <TableCell>{(student as any).emailPadre || <span className="text-slate-300 italic">N/A</span>}</TableCell>
                                            <TableCell>{student.plan}</TableCell>
                                            <TableCell>
                                                {student.isValid ? (
                                                    <Badge variant="outline" className="bg-green-50 text-green-700">
                                                        <CheckCircle2 className="w-3 h-3 mr-1" />
                                                        Válido
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="bg-red-50 text-red-700">
                                                        <AlertCircle className="w-3 h-3 mr-1" />
                                                        {student.errors[0]?.message}
                                                    </Badge>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={onClose}>
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleImport}
                                disabled={stats.valid === 0 || importing}
                            >
                                Importar {stats.valid} Estudiantes
                            </Button>
                        </div>
                    </div>
                )}

                {step === 'importing' && (
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0047AB] mb-4"></div>
                        <p className="text-slate-500">Creando estudiantes...</p>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
