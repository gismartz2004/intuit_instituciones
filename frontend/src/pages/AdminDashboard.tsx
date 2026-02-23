import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Plus, UserPlus, Shield, Activity, Monitor, Layout, Box, Users, BookOpen, GraduationCap, TrendingUp, BarChart3, Clock, Trash2, Ban, CheckCircle, Sparkles } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";

const ROLE_MAP: Record<number, string> = { 1: "Admin", 2: "Profesor", 3: "Estudiante" };

// Plan Configuration
const PLANS = {
  1: { name: "Básico", label: "Genio Digital", color: "bg-slate-100 text-slate-700", icon: "💡" },
  2: { name: "Digital", label: "Genio Plata", color: "bg-blue-100 text-blue-700", icon: "⚡" },
  3: { name: "Pro", label: "Genio Pro", color: "bg-gradient-to-r from-yellow-400 to-orange-500 text-white", icon: "👑" },
} as const;

type PlanId = keyof typeof PLANS;

const PERFORMANCE_DATA = [
  { name: 'Lun', active: 400, usage: 240 },
  { name: 'Mar', active: 600, usage: 380 },
  { name: 'Mie', active: 800, usage: 520 },
  { name: 'Jue', active: 1100, usage: 780 },
  { name: 'Vie', active: 1300, usage: 900 },
  { name: 'Sab', active: 900, usage: 600 },
  { name: 'Dom', active: 700, usage: 450 },
];

