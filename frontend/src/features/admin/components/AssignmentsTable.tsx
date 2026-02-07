import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { adminApi } from '../services/admin.api';
import { Assignment } from '../types/admin.types';
import { Search } from 'lucide-react';

export function AssignmentsTable() {
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadAssignments();
    }, []);

    const loadAssignments = async () => {
        try {
            const data = await adminApi.getAllAssignments();
            setAssignments(data);
        } catch (error) {
            console.error('Error loading assignments:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredAssignments = assignments.filter((a) => {
        const searchLower = searchTerm.toLowerCase();
        return (
            a.student?.nombre?.toLowerCase().includes(searchLower) ||
            a.module?.nombreModulo?.toLowerCase().includes(searchLower)
        );
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle>Todas las Asignaciones</CardTitle>
                <CardDescription>
                    Vista completa de asignaciones de módulos a estudiantes
                </CardDescription>
                <div className="relative pt-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                        placeholder="Buscar por estudiante o módulo..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0047AB]"></div>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Estudiante</TableHead>
                                <TableHead>Módulo</TableHead>
                                <TableHead>Fecha Asignación</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredAssignments.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center py-8 text-slate-400">
                                        {searchTerm ? 'No se encontraron resultados' : 'No hay asignaciones'}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredAssignments.map((assignment, idx) => (
                                    <TableRow key={idx}>
                                        <TableCell>{assignment.student?.nombre || 'N/A'}</TableCell>
                                        <TableCell>{assignment.module?.nombreModulo || 'N/A'}</TableCell>
                                        <TableCell>
                                            {assignment.assignment?.fechaAsignacion
                                                ? new Date(assignment.assignment.fechaAsignacion).toLocaleDateString()
                                                : 'N/A'}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}
