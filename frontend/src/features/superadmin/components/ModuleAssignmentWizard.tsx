import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
    superadminApi,
    Student,
    ModuleWithStats
} from '../services/superadmin.api';
import { useToast } from '@/hooks/use-toast';
import { Search, BookOpen, Users, CheckCircle } from 'lucide-react';

interface ModuleAssignmentWizardProps {
    onClose: () => void;
    onSuccess: () => void;
}

export function ModuleAssignmentWizard({ onClose, onSuccess }: ModuleAssignmentWizardProps) {
    const [step, setStep] = useState<1 | 2>(1); // 1: Select Module, 2: Select Students
    const [modules, setModules] = useState<ModuleWithStats[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [selectedModule, setSelectedModule] = useState<ModuleWithStats | null>(null);
    const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);

    const [searchTerm, setSearchTerm] = useState('');
    const { toast } = useToast();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [modulesData, studentsData] = await Promise.all([
                superadminApi.getAllModules(),
                superadminApi.getSystemStudents()
            ]);
            setModules(modulesData);
            setStudents(studentsData);
        } catch (error) {
            toast({
                title: 'Error al cargar datos',
                description: 'No se pudieron recuperar los módulos o estudiantes',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async () => {
        if (!selectedModule || selectedStudentIds.length === 0) return;

        setSubmitting(true);
        try {
            await superadminApi.bulkAssignModules(selectedModule.id, selectedStudentIds);
            toast({
                title: '¡Asignación exitosa!',
                description: `Se asignó el módulo ${selectedModule.nombreModulo} a ${selectedStudentIds.length} estudiantes`,
            });
            onSuccess();
        } catch (error: any) {
            toast({
                title: 'Error al asignar',
                description: error.message || 'No se pudieron realizar las asignaciones',
                variant: 'destructive',
            });
        } finally {
            setSubmitting(false);
        }
    };

    const filteredModules = modules.filter(m =>
        m.nombreModulo.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredStudents = students.filter(s =>
        s.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleStudent = (id: number) => {
        setSelectedStudentIds(prev =>
            prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
        );
    };

    const toggleAllStudents = () => {
        if (selectedStudentIds.length === students.length) {
            setSelectedStudentIds([]);
        } else {
            setSelectedStudentIds(students.map(s => s.id));
        }
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="px-6 py-4 border-b">
                    <DialogTitle className="flex items-center gap-2">
                        {step === 1 ? <BookOpen className="w-5 h-5 text-blue-600" /> : <Users className="w-5 h-5 text-blue-600" />}
                        {step === 1 ? 'Paso 1: Seleccionar Módulo' : 'Paso 2: Seleccionar Estudiantes'}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6">
                    <div className="relative mb-6">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <Input
                            placeholder={step === 1 ? "Buscar módulo..." : "Buscar por nombre o email..."}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 h-11 rounded-xl"
                        />
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
                            <p className="text-slate-500 font-medium">Cargando...</p>
                        </div>
                    ) : step === 1 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredModules.map((mod) => (
                                <Card
                                    key={mod.id}
                                    className={`cursor-pointer transition-all border-2 ${selectedModule?.id === mod.id ? 'border-blue-500 bg-blue-50/50 shadow-md scale-[1.02]' : 'hover:border-slate-200 hover:shadow-sm'}`}
                                    onClick={() => setSelectedModule(mod)}
                                >
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${selectedModule?.id === mod.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                                <BookOpen className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-800">{mod.nombreModulo}</h3>
                                                <p className="text-xs text-slate-500">{mod.levelCount} Niveles • {mod.studentCount} Estudiantes</p>
                                            </div>
                                        </div>
                                        {selectedModule?.id === mod.id && (
                                            <CheckCircle className="w-5 h-5 text-blue-600" />
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="border rounded-xl overflow-hidden bg-white">
                            <Table>
                                <TableHeader className="bg-slate-50">
                                    <TableRow>
                                        <TableHead className="w-[50px]">
                                            <Checkbox
                                                checked={selectedStudentIds.length === students.length && students.length > 0}
                                                onCheckedChange={toggleAllStudents}
                                            />
                                        </TableHead>
                                        <TableHead>Estudiante</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead className="text-right">Estado</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredStudents.map((student) => (
                                        <TableRow key={student.id} className={selectedStudentIds.includes(student.id) ? 'bg-blue-50/30' : ''}>
                                            <TableCell>
                                                <Checkbox
                                                    checked={selectedStudentIds.includes(student.id)}
                                                    onCheckedChange={() => toggleStudent(student.id)}
                                                />
                                            </TableCell>
                                            <TableCell className="font-medium text-slate-800">{student.nombre}</TableCell>
                                            <TableCell className="text-slate-500">{student.email}</TableCell>
                                            <TableCell className="text-right">
                                                <Badge variant={student.activo ? "default" : "secondary"} className={student.activo ? "bg-green-100 text-green-700 hover:bg-green-100 border-none" : ""}>
                                                    {student.activo ? "Activo" : "Inactivo"}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>

                <DialogFooter className="px-6 py-4 border-t bg-slate-50 gap-2">
                    {step === 2 && (
                        <div className="mr-auto flex items-center gap-2">
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1">
                                {selectedStudentIds.length} seleccionados
                            </Badge>
                        </div>
                    )}
                    <Button variant="ghost" onClick={onClose} className="rounded-xl">
                        Cancelar
                    </Button>
                    {step === 2 ? (
                        <>
                            <Button variant="outline" onClick={() => setStep(1)} className="rounded-xl">
                                Atrás
                            </Button>
                            <Button
                                onClick={handleAssign}
                                disabled={selectedStudentIds.length === 0 || submitting}
                                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8 shadow-md shadow-blue-500/20"
                            >
                                {submitting ? 'Asignando...' : 'Finalizar Asignación'}
                            </Button>
                        </>
                    ) : (
                        <Button
                            disabled={!selectedModule}
                            onClick={() => {
                                setStep(2);
                                setSearchTerm('');
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8 shadow-md shadow-blue-500/20"
                        >
                            Siguiente
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