const MODULES_DATA = [
  { name: 'Python', students: 45, progress: 85 },
  { name: 'React', students: 32, progress: 70 },
  { name: 'UI/UX', students: 28, progress: 92 },
  { name: 'Backend', students: 38, progress: 65 },
];

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [modules, setModules] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [moduleSearch, setModuleSearch] = useState("");

  const [location] = useLocation();
  const [activeTab, setActiveTab] = useState("monitoring");

  useEffect(() => {
    if (location === "/admin/users") {
      setActiveTab("management");
    } else {
      setActiveTab("monitoring");
    }
  }, [location]);

  // Dialog States
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isModuleDialogOpen, setIsModuleDialogOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<any>(null); // For detail view

  // Form States
  const [newUser, setNewUser] = useState({
    nombre: "",
    email: "",
    password: "",
    roleId: 3,
    planId: 2
  });

  const [newModule, setNewModule] = useState({
    nombreModulo: "",
    duracionDias: 30
  });

  // Fetch initial data
  useEffect(() => {
    fetchUsers();
    fetchModules();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/usuarios');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "No se pudieron cargar los usuarios", variant: "destructive" });
    }
  };

  const fetchModules = async () => {
    try {
      const res = await fetch('/api/modulos');
      if (res.ok) {
        const data = await res.json();
        setModules(data);
      }
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "No se pudieron cargar los módulos", variant: "destructive" });
    }
  };

  const handleCreateUser = async () => {
    try {
      const payload = {
        ...newUser,
        roleId: parseInt(newUser.roleId.toString()),
        planId: parseInt(newUser.planId.toString()),
        activo: true
      };

      const res = await fetch('/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        fetchUsers(); // Refresh users list
        setIsUserDialogOpen(false);
        setNewUser({ nombre: "", email: "", password: "", roleId: 3, planId: 2 }); // Reset form
        toast({ title: "Usuario creado", description: "Se ha añadido un nuevo usuario al sistema." });
      } else {
        toast({ title: "Error", description: "Falló la creación del usuario", variant: "destructive" });
      }
    } catch (e) {
      toast({ title: "Error", description: "Falló la creación del usuario", variant: "destructive" });
    }
  };

  const handleCreateModule = async () => {
    try {
      const payload = {
        nombreModulo: newModule.nombreModulo,
        duracionDias: parseInt(newModule.duracionDias.toString())
      };

      const res = await fetch('/api/modulos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        fetchModules();
        setIsModuleDialogOpen(false);
        setNewModule({ nombreModulo: "", duracionDias: 30 }); // Reset
        toast({ title: "Módulo creado", description: "Se ha creado un nuevo módulo educativo." });
      }
    } catch (e) {
      toast({ title: "Error", description: "Falló la creación del módulo", variant: "destructive" });
    }
  };

  const [selectedUserForAssign, setSelectedUserForAssign] = useState<string>("");
  const [selectedModuleForAssign, setSelectedModuleForAssign] = useState<string>("");

  const handleAssign = async () => {
    if (!selectedUserForAssign || !selectedModuleForAssign) {
      toast({ title: "Advertencia", description: "Por favor, selecciona un usuario y un módulo.", variant: "destructive" });
      return;
    }

    // Determine if student or professor based on selected user
    const user = users.find(u => u.id.toString() === selectedUserForAssign);
    if (!user) {
      toast({ title: "Error", description: "Usuario no encontrado.", variant: "destructive" });
      return;
    }

    const payload: any = { moduloId: parseInt(selectedModuleForAssign) };
    if (user.roleId === 2) payload.profesorId = user.id; // Professor
    else payload.estudianteId = user.id; // Student (default)

    try {
      const res = await fetch('/api/modulos/asignar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        toast({ title: "Asignación exitosa", description: `Usuario ${user.nombre} asignado al módulo.` });
        setSelectedUserForAssign("");
        setSelectedModuleForAssign("");
        fetchUsers(); // Refresh users to show updated modules
        fetchModules(); // Refresh modules to show updated student/professor counts
      } else {
        const errorData = await res.json();
        toast({ title: "Error", description: errorData.message || "Falló la asignación", variant: "destructive" });
      }
    } catch (e) {
      toast({ title: "Error", description: "Falló la asignación", variant: "destructive" });
    }
  };

  const handleUpdatePlan = async (userId: number, newPlanId: number, userName: string, oldPlanId: number) => {
    // Confirmation for plan changes
    const oldPlan = PLANS[oldPlanId as PlanId];
    const newPlan = PLANS[newPlanId as PlanId];

    try {
      const res = await fetch(`/api/usuarios/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: newPlanId })
      });
      if (res.ok) {
        fetchUsers(); // Refresh users list
        toast({
          title: "✅ Plan actualizado exitosamente",
          description: `${userName} cambió de ${oldPlan?.label || 'plan anterior'} a ${newPlan?.label}`
        });
      } else {
        const errorData = await res.json().catch(() => ({}));
        toast({
          title: "❌ Error al actualizar",
          description: errorData.message || "No se pudo actualizar el plan",
          variant: "destructive"
        });
        fetchUsers(); // Revert UI by refetching
      }
    } catch (e) {
      console.error('Plan update error:', e);
      toast({
        title: "❌ Error de conexión",
        description: "No se pudo conectar con el servidor",
        variant: "destructive"
      });
      fetchUsers(); // Revert UI by refetching
    }
  };

  const handleToggleActive = async (user: any) => {
    try {
      const res = await fetch(`/api/usuarios/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activo: !user.activo })
      });
      if (res.ok) {
        toast({ title: "Estado actualizado", description: `Usuario ${!user.activo ? 'activado' : 'desactivado'}.` });
        fetchUsers();
      }
    } catch (e) {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm("¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.")) return;
    try {
      const res = await fetch(`/api/usuarios/${userId}`, { method: 'DELETE' });
      if (res.ok) {
        toast({ title: "Usuario eliminado" });
        fetchUsers();
      }
    } catch (e) {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const handleDeleteModule = async (moduleId: number) => {
    if (!confirm("¿Estás seguro de eliminar este módulo? Se borrarán todos los niveles y contenidos.")) return;
    try {
      const res = await fetch(`/api/modulos/${moduleId}`, { method: 'DELETE' });
      if (res.ok) {
        toast({ title: "Módulo eliminado" });
        fetchModules();
      }
    } catch (e) {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 pb-24">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-[#0047AB] p-3 rounded-2xl shadow-lg shadow-blue-200">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">System Authority</h1>
            <p className="text-slate-500 font-medium">Control global del ecosistema educativo.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#0047AB] hover:bg-blue-700 btn-gamified h-12 px-6">
                <UserPlus className="w-5 h-5 mr-2" /> Crear Usuario
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Nuevo Usuario</DialogTitle>
                <DialogDescription>Ingresa los datos del nuevo usuario.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Nombre Completo</Label>
                  <Input
                    value={newUser.nombre}
                    onChange={(e) => setNewUser({ ...newUser, nombre: e.target.value })}
                    placeholder="Ej. Juan Pérez"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="email@ejemplo.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contraseña</Label>
                  <Input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    placeholder="******"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Rol</Label>
                    <Select onValueChange={(v) => setNewUser({ ...newUser, roleId: parseInt(v) })} defaultValue="3">
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Administrador</SelectItem>
                        <SelectItem value="2">Profesor</SelectItem>
                        <SelectItem value="3">Estudiante</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Plan de Suscripción</Label>
                    <Select onValueChange={(v) => setNewUser({ ...newUser, planId: parseInt(v) })} defaultValue="2">
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar plan" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(PLANS).map(([id, plan]) => (
                          <SelectItem key={id} value={id}>
                            <div className="flex items-center gap-2">
                              <span>{plan.icon}</span>
                              <span>{plan.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsUserDialogOpen(false)}>Cancelar</Button>
                <Button onClick={handleCreateUser} className="bg-[#0047AB]">Crear Usuario</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Uptime", value: "99.9%", icon: Activity, color: "text-green-500" },
          { label: "Servidores", value: "8/8", icon: Monitor, color: "text-blue-500" },
          { label: "Usuarios Online", value: "142", icon: Users, color: "text-[#00FFFF]" },
          { label: "Carga Sistema", value: "14%", icon: Layout, color: "text-purple-500" }
        ].map((stat, i) => (
          <Card key={i} className="border-none bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className={cn("text-2xl font-black", stat.color)}>{stat.value}</p>
              </div>
              <stat.icon className={cn("w-10 h-10 opacity-20", stat.color)} />
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedModule} onOpenChange={(open) => !open && setSelectedModule(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Box className="text-blue-600" />
              {selectedModule?.nombreModulo}
            </DialogTitle>
            <DialogDescription>
              Detalle de participantes y métricas del módulo.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-6 py-4">
            <div className="space-y-4">
              <h3 className="font-bold text-slate-700 flex items-center gap-2 border-b pb-2">
                <GraduationCap className="h-5 w-5 text-purple-500" /> Docentes Asignados
              </h3>
              {selectedModule?.professors && selectedModule.professors.length > 0 ? (
                <div className="space-y-2">
                  {selectedModule.professors.map((p: any) => (
                    <div key={p.id} className="flex items-center gap-3 bg-slate-50 p-2 rounded-lg">
                      <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-xs">{p.nombre[0]}</div>
                      <div>
                        <p className="text-sm font-bold">{p.nombre}</p>
                        <p className="text-[10px] text-slate-500">{p.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-slate-400 italic">No hay docentes asignados.</p>}
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-slate-700 flex items-center gap-2 border-b pb-2">
                <Users className="h-5 w-5 text-blue-500" /> Estudiantes Inscritos ({selectedModule?.students?.length || 0})
              </h3>
              {selectedModule?.students && selectedModule.students.length > 0 ? (
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                  {selectedModule.students.map((s: any) => (
                    <div key={s.id} className="flex items-center gap-3 bg-slate-50 p-2 rounded-lg">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">{s.nombre[0]}</div>
                      <div>
                        <p className="text-sm font-bold">{s.nombre}</p>
                        <p className="text-[10px] text-slate-500">{s.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-slate-400 italic">No hay estudiantes inscritos.</p>}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-slate-100/50 p-1 border-2 border-slate-100 rounded-xl">
          <TabsTrigger value="management" className="rounded-lg font-bold">Gestión de Usuarios</TabsTrigger>
          <TabsTrigger value="modules" className="rounded-lg font-bold">Módulos & Asignación</TabsTrigger>
          <TabsTrigger value="monitoring" className="rounded-lg font-bold">Dashboard de Métricas</TabsTrigger>
        </TabsList>

        <TabsContent value="management">
          <Card className="border-2 border-slate-100 shadow-xl shadow-slate-200/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Directorio de Usuarios</CardTitle>
                  <CardDescription>Control total sobre roles, planes y accesos.</CardDescription>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Filtrar sistema..."
                    className="pl-9 bg-slate-50 border-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-slate-100">
                    <TableHead className="font-bold text-slate-700">Identidad</TableHead>
                    <TableHead className="font-bold text-slate-700">Rol</TableHead>
                    <TableHead className="font-bold text-slate-700">Suscripción</TableHead>
                    <TableHead className="font-bold text-slate-700">Módulos</TableHead>
                    <TableHead className="text-right font-bold text-slate-700">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.filter(user =>
                    user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    user.email.toLowerCase().includes(searchTerm.toLowerCase())
                  ).map((user) => (
                    <TableRow key={user.id} className="border-slate-50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center font-bold text-[#0047AB]">
                            {user.nombre[0]}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">{user.nombre}</p>
                            <p className="text-xs text-slate-400 font-medium">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="rounded-md border-slate-200 bg-slate-50 text-slate-600">
                          {ROLE_MAP[user.roleId] || "Desconocido"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={user.planId?.toString() || "1"}
                          onValueChange={(value) => handleUpdatePlan(user.id, parseInt(value), user.nombre, user.planId || 1)}
                        >
                          <SelectTrigger className="w-[150px] h-9 font-bold text-xs border-slate-200 hover:border-slate-300 transition-colors">
                            <SelectValue>
                              <div className="flex items-center gap-2">
                                <span>{PLANS[(user.planId || 1) as PlanId]?.icon}</span>
                                <span>{PLANS[(user.planId || 1) as PlanId]?.label}</span>
                              </div>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(PLANS).map(([id, plan]) => (
                              <SelectItem key={id} value={id} className="cursor-pointer">
                                <div className="flex items-center gap-2">
                                  <span className="text-base">{plan.icon}</span>
                                  <div>
                                    <p className="font-bold">{plan.label}</p>
                                    <p className="text-[10px] text-slate-500">{plan.name}</p>
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap max-w-[200px]">
                          {user.modules && user.modules.length > 0 ? user.modules.map((m: any, i: number) => (
                            <Badge key={i} className="bg-blue-50 text-blue-600 border-none text-[10px]">{m.nombreModulo}</Badge>
                          )) : <span className="text-slate-300 italic text-xs">Sin módulos</span>}
                        </div>
                      </TableCell>

                      <TableCell className="text-right flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className={user.activo ? "text-green-500 hover:text-green-700 hover:bg-green-50" : "text-slate-400 hover:text-slate-600"}
                          onClick={() => handleToggleActive(user)}
                          title={user.activo ? "Desactivar Cuenta" : "Activar Cuenta"}
                        >
                          {user.activo ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-400 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleDeleteUser(user.id)}
                          title="Eliminar Usuario"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="modules">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Catálogo de Módulos</h2>
                <p className="text-slate-500">Crea módulos y gestiona la asignación de docentes y estudiantes.</p>
              </div>
              <Dialog open={isModuleDialogOpen} onOpenChange={setIsModuleDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" /> Nuevo Módulo
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Crear Nuevo Módulo</DialogTitle>
                    <DialogDescription>Define el nombre y la duración del módulo.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Nombre del Módulo</Label>
                      <Input
                        value={newModule.nombreModulo}
                        onChange={(e) => setNewModule({ ...newModule, nombreModulo: e.target.value })}
                        placeholder="Ej. Introducción a Python"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Duración (días)</Label>
                      <Input
                        type="number"
                        value={newModule.duracionDias}
                        onChange={(e) => setNewModule({ ...newModule, duracionDias: parseInt(e.target.value) })}
                        placeholder="30"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsModuleDialogOpen(false)}>Cancelar</Button>
                    <Button onClick={handleCreateModule} className="bg-[#0047AB]">Crear Módulo</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-2 border-2 border-slate-100">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Módulos Activos</CardTitle>
                    <div className="relative w-64">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="Buscar módulos..."
                        className="pl-9 bg-slate-50 border-none"
                        value={moduleSearch}
                        onChange={(e) => setModuleSearch(e.target.value)}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Módulo</TableHead>
                        <TableHead>Docente</TableHead>
                        <TableHead>Estudiantes</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {modules.filter(mod =>
                        mod.nombreModulo.toLowerCase().includes(moduleSearch.toLowerCase()) ||
                        (mod.professor && mod.professor.toLowerCase().includes(moduleSearch.toLowerCase()))
                      ).map((mod) => (
                        <TableRow key={mod.id}>
                          <TableCell>
                            <div>
                              <p className="font-bold">{mod.nombreModulo}</p>
                              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                                <Clock className="w-3 h-3" />
                                <span>{mod.duracionDias} días</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <GraduationCap className="w-4 h-4 text-slate-400" />
                              <span className="text-sm">{mod.professor || "Sin asignar"}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                              {mod.studentsCount || 0} inscritos
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={mod.status === 'Activo' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}>
                              {mod.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-600 font-bold hover:bg-blue-50"
                              onClick={() => setSelectedModule(mod)}
                            >
                              Ver Detalles
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-400 hover:text-red-600 hover:bg-red-50"
                              onClick={() => handleDeleteModule(mod.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card className="border-2 border-slate-100">
                <CardHeader>
                  <CardTitle>Rápida Asignación</CardTitle>
                  <CardDescription>Vincula usuarios a módulos existentes.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Seleccionar Usuario</label>
                    <Select value={selectedUserForAssign} onValueChange={setSelectedUserForAssign}>
                      <SelectTrigger>
                        <SelectValue placeholder="Buscar usuario..." />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map(u => (
                          <SelectItem key={u.id} value={u.id.toString()}>{u.nombre} ({ROLE_MAP[u.roleId]})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Seleccionar Módulo</label>
                    <Select value={selectedModuleForAssign} onValueChange={setSelectedModuleForAssign}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar módulo..." />
                      </SelectTrigger>
                      <SelectContent>
                        {modules.map(m => (
                          <SelectItem key={m.id} value={m.id.toString()}>{m.nombreModulo}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleAssign} className="w-full bg-[#0047AB] hover:bg-[#003380] text-white font-bold h-11">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Asignar Usuario al Módulo
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>


        <TabsContent value="monitoring">
          <div className="space-y-6">
            <Card className="border-2 border-slate-100">
              <CardHeader>
                <CardTitle>Rendimiento por Módulo</CardTitle>
                <CardDescription>Progreso medio de estudiantes por área.</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={MODULES_DATA}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="progress" fill="#0047AB" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: "Tasa de Finalización", value: "88%", trend: "+12%", icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
                { label: "Tiempo de Uso Promedio", value: "42m", trend: "+5m", icon: Clock, color: "text-blue-600", bg: "bg-blue-50" },
                { label: "Nuevas Inscripciones", value: "24", trend: "+8", icon: UserPlus, color: "text-purple-600", bg: "bg-purple-50" },
              ].map((stat, i) => (
                <Card key={i} className="border-none shadow-sm">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={cn("p-2 rounded-lg", stat.bg)}>
                        <stat.icon className={cn("w-5 h-5", stat.color)} />
                      </div>
                      <span className={cn("text-xs font-bold px-2 py-1 rounded-full", stat.bg, stat.color)}>
                        {stat.trend}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                    <p className="text-2xl font-black text-slate-800">{stat.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="border-2 border-slate-100">
              <CardHeader>
                <CardTitle>Actividad del Sistema</CardTitle>
                <CardDescription>Interacciones de usuarios por semana.</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={PERFORMANCE_DATA}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                    <Line type="monotone" dataKey="active" stroke="#0047AB" strokeWidth={3} dot={{ r: 6, fill: '#0047AB', strokeWidth: 0 }} />
                    <Line type="monotone" dataKey="usage" stroke="#00FFFF" strokeWidth={3} dot={{ r: 6, fill: '#00FFFF', strokeWidth: 0 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs >
    </div >
  );
}

