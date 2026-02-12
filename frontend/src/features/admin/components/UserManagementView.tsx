import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { adminApi } from "../services/admin.api";
import { User, ModuleWithStats, Plan } from "../types/admin.types";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  Users,
  Trash2,
  BookOpen,
  AlertTriangle,
  CheckCircle,
  Plus,
  RotateCcw,
  Pencil,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function UserManagementView() {
  const [students, setStudents] = useState<User[]>([]);
  const [modules, setModules] = useState<ModuleWithStats[]>([]);
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Dialogs
  const [showModuleAssignDialog, setShowModuleAssignDialog] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [selectedModuleIds, setSelectedModuleIds] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editUser, setEditUser] = useState({
    nombre: "",
    email: "",
    password: "",
    emailPadre: "",
    roleId: "3",
    planId: "1",
    activo: true,
  });

  // Create User Dialog State
  const [showCreateUserDialog, setShowCreateUserDialog] = useState(false);
  const [newUser, setNewUser] = useState({
    nombre: "",
    email: "",
    password: "",
    emailPadre: "",
    roleId: "3", // Default to Student
    planId: "1", // Default to Basic
  });

  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);
  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const loadData = async () => {
    try {
      const [studentsData, modulesData, planesData] = await Promise.all([
        adminApi.getSystemStudents(),
        adminApi.getAllModulesWithStats(),
        adminApi.getPlanes(),
      ]);
      setStudents(studentsData);
      setModules(modulesData);
      setPlanes(planesData);
    } catch (error) {
      toast({
        title: "Error al cargar datos",
        description: "No se pudieron recuperar los usuarios o módulos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );
  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedStudents = filteredStudents.slice(startIndex, endIndex);
  const allSelectedOnPage =
    paginatedStudents.length > 0 &&
    paginatedStudents.every((s) => selectedUserIds.includes(s.id));

  const toggleUser = (id: number) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id],
    );
  };

  const toggleAllUsers = () => {
    const currentPageIds = paginatedStudents.map((s) => s.id);
    if (allSelectedOnPage) {
      setSelectedUserIds((prev) =>
        prev.filter((id) => !currentPageIds.includes(id)),
      );
    } else {
      setSelectedUserIds((prev) => [
        ...prev,
        ...currentPageIds.filter((id) => !prev.includes(id)),
      ]);
    }
  };

  const goToPage = (nextPage: number) => {
    const bounded = Math.max(1, Math.min(totalPages, nextPage));
    setPage(bounded);
  };

  const handlePageSizeChange = (value: string) => {
    const nextSize = parseInt(value);
    setPageSize(nextSize);
    setPage(1);
  };

  const handleBulkAssignModules = async () => {
    if (selectedUserIds.length === 0 || selectedModuleIds.length === 0) return;

    setSubmitting(true);
    try {
      // Assign each module to all selected users
      await Promise.all(
        selectedModuleIds.map((moduleId) =>
          adminApi.bulkAssignModules(moduleId, selectedUserIds),
        ),
      );

      toast({
        title: "¡Asignación exitosa!",
        description: `Se asignaron ${selectedModuleIds.length} módulos a ${selectedUserIds.length} usuarios`,
      });
      setShowModuleAssignDialog(false);
      setSelectedModuleIds([]);
      setSelectedUserIds([]);
    } catch (error: any) {
      toast({
        title: "Error al asignar",
        description:
          error.message || "No se pudieron realizar las asignaciones",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkReset = async () => {
    if (selectedUserIds.length === 0) return;

    setSubmitting(true);
    try {
      const result = await adminApi.bulkResetUsers(selectedUserIds);

      if (!result.success) throw new Error(result.message);

      toast({
        title: "¡Reset exitoso!",
        description: result.message,
      });
      setShowResetDialog(false);
      setSelectedUserIds([]);
    } catch (error: any) {
      toast({
        title: "Error al resetear",
        description: error.message || "No se pudieron resetear los usuarios",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateUser = async () => {
    if (!newUser.nombre || !newUser.email || !newUser.password) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa nombre, email y contraseña",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      await adminApi.createUser({
        ...newUser,
        roleId: parseInt(newUser.roleId),
        planId: parseInt(newUser.planId),
        activo: true,
      });

      toast({
        title: "¡Usuario creado!",
        description: `El usuario ${newUser.nombre} ha sido creado exitosamente.`,
      });
      setShowCreateUserDialog(false);
      setNewUser({
        nombre: "",
        email: "",
        password: "",
        emailPadre: "",
        roleId: "3",
        planId: "1",
      });
      loadData(); // Reload list
    } catch (error: any) {
      toast({
        title: "Error al crear",
        description: error.message || "No se pudo crear el usuario",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const openEditUser = (student: User) => {
    setEditingUser(student);
    setEditUser({
      nombre: student.nombre || "",
      email: student.email || "",
      password: "",
      emailPadre: student.emailPadre || "",
      roleId: (student.roleId ?? 3).toString(),
      planId: (student.planId ?? 1).toString(),
      activo: !!student.activo,
    });
    setShowEditDialog(true);
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    if (!editUser.nombre || !editUser.email) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa nombre y email",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const payload: any = {
        nombre: editUser.nombre,
        email: editUser.email,
        roleId: parseInt(editUser.roleId),
        planId: parseInt(editUser.planId),
        activo: editUser.activo,
        emailPadre: editUser.emailPadre || undefined,
      };
      if (editUser.password.trim()) {
        payload.password = editUser.password;
      }
      await adminApi.updateUser(editingUser.id, payload);
      toast({
        title: "Usuario actualizado",
        description: `Se actualizó ${editUser.nombre}.`,
      });
      setShowEditDialog(false);
      setEditingUser(null);
      loadData();
    } catch (error: any) {
      toast({
        title: "Error al actualizar",
        description: error.message || "No se pudo actualizar el usuario",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdatePlan = async (
    userId: number,
    newPlanId: number,
    userName: string,
  ) => {
    try {
      await adminApi.updateUser(userId, { planId: newPlanId });
      toast({
        title: "Plan actualizado",
        description: `Se actualizó el plan de ${userName}.`,
      });
      loadData();
    } catch (error: any) {
      toast({
        title: "Error al actualizar plan",
        description: error.message || "No se pudo actualizar el plan",
        variant: "destructive",
      });
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
            <Table className="p-2">
              <TableHeader className="bg-slate-50">
                <TableRow className="hover:bg-transparent border-slate-200">
                  <TableHead className="flex items-center justify-center">
                    <Checkbox
                      checked={allSelectedOnPage}
                      onCheckedChange={toggleAllUsers}
                    />
                  </TableHead>
                  <TableHead className="text-slate-700 font-bold">
                    Usuario
                  </TableHead>
                  <TableHead className="text-slate-700 font-bold">
                    Email
                  </TableHead>
                  <TableHead className="text-slate-700 font-bold">
                    Plan
                  </TableHead>
                  <TableHead className="text-slate-700 font-bold">
                    Estado
                  </TableHead>
                  <TableHead className="text-slate-700 font-bold px-6">
                    Acciones
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedStudents.map((student) => (
                  <TableRow
                    key={student.id}
                    className={cn(
                      "cursor-pointer transition-colors",
                      selectedUserIds.includes(student.id) && "bg-blue-50/30",
                    )}
                    onClick={() => toggleUser(student.id)}
                  >
                    <TableCell className="flex items-center justify-center">
                      <Checkbox
                        checked={selectedUserIds.includes(student.id)}
                        onCheckedChange={() => toggleUser(student.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium text-slate-800">
                      {student.nombre}
                    </TableCell>
                    <TableCell className="text-slate-500">
                      {student.email}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      <div onClick={(e) => e.stopPropagation()}>
                        <Select
                          value={(student.planId ?? 1).toString()}
                          onValueChange={(val) =>
                            handleUpdatePlan(
                              student.id,
                              parseInt(val),
                              student.nombre,
                            )
                          }
                        >
                          <SelectTrigger className="h-9 w-40">
                            <SelectValue placeholder="Seleccionar Plan" />
                          </SelectTrigger>
                          <SelectContent>
                            {planes.map((p) => (
                              <SelectItem key={p.id} value={p.id.toString()}>
                                {p.nombrePlan}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                    <TableCell className="text-right px-6">
                      <div className="flex justify-start items-center gap-3">
                        <Badge
                          variant={student.activo ? "default" : "secondary"}
                          className={
                            student.activo
                              ? "bg-green-100 text-green-700 hover:bg-green-100 border-none"
                              : ""
                          }
                        >
                          {student.activo ? "Activo" : "Inactivo"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right px-6">
                      <div className="flex gap-1 justify-center items-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Editar Usuario"
                          className="h-8 w-8 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditUser(student);
                          }}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Resetear Progreso"
                          className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedUserIds([student.id]);
                            setShowResetDialog(true);
                          }}
                        >
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Eliminar Usuario"
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (
                              confirm(
                                `¿Estás seguro de eliminar a ${student.nombre}?`,
                              )
                            ) {
                              try {
                                await adminApi.deleteUser(student.id);
                                toast({ title: "Usuario eliminado" });
                                loadData();
                              } catch (e) {
                                toast({
                                  title: "Error",
                                  variant: "destructive",
                                });
                              }
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-3 mt-4">
            <div className="text-sm text-slate-500">
              Mostrando {filteredStudents.length === 0 ? 0 : startIndex + 1}-
              {Math.min(endIndex, filteredStudents.length)} de{" "}
              {filteredStudents.length}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">Filas:</span>
              <Select
                value={pageSize.toString()}
                onValueChange={handlePageSizeChange}
              >
                <SelectTrigger className="h-9 w-22.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  className="h-9 px-3"
                  onClick={() => goToPage(safePage - 1)}
                  disabled={safePage === 1}
                >
                  Anterior
                </Button>
                <div className="text-sm text-slate-600 px-2">
                  {safePage} / {totalPages}
                </div>
                <Button
                  variant="outline"
                  className="h-9 px-3"
                  onClick={() => goToPage(safePage + 1)}
                  disabled={safePage === totalPages}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Module Assignment Dialog */}
      <Dialog
        open={showModuleAssignDialog}
        onOpenChange={setShowModuleAssignDialog}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              Asignar Módulos a {selectedUserIds.length} Usuarios
            </DialogTitle>
            <DialogDescription>
              Selecciona los módulos que deseas asignar a los usuarios
              seleccionados
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 max-h-100 overflow-y-auto p-2">
            {modules.map((mod) => (
              <Card
                key={mod.id}
                className={cn(
                  "cursor-pointer transition-all border-2",
                  selectedModuleIds.includes(mod.id)
                    ? "border-blue-500 bg-blue-50/50 shadow-md"
                    : "hover:border-slate-200 hover:shadow-sm",
                )}
                onClick={() =>
                  setSelectedModuleIds((prev) =>
                    prev.includes(mod.id)
                      ? prev.filter((id) => id !== mod.id)
                      : [...prev, mod.id],
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
            <Button
              variant="ghost"
              onClick={() => setShowModuleAssignDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleBulkAssignModules}
              disabled={selectedModuleIds.length === 0 || submitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {submitting
                ? "Asignando..."
                : `Asignar ${selectedModuleIds.length} Módulos`}
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
              {submitting ? "Reseteando..." : "Confirmar Reset"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create User Dialog */}
      <Dialog
        open={showCreateUserDialog}
        onOpenChange={setShowCreateUserDialog}
      >
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
                onChange={(e) =>
                  setNewUser({ ...newUser, nombre: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Correo Electrónico</Label>
              <Input
                placeholder="juan@ejemplo.com"
                type="email"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Contraseña</Label>
              <Input
                type="password"
                placeholder="******"
                value={newUser.password}
                onChange={(e) =>
                  setNewUser({ ...newUser, password: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Rol</Label>
                <Select
                  value={newUser.roleId}
                  onValueChange={(val) =>
                    setNewUser({ ...newUser, roleId: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar Rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">Estudiante</SelectItem>
                    <SelectItem value="2">Profesor</SelectItem>
                    <SelectItem value="4">Especialista</SelectItem>
                    <SelectItem value="5">Profesor Especialización</SelectItem>
                    <SelectItem value="1">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Plan</Label>
                <Select
                  value={newUser.planId}
                  onValueChange={(val) =>
                    setNewUser({ ...newUser, planId: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar Plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {planes.map((p) => (
                      <SelectItem key={p.id} value={p.id.toString()}>
                        {p.nombrePlan}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {newUser.roleId === "3" && (
              <div className="space-y-2">
                <Label>Email del Padre (Opcional)</Label>
                <Input
                  placeholder="padre@ejemplo.com"
                  type="email"
                  value={newUser.emailPadre}
                  onChange={(e) =>
                    setNewUser({ ...newUser, emailPadre: e.target.value })
                  }
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setShowCreateUserDialog(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleCreateUser} disabled={submitting}>
              {submitting ? "Creando..." : "Crear Usuario"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog
        open={showEditDialog}
        onOpenChange={(open) => {
          setShowEditDialog(open);
          if (!open) setEditingUser(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>
              Actualiza los datos del usuario seleccionado.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nombre Completo</Label>
              <Input
                placeholder="Ej: Juan Pérez"
                value={editUser.nombre}
                onChange={(e) =>
                  setEditUser({ ...editUser, nombre: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Correo Electrónico</Label>
              <Input
                placeholder="juan@ejemplo.com"
                type="email"
                value={editUser.email}
                onChange={(e) =>
                  setEditUser({ ...editUser, email: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Contraseña (opcional)</Label>
              <Input
                type="password"
                placeholder="Dejar vacío para no cambiar"
                value={editUser.password}
                onChange={(e) =>
                  setEditUser({ ...editUser, password: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Rol</Label>
                <Select
                  value={editUser.roleId}
                  onValueChange={(val) =>
                    setEditUser({ ...editUser, roleId: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar Rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">Estudiante</SelectItem>
                    <SelectItem value="2">Profesor</SelectItem>
                    <SelectItem value="4">Especialista</SelectItem>
                    <SelectItem value="5">Profesor Especialización</SelectItem>
                    <SelectItem value="1">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Plan</Label>
                <Select
                  value={editUser.planId}
                  onValueChange={(val) =>
                    setEditUser({ ...editUser, planId: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar Plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {planes.map((p) => (
                      <SelectItem key={p.id} value={p.id.toString()}>
                        {p.nombrePlan}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {editUser.roleId === "3" && (
              <div className="space-y-2">
                <Label>Email del Padre (Opcional)</Label>
                <Input
                  placeholder="padre@ejemplo.com"
                  type="email"
                  value={editUser.emailPadre}
                  onChange={(e) =>
                    setEditUser({ ...editUser, emailPadre: e.target.value })
                  }
                />
              </div>
            )}
            <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
              <div>
                <Label className="text-sm">Estado</Label>
                <p className="text-xs text-slate-500">
                  {editUser.activo ? "Activo" : "Inactivo"}
                </p>
              </div>
              <Switch
                checked={editUser.activo}
                onCheckedChange={(checked) =>
                  setEditUser({ ...editUser, activo: checked })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowEditDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateUser} disabled={submitting}>
              {submitting ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
