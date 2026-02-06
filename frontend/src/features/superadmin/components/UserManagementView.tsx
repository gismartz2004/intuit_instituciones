import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { superadminApi, Student, ModuleWithStats } from '../services/superadmin.api';
import { useToast } from '@/hooks/use-toast';
import { Search, Users, Trash2, BookOpen, AlertTriangle, CheckCircle, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function UserManagementView() {
    const [students, setStudents] = useState<Student[]>([]);
    const [modules, setModules] = useState<ModuleWithStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);

    // Dialogs
    const [showModuleAssignDialog, setShowModuleAssignDialog] = useState(false);
    const [showResetDialog, setShowResetDialog] = useState(false);
    const [selectedModuleIds, setSelectedModuleIds] = useState<number[]>([]);
    const [submitting, setSubmitting] = useState(false);

    // Create User Dialog State
    const [showCreateUserDialog, setShowCreateUserDialog] = useState(false);
    const [newUser, setNewUser] = useState({
        nombre: '',
        email: '',
        password: '',
        emailPadre: '',
        roleId: '3', // Default to Student
        planId: '1', // Default to Basic
    });

    const { toast } = useToast();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [studentsData, modulesData] = await Promise.all([
                superadminApi.getSystemStudents(),
                superadminApi.getAllModules(),
            ]);
            setStudents(studentsData);
            setModules(modulesData);
        } catch (error) {
            toast({
                title: 'Error al cargar datos',
                description: 'No se pudieron recuperar los usuarios o módulos',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const filteredStudents = students.filter(
        (s) =>
            s.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleUser = (id: number) => {
        setSelectedUserIds((prev) =>
            prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
        );
    };

    const toggleAllUsers = () => {
        if (selectedUserIds.length === filteredStudents.length) {
            setSelectedUserIds([]);
        } else {
            setSelectedUserIds(filteredStudents.map((s) => s.id));
        }
    };

    const handleBulkAssignModules = async () => {
        if (selectedUserIds.length === 0 || selectedModuleIds.length === 0) return;

        setSubmitting(true);
        try {
            // Assign each module to all selected users
            await Promise.all(
                selectedModuleIds.map((moduleId) =>
                    superadminApi.bulkAssignModules(moduleId, selectedUserIds)
                )
            );

            toast({
                title: '¡Asignación exitosa!',
                description: `Se asignaron ${selectedModuleIds.length} módulos a ${selectedUserIds.length} usuarios`,
            });
            setShowModuleAssignDialog(false);
            setSelectedModuleIds([]);
            setSelectedUserIds([]);
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

    const handleBulkReset = async () => {
        if (selectedUserIds.length === 0) return;

        setSubmitting(true);
        try {
            const response = await fetch('/api/superadmin/users/bulk-reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userIds: selectedUserIds }),
            });

            if (!response.ok) throw new Error('Error al resetear usuarios');

            const result = await response.json();
            toast({
                title: '¡Reset exitoso!',
                description: result.message,
            });
            setShowResetDialog(false);
            setSelectedUserIds([]);
        } catch (error: any) {
            toast({
                title: 'Error al resetear',
                description: error.message || 'No se pudieron resetear los usuarios',
                variant: 'destructive',
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleCreateUser = async () => {
        if (!newUser.nombre || !newUser.email || !newUser.password) {
            toast({
                title: 'Campos requeridos',
                description: 'Por favor completa nombre, email y contraseña',
                variant: 'destructive',
            });
            return;
        }

        setSubmitting(true);
        try {
            await superadminApi.createUser({
                ...newUser,
                roleId: parseInt(newUser.roleId),
                planId: parseInt(newUser.planId),
            });

            toast({
                title: '¡Usuario creado!',
                description: `El usuario ${newUser.nombre} ha sido creado exitosamente.`,
            });
            setShowCreateUserDialog(false);
            setNewUser({
                nombre: '',
                email: '',
                password: '',
                emailPadre: '',
                roleId: '3',
                planId: '1',
            });
            loadData(); // Reload list
        } catch (error: any) {
            toast({
                title: 'Error al crear',
                description: error.message || 'No se pudo crear el usuario',
                variant: 'destructive',
            });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-slate-500 font-medium">Cargando usuarios...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Users className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <CardTitle>Gestión de Usuarios</CardTitle>
                                <p className="text-sm text-slate-500 mt-1">
                                    Asigna módulos y gestiona el progreso de los estudiantes
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                onClick={() => setShowCreateUserDialog(true)}
                                className="bg-blue-600 hover:bg-blue-700 rounded-xl"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Crear Usuario
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setShowModuleAssignDialog(true)}
                                disabled={selectedUserIds.length === 0}
                                className="rounded-xl"
                            >
                                <BookOpen className="w-4 h-4 mr-2" />
                                Asignar Módulos ({selectedUserIds.length})
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => setShowResetDialog(true)}
                                disabled={selectedUserIds.length === 0}
                                className="rounded-xl"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Resetear ({selectedUserIds.length})
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="relative mb-6">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <Input
                            placeholder="Buscar por nombre o email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 h-11 rounded-xl"
                        />
                    </div>

                    <div className="border rounded-xl overflow-hidden bg-white">
                        <Table>
                            <TableHeader className="bg-slate-50">
                                <TableRow>
                                    <TableHead className="w-[50px]">
                                        <Checkbox
                                            checked={
                                                selectedUserIds.length === filteredStudents.length &&
                                                filteredStudents.length > 0
                                            }
                                            onCheckedChange={toggleAllUsers}
                                        />
                                    </TableHead>
                                    <TableHead>Estudiante</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead className="text-right">Estado</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredStudents.map((student) => (
                                    <TableRow
                                        key={student.id}
                                        className={cn(
                                            'cursor-pointer transition-colors',
                                            selectedUserIds.includes(student.id) && 'bg-blue-50/30'
                                        )}
                                        onClick={() => toggleUser(student.id)}
                                    >
                                        <TableCell>
                                            <Checkbox
                                                checked={selectedUserIds.includes(student.id)}
                                                onCheckedChange={() => toggleUser(student.id)}
                                            />
                                        </TableCell>
                                        <TableCell className="font-medium text-slate-800">
                                            {student.nombre}
                                        </TableCell>
                                        <TableCell className="text-slate-500">{student.email}</TableCell>
                                        <TableCell className="text-right">
                                            <Badge
                                                variant={student.activo ? 'default' : 'secondary'}
                                                className={
                                                    student.activo
                                                        ? 'bg-green-100 text-green-700 hover:bg-green-100 border-none'
                                                        : ''
                                                }
                                            >
                                                {student.activo ? 'Activo' : 'Inactivo'}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Module Assignment Dialog */}
            <Dialog open={showModuleAssignDialog} onOpenChange={setShowModuleAssignDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-blue-600" />
                            Asignar Módulos a {selectedUserIds.length} Usuarios
                        </DialogTitle>
                        <DialogDescription>
                            Selecciona los módulos que deseas asignar a los usuarios seleccionados
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto p-2">
                        {modules.map((mod) => (
                            <Card
                                key={mod.id}
                                className={cn(
                                    'cursor-pointer transition-all border-2',
                                    selectedModuleIds.includes(mod.id)
                                        ? 'border-blue-500 bg-blue-50/50 shadow-md'
                                        : 'hover:border-slate-200 hover:shadow-sm'
                                )}
                                onClick={() =>
                                    setSelectedModuleIds((prev) =>
                                        prev.includes(mod.id)
                                            ? prev.filter((id) => id !== mod.id)
                                            : [...prev, mod.id]
                                    )
                                }
                            >
                                <CardContent className="p-3 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Checkbox checked={selectedModuleIds.includes(mod.id)} />
                                        <div>
                                            <h4 className="font-bold text-sm text-slate-800">
                                                {mod.nombreModulo}
                                            </h4>
                                            <p className="text-xs text-slate-500">
                                                {mod.levelCount} Niveles
                                            </p>
                                        </div>
                                    </div>
                                    {selectedModuleIds.includes(mod.id) && (
                                        <CheckCircle className="w-4 h-4 text-blue-600" />
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setShowModuleAssignDialog(false)}>
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleBulkAssignModules}
                            disabled={selectedModuleIds.length === 0 || submitting}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {submitting ? 'Asignando...' : `Asignar ${selectedModuleIds.length} Módulos`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reset Confirmation Dialog */}
            <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertTriangle className="w-5 h-5" />
                            Confirmar Reset de Usuarios
                        </DialogTitle>
                        <DialogDescription className="space-y-3 pt-2" asChild>
                            <div className="text-sm text-slate-500">
                                <p className="font-medium text-slate-700">
                                    Estás a punto de resetear {selectedUserIds.length} usuario(s).
                                </p>
                                <p className="mt-2 text-sm">Esta acción eliminará:</p>
                                <ul className="text-sm space-y-1 list-disc list-inside text-slate-600 mt-1">
                                    <li>Todas las asignaciones de módulos</li>
                                    <li>Todo el progreso de niveles</li>
                                    <li>Todas las evidencias subidas</li>
                                    <li>XP, puntos y racha (se resetearán a 0)</li>
                                </ul>
                                <p className="mt-3 text-sm font-bold text-red-600">
                                    ⚠️ Esta acción NO se puede deshacer
                                </p>
                            </div>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setShowResetDialog(false)}>
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleBulkReset}
                            disabled={submitting}
                        >
                            {submitting ? 'Reseteando...' : 'Confirmar Reset'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Create User Dialog */}
            <Dialog open={showCreateUserDialog} onOpenChange={setShowCreateUserDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Crear Nuevo Usuario</DialogTitle>
                        <DialogDescription>
                            Registra un nuevo usuario manualmente en el sistema.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Nombre Completo</Label>
                            <Input
                                placeholder="Ej: Juan Pérez"
                                value={newUser.nombre}
                                onChange={(e) => setNewUser({ ...newUser, nombre: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Correo Electrónico</Label>
                            <Input
                                placeholder="juan@ejemplo.com"
                                type="email"
                                value={newUser.email}
                                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Contraseña</Label>
                            <Input
                                type="password"
                                placeholder="******"
                                value={newUser.password}
                                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Rol</Label>
                                <Select
                                    value={newUser.roleId}
                                    onValueChange={(val) => setNewUser({ ...newUser, roleId: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar Rol" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="3">Estudiante</SelectItem>
                                        <SelectItem value="2">Profesor</SelectItem>
                                        <SelectItem value="1">Administrador</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Plan</Label>
                                <Select
                                    value={newUser.planId}
                                    onValueChange={(val) => setNewUser({ ...newUser, planId: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar Plan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">Básico</SelectItem>
                                        <SelectItem value="2">Digital</SelectItem>
                                        <SelectItem value="3">Pro</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        {newUser.roleId === '3' && (
                            <div className="space-y-2">
                                <Label>Email del Padre (Opcional)</Label>
                                <Input
                                    placeholder="padre@ejemplo.com"
                                    type="email"
                                    value={newUser.emailPadre}
                                    onChange={(e) => setNewUser({ ...newUser, emailPadre: e.target.value })}
                                />
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setShowCreateUserDialog(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleCreateUser} disabled={submitting}>
                            {submitting ? 'Creando...' : 'Crear Usuario'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
