import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { professorApi } from "../services/professor.api";
import { toast } from "@/hooks/use-toast";
import { UserCheck, UserX, Loader2, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface StudentAttendance {
    id: number;
    nombre: string;
    email: string;
    avatar?: string;
    asistio: boolean;
    attendanceId: number | null;
}

interface AttendanceManagerProps {
    levelId: number;
    levelName: string;
}

export function AttendanceManager({ levelId, levelName }: AttendanceManagerProps) {
    const [students, setStudents] = useState<StudentAttendance[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchAttendance();
    }, [levelId]);

    const fetchAttendance = async () => {
        setLoading(true);
        try {
            const data = await professorApi.getAttendance(levelId);
            setStudents(data);
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "No se pudo cargar la lista de estudiantes", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const toggleAttendance = (studentId: number) => {
        setStudents(prev => prev.map(s =>
            s.id === studentId ? { ...s, asistio: !s.asistio } : s
        ));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const records = students.map(s => ({
                estudianteId: s.id,
                asistio: s.asistio
            }));

            // Note: professorId 1 is dummy, backend fallback handles it or we can get from auth
            await professorApi.saveAttendance(levelId, 1, records);
            toast({ title: "Asistencia guardada", description: "La asistencia ha sido registrada exitosamente." });
            fetchAttendance();
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "No se pudo guardar la asistencia", variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    const presentCount = students.filter(s => s.asistio).length;

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <Card className="border-0 shadow-lg bg-white/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl font-bold flex items-center gap-2">
                            <UserCheck className="w-6 h-6 text-blue-500" />
                            Control de Asistencia
                        </CardTitle>
                        <CardDescription className="text-slate-500">
                            Gestiona la presencia de tus estudiantes para el {levelName}
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Presentes</p>
                            <p className="text-2xl font-black text-blue-600">{presentCount} <span className="text-slate-300">/ {students.length}</span></p>
                        </div>
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            className="bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-200"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                            Guardar Asistencia
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="rounded-xl border border-slate-100 overflow-hidden bg-white">
                    <Table>
                        <TableHeader className="bg-slate-50">
                            <TableRow>
                                <TableHead className="w-[100px]">Estado</TableHead>
                                <TableHead>Estudiante</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead className="text-right">Asistió</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {students.map((student) => (
                                <TableRow key={student.id} className="hover:bg-blue-50/30 transition-colors group">
                                    <TableCell>
                                        {student.asistio ? (
                                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200 gap-1 rounded-full px-3">
                                                <UserCheck className="w-3 h-3" />
                                                Presente
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-slate-400 border-slate-200 gap-1 rounded-full px-3">
                                                <UserX className="w-3 h-3" />
                                                Ausente
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="w-8 h-8 border-2 border-slate-100">
                                                <AvatarImage src={student.avatar} />
                                                <AvatarFallback className="bg-blue-100 text-blue-600 font-bold text-xs">
                                                    {student.nombre.substring(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            {student.nombre}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-slate-500 text-sm">
                                        {student.email}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Checkbox
                                            checked={student.asistio}
                                            onCheckedChange={() => toggleAttendance(student.id)}
                                            className="w-5 h-5 border-2 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
