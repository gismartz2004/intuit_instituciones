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
import { Search, Plus, UserPlus, Shield, Activity, Monitor, Layout, Box, Users, BookOpen, GraduationCap, TrendingUp, BarChart3, Clock, Trash2, Ban, CheckCircle, FileSpreadsheet, Eye, Settings, LogOut, Trophy } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";
import { adminApi } from '../services/admin.api';
import { ROLE_MAP, PLAN_MAP, type User, type Module, type Premio } from '../types/admin.types';
import { ExcelImportWizard, ModuleAssignmentWizard, ModuleContentViewer } from "@/features/superadmin";

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

interface AdminDashboardProps {
  user: { role: "student" | "admin" | "professor" | "superadmin"; name: string; id: string; plan?: string };
  onLogout?: () => void;
}

export default function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [prizes, setPrizes] = useState<Premio[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [moduleSearch, setModuleSearch] = useState("");
  const [prizeSearch, setPrizeSearch] = useState("");

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
  const [isPrizeDialogOpen, setIsPrizeDialogOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);

  // SuperAdmin specific states
  const [showImportWizard, setShowImportWizard] = useState(false);
  const [showAssignWizard, setShowAssignWizard] = useState(false);
  const [selectedModuleIdForContent, setSelectedModuleIdForContent] = useState<number | null>(null);

  // Form States
  const [newUser, setNewUser] = useState({
    nombre: "",
    email: "",
    password: "",
    roleId: 3,
    planId: 2,
    emailPadre: ""
  });

  const [newModule, setNewModule] = useState({
    nombreModulo: "",
    duracionDias: 30
  });

  const [newPrize, setNewPrize] = useState({
    nombre: "",
    descripcion: "",
    costoPuntos: 100,
    imagenUrl: "",
    stock: 10
  });

  // Fetch initial data
  useEffect(() => {
    fetchUsers();
    fetchModules();
    fetchPrizes();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await adminApi.getUsers();
      setUsers(data);
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "No se pudieron cargar los usuarios", variant: "destructive" });
    }
  };

  const fetchModules = async () => {
    try {
      const data = await adminApi.getModules();
      setModules(data);
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "No se pudieron cargar los módulos", variant: "destructive" });
    }
  };

  const fetchPrizes = async () => {
    try {
      const data = await adminApi.getPrizes();
      setPrizes(data);
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "No se pudieron cargar los premios", variant: "destructive" });
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

      await adminApi.createUser(payload);
      fetchUsers();
      setIsUserDialogOpen(false);
      setNewUser({ nombre: "", email: "", password: "", roleId: 3, planId: 2, emailPadre: "" });
      toast({ title: "Usuario creado", description: "Se ha añadido un nuevo usuario al sistema." });
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

      await adminApi.createModule(payload);
      fetchModules();
      setIsModuleDialogOpen(false);
      setNewModule({ nombreModulo: "", duracionDias: 30 });
      toast({ title: "Módulo creado", description: "Se ha creado un nuevo módulo educativo." });
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

    const user = users.find(u => u.id.toString() === selectedUserForAssign);
    if (!user) {
      toast({ title: "Error", description: "Usuario no encontrado.", variant: "destructive" });
      return;
    }

    const payload: any = { moduloId: parseInt(selectedModuleForAssign) };
    if (user.roleId === 2) payload.profesorId = user.id;
    else payload.estudianteId = user.id;

    try {
      await adminApi.assignModule(payload);
      toast({ title: "Asignación exitosa", description: `Usuario ${user.nombre} asignado al módulo.` });
      setSelectedUserForAssign("");
      setSelectedModuleForAssign("");
      fetchUsers();
      fetchModules();
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Falló la asignación", variant: "destructive" });
    }
  };

  const handleUpdatePlan = async (userId: number, newPlanId: number) => {
    try {
      await adminApi.updateUser(userId, { planId: newPlanId });
      fetchUsers();
      toast({ title: "Plan actualizado", description: "El plan del usuario ha sido modificado." });
    } catch (e) {
      toast({ title: "Error", description: "No se pudo actualizar el plan", variant: "destructive" });
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      await adminApi.updateUser(user.id, { activo: !user.activo });
      toast({ title: "Estado actualizado", description: `Usuario ${!user.activo ? 'activado' : 'desactivado'}.` });
      fetchUsers();
    } catch (e) {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm("¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.")) return;
    try {
      await adminApi.deleteUser(userId);
      toast({ title: "Usuario eliminado" });
      fetchUsers();
    } catch (e) {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const handleDeleteModule = async (moduleId: number) => {
    if (!confirm("¿Estás seguro de eliminar este módulo? Se borrarán todos los niveles y contenidos.")) return;
    try {
      await adminApi.deleteModule(moduleId);
      toast({ title: "Módulo eliminado" });
      fetchModules();
    } catch (e) {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const handleCreatePrize = async () => {
    try {
      await adminApi.createPrize(newPrize);
      fetchPrizes();
      setIsPrizeDialogOpen(false);
      setNewPrize({ nombre: "", descripcion: "", costoPuntos: 100, imagenUrl: "", stock: 10 });
      toast({ title: "Premio creado", description: "Se ha añadido un nuevo premio al catálogo." });
    } catch (e) {
      toast({ title: "Error", description: "Falló la creación del premio", variant: "destructive" });
    }
  };

  const handleDeletePrize = async (prizeId: number) => {
    if (!confirm("¿Estás seguro de eliminar este premio?")) return;
    try {
      await adminApi.deletePrize(prizeId);
      toast({ title: "Premio eliminado" });
      fetchPrizes();
    } catch (e) {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] premium-gradient-bg flex">
      {/* Sidebar Command Center */}
      <div className="w-72 bg-[hsl(var(--sidebar))] text-white flex flex-col shadow-2xl z-20 sticky top-0 h-screen">
        <div className="p-8 pb-12 flex items-center gap-3">
          <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md">
            <Shield className="w-8 h-8 text-[hsl(var(--accent))]" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter">ARG COMMAND</h1>
            <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest leading-none">System Authority</p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {[
            { id: "monitoring", label: "Dashboard", icon: BarChart3, color: "text-blue-400" },
            { id: "management", label: "Usuarios", icon: Users, color: "text-emerald-400" },
            { id: "modules", label: "Academia", icon: BookOpen, color: "text-purple-400" },
            { id: "prizes", label: "Premios", icon: Trophy, color: "text-pink-400" },
            { id: "settings", label: "Configuración", icon: Settings, color: "text-amber-400" }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-4 rounded-xl font-bold transition-all duration-300 group relative",
                activeTab === item.id
                  ? "bg-white/10 text-white shadow-lg"
                  : "text-white/40 hover:text-white/80 hover:bg-white/5"
              )}
            >
              <item.icon className={cn("w-5 h-5", activeTab === item.id ? item.color : "text-white/20")} />
              {item.label}
              {activeTab === item.id && (
                <div className="absolute right-0 w-1 h-6 bg-[hsl(var(--accent))] rounded-l-full" />
              )}
            </button>
          ))}
        </nav>

        <div className="p-6 space-y-4">
          <Card className="bg-white/5 border-white/10 text-white overflow-hidden">
            <CardContent className="p-4 relative">
              <div className="absolute -right-4 -top-4 opacity-10">
                <Activity className="w-20 h-20" />
              </div>
              <p className="text-[10px] text-white/40 font-bold uppercase mb-2">Estado Sistema</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-bold">En Línea</span>
              </div>
            </CardContent>
          </Card>

          {onLogout && (
            <Button
              variant="ghost"
              onClick={onLogout}
              className="w-full flex items-center justify-start gap-3 px-4 py-3 rounded-xl font-bold text-white/40 hover:text-white hover:bg-red-500/20 transition-all border border-white/5 group"
            >
              <LogOut className="w-5 h-5 text-white/20 group-hover:text-red-400" />
              Cerrar Sesión
            </Button>
          )}
        </div>
      </div>

      {/* Main Action Area */}
      <main className="flex-1 p-10 overflow-auto">
        {/* Top Header Bar */}
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">
              Admin / {activeTab === 'monitoring' ? 'Dashboard' : activeTab === 'management' ? 'Usuarios' : 'Academia'}
            </h2>
            <h3 className="text-3xl font-black text-slate-800 tracking-tight">
              {activeTab === 'monitoring' && "Panel de Control"}
              {activeTab === 'management' && "Directorio del Personal"}
              {activeTab === 'modules' && "Gestión Curricular"}
              {activeTab === 'prizes' && "Catálogo de Premios"}
              {activeTab === 'settings' && "Configuración Global"}
            </h3>
          </div>

          <div className="flex gap-3">
            {activeTab === 'prizes' && (
              <Button
                onClick={() => setIsPrizeDialogOpen(true)}
                className="bg-pink-600 hover:bg-pink-700 text-white font-bold h-12 px-6 rounded-xl shadow-lg shadow-pink-500/20"
              >
                <Plus className="w-5 h-5 mr-2" /> Nuevo Premio
              </Button>
            )}

            <Button
              variant="outline"
              onClick={() => setShowImportWizard(true)}
              className="glass-effect h-12 px-6 rounded-xl font-bold text-slate-600 border-slate-200 hover:bg-white"
            >
              <FileSpreadsheet className="w-5 h-5 mr-2" /> Registro Masivo
            </Button>

            <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[hsl(var(--cobalt))] hover:shadow-xl hover:shadow-blue-500/20 active:scale-95 transition-all h-12 px-8 rounded-xl font-bold text-white uppercase tracking-wide">
                  <UserPlus className="w-5 h-5 mr-2" /> Nuevo Registro
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] glass-effect border-none p-0 overflow-hidden">
                <div className="h-2 bg-[hsl(var(--cobalt))]" />
                <div className="p-8">
                  <DialogHeader className="mb-6">
                    <DialogTitle className="text-2xl font-black tracking-tight text-slate-800">Crear Nuevo Perfil</DialogTitle>
                    <DialogDescription className="font-medium text-slate-400">Expande tu ecosistema educativo añadiendo un nuevo integrante.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Nombre Completo</Label>
                        <Input
                          value={newUser.nombre}
                          onChange={(e) => setNewUser({ ...newUser, nombre: e.target.value })}
                          className="bg-slate-50 border-slate-100 rounded-lg h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Email Académico</Label>
                        <Input
                          value={newUser.email}
                          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                          className="bg-slate-50 border-slate-100 rounded-lg h-11"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Contraseña Segura</Label>
                      <Input
                        type="password"
                        value={newUser.password}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                        className="bg-slate-50 border-slate-100 rounded-lg h-11"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Asignar Rol</Label>
                        <Select onValueChange={(v) => setNewUser({ ...newUser, roleId: parseInt(v) })} defaultValue="3">
                          <SelectTrigger className="bg-slate-50 border-slate-100 rounded-lg h-11">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Administrador</SelectItem>
                            <SelectItem value="2">Profesor</SelectItem>
                            <SelectItem value="3">Estudiante</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Nivel de Suscripción</Label>
                        <Select onValueChange={(v) => setNewUser({ ...newUser, planId: parseInt(v) })} defaultValue="2">
                          <SelectTrigger className="bg-slate-50 border-slate-100 rounded-lg h-11">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Básico</SelectItem>
                            <SelectItem value="2">Digital</SelectItem>
                            <SelectItem value="3">Pro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {newUser.roleId === 3 && (
                      <div className="p-4 bg-[hsl(var(--accent))]/5 rounded-xl border border-[hsl(var(--accent))]/10 space-y-3">
                        <Label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">Email del Representante</Label>
                        <Input
                          value={newUser.emailPadre}
                          onChange={(e) => setNewUser({ ...newUser, emailPadre: e.target.value })}
                          placeholder="padre@ejemplo.com"
                          className="bg-white border-slate-100 rounded-lg h-10"
                        />
                        <p className="text-[10px] text-slate-400 font-bold italic">Se enviarán alertas críticas de inactividad aquí.</p>
                      </div>
                    )}
                  </div>
                  <DialogFooter className="mt-8 gap-3 sm:gap-0">
                    <Button variant="ghost" onClick={() => setIsUserDialogOpen(false)} className="font-bold text-slate-400">Cancelar</Button>
                    <Button onClick={handleCreateUser} className="bg-[hsl(var(--cobalt))] text-white font-black px-8 rounded-xl h-12 shadow-lg shadow-blue-500/20">Registrar Perfil</Button>
                  </DialogFooter>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        {/* Content Tabs */}
        <div className="space-y-10">
          {activeTab === "monitoring" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Stats Overlay */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { label: "Uptime", value: "99.9%", icon: Activity, color: "text-blue-500", bg: "bg-blue-500/10", tag: "Estable" },
                  { label: "Niveles", value: "24/24", icon: Monitor, color: "text-emerald-500", bg: "bg-emerald-500/10", tag: "Operativo" },
                  { label: "Usuarios", value: "142", icon: Users, color: "text-purple-500", bg: "bg-purple-500/10", tag: "Activos" },
                  { label: "Carga", value: "12%", icon: Layout, color: "text-cyan-500", bg: "bg-cyan-500/10", tag: "Optimizado" }
                ].map((stat, i) => (
                  <Card key={i} className="glass-effect border-none card-hover overflow-hidden rounded-2xl">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className={cn("p-2.5 rounded-xl", stat.bg)}>
                          <stat.icon className={cn("w-6 h-6", stat.color)} />
                        </div>
                        <span className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full", stat.bg, stat.color)}>
                          {stat.tag}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                      <p className="text-3xl font-black text-slate-800 tracking-tight">{stat.value}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Main Charts */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="md:col-span-2 glass-effect border-none rounded-3xl p-6">
                  <CardHeader className="px-0 pt-0">
                    <CardTitle className="text-xl font-black text-slate-800">Actividad del Sistema</CardTitle>
                    <CardDescription className="font-bold text-slate-400">Interacciones registradas por día de la semana.</CardDescription>
                  </CardHeader>
                  <div className="h-[350px] mt-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={PERFORMANCE_DATA}>
                        <defs>
                          <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0047AB" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#0047AB" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} />
                        <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }} />
                        <Area type="monotone" dataKey="active" stroke="#0047AB" strokeWidth={4} fillOpacity={1} fill="url(#colorActive)" />
                        <Area type="monotone" dataKey="usage" stroke="#00FFFF" strokeWidth={4} fillOpacity={0} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                <div className="space-y-6">
                  <Card className="glass-effect border-none rounded-3xl p-6">
                    <CardHeader className="px-0 pt-0 mb-4">
                      <CardTitle className="text-lg font-black text-slate-800">Rápida Asignación</CardTitle>
                      <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-wider">Vinculación Veloz</CardDescription>
                    </CardHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Select value={selectedUserForAssign} onValueChange={setSelectedUserForAssign}>
                          <SelectTrigger className="bg-slate-50/50 border-none rounded-xl h-12 font-bold">
                            <SelectValue placeholder="Buscar usuario..." />
                          </SelectTrigger>
                          <SelectContent>
                            {users.map(u => (
                              <SelectItem key={u.id} value={u.id.toString()}>{u.nombre}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Select value={selectedModuleForAssign} onValueChange={setSelectedModuleForAssign}>
                          <SelectTrigger className="bg-slate-50/50 border-none rounded-xl h-12 font-bold">
                            <SelectValue placeholder="Seleccionar módulo..." />
                          </SelectTrigger>
                          <SelectContent>
                            {modules.map(m => (
                              <SelectItem key={m.id} value={m.id.toString()}>{m.nombreModulo}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={handleAssign} className="w-full bg-[hsl(var(--cobalt))] text-white font-black h-12 rounded-xl shadow-lg shadow-blue-500/10 active:scale-[0.98] transition-all">
                        ASIGNAR AHORA
                      </Button>
                    </div>
                  </Card>

                  <Card className="bg-gradient-to-br from-[hsl(var(--cobalt))] to-blue-700 border-none rounded-3xl p-6 text-white relative overflow-hidden">
                    <TrendingUp className="absolute -right-8 -bottom-8 w-40 h-40 opacity-10" />
                    <div className="relative z-10">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-100 mb-2">Objetivo Mensual</p>
                      <h4 className="text-2xl font-black mb-1">Crecimiento 92%</h4>
                      <p className="text-xs text-blue-100/70 font-medium mb-4">Sigue optimizando tu flujo de trabajo.</p>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-400 rounded-full w-[92%]" />
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {activeTab === "management" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card className="glass-effect border-none rounded-3xl overflow-hidden shadow-2xl shadow-blue-500/5">
                <CardHeader className="p-8 border-b border-slate-100 bg-white/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl font-black text-slate-800 tracking-tight">Ecosistema Humano</CardTitle>
                      <CardDescription className="text-sm font-bold text-slate-400">Total: {users.length} miembros activos en el sistema.</CardDescription>
                    </div>
                    <div className="relative w-80">
                      <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="Buscar por nombre o email..."
                        className="pl-11 bg-slate-50/50 rounded-2xl border-none h-11 transition-all focus:ring-2 focus:ring-blue-500/20 font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                </CardHeader>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent border-slate-50">
                        <TableHead className="px-8 font-black text-[10px] uppercase tracking-widest text-slate-400 py-6">Identidad</TableHead>
                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 py-6">Estatus</TableHead>
                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 py-6">Nivel Educativo</TableHead>
                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 py-6">Carga Académica</TableHead>
                        <TableHead className="text-right px-8 font-black text-[10px] uppercase tracking-widest text-slate-400 py-6">Operaciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.filter(user =>
                        user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        user.email.toLowerCase().includes(searchTerm.toLowerCase())
                      ).map((user) => (
                        <TableRow key={user.id} className="border-slate-50/50 hover:bg-slate-50/20 transition-colors">
                          <TableCell className="px-8 py-5">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center font-black text-[hsl(var(--cobalt))] text-lg">
                                {user.nombre[0]}
                              </div>
                              <div>
                                <p className="font-black text-slate-800 tracking-tight">{user.nombre}</p>
                                <p className="text-[11px] text-slate-400 font-bold">{user.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={cn(
                              "rounded-lg px-3 py-1 font-black text-[9px] uppercase tracking-wider border-none",
                              ROLE_MAP[user.roleId] === 'Admin' ? 'bg-blue-100 text-blue-700' :
                                ROLE_MAP[user.roleId] === 'Profesor' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'
                            )}>
                              {ROLE_MAP[user.roleId] || "Desconocido"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className={cn(
                                "w-2 h-2 rounded-full",
                                user.planId === 1 ? "bg-slate-400" : user.planId === 2 ? "bg-amber-400" : "bg-cyan-400 animate-pulse"
                              )} />
                              <span className="text-xs font-bold text-slate-600">{PLAN_MAP[user.planId]}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1.5 flex-wrap max-w-[200px]">
                              {user.modules && user.modules.length > 0 ? user.modules.map((m: any, i: number) => (
                                <Badge key={i} className="bg-white border border-slate-100 text-slate-400 text-[9px] font-bold py-0.5 px-2 rounded-md">
                                  {m.nombreModulo}
                                </Badge>
                              )) : <span className="text-slate-300 italic text-[10px] font-bold">Sin asignaciones</span>}
                            </div>
                          </TableCell>
                          <TableCell className="text-right px-8 space-x-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className={cn(
                                "w-10 h-10 rounded-xl transition-all",
                                user.activo ? "text-green-500 hover:bg-green-50" : "text-slate-300 hover:bg-slate-50"
                              )}
                              onClick={() => handleToggleActive(user)}
                            >
                              {user.activo ? <CheckCircle className="w-5 h-5" /> : <Ban className="w-5 h-5" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-10 h-10 rounded-xl text-red-300 hover:text-red-500 hover:bg-red-50 transition-all"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              <Trash2 className="w-5 h-5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </div>
          )}

          {activeTab === "modules" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-10">
              {selectedModuleIdForContent ? (
                <Card className="glass-effect border-none min-h-[700px] rounded-3xl overflow-hidden">
                  <ModuleContentViewer
                    moduleId={selectedModuleIdForContent}
                    onClose={() => setSelectedModuleIdForContent(null)}
                    isInline={true}
                  />
                </Card>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                  <div className="xl:col-span-3 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {modules.filter(mod =>
                        mod.nombreModulo.toLowerCase().includes(moduleSearch.toLowerCase())
                      ).map((mod) => (
                        <Card key={mod.id} className="glass-effect border-none card-hover rounded-3xl p-6 relative overflow-hidden group">
                          <div className="absolute right-0 top-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />

                          <div className="flex justify-between items-start relative z-10 mb-6">
                            <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
                              <BookOpen className="w-6 h-6 text-[hsl(var(--cobalt))]" />
                            </div>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" className="w-9 h-9 text-slate-300 hover:text-red-500 hover:bg-red-50" onClick={() => handleDeleteModule(mod.id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="mb-6 relative z-10">
                            <h4 className="text-xl font-black text-slate-800 tracking-tight mb-1">{mod.nombreModulo}</h4>
                            <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                              <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {mod.duracionDias} Días</span>
                              <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {mod.studentsCount || 0} Reg.</span>
                            </div>
                          </div>

                          <div className="space-y-4 relative z-10">
                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
                              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center font-bold text-purple-600 text-xs">
                                {mod.professor ? mod.professor[0] : '?'}
                              </div>
                              <div className="overflow-hidden">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Responsable</p>
                                <p className="text-xs font-bold text-slate-700 truncate">{mod.professor || "Sin docente"}</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <Button
                                onClick={() => setSelectedModule(mod)}
                                className="bg-white hover:bg-slate-50 text-slate-600 font-bold border border-slate-100 rounded-xl h-11 text-xs"
                              >
                                Participantes
                              </Button>
                              <Button
                                onClick={() => setSelectedModuleIdForContent(mod.id)}
                                className="bg-[hsl(var(--cobalt))] text-white font-bold rounded-xl h-11 text-xs shadow-lg shadow-blue-500/10"
                              >
                                Contenidos
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <aside className="space-y-6">
                    <Card className="glass-effect border-none rounded-3xl p-8 sticky top-10">
                      <div className="bg-blue-500/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
                        <Plus className="w-6 h-6 text-blue-600" />
                      </div>
                      <h4 className="text-2xl font-black text-slate-800 tracking-tight mb-2">Nuevo Módulo</h4>
                      <p className="text-sm font-medium text-slate-400 mb-8 leading-relaxed">Incuba un nuevo programa educativo en tu catálogo.</p>

                      <div className="space-y-6">
                        <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Título del Módulo</Label>
                          <Input
                            placeholder="Ej. Robótica Avanzada"
                            className="bg-slate-50 border-none rounded-xl h-12 font-medium"
                            value={newModule.nombreModulo}
                            onChange={(e) => setNewModule({ ...newModule, nombreModulo: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Duración (Solar)</Label>
                          <div className="relative">
                            <Clock className="absolute right-4 top-3.5 w-5 h-5 text-slate-300" />
                            <Input
                              type="number"
                              placeholder="30"
                              className="bg-slate-50 border-none rounded-xl h-12 font-medium pr-12"
                              value={newModule.duracionDias}
                              onChange={(e) => setNewModule({ ...newModule, duracionDias: parseInt(e.target.value) })}
                            />
                          </div>
                          <p className="text-[10px] text-slate-300 font-bold italic mt-1 ml-1">* Tiempo estimado en días naturales.</p>
                        </div>

                        <Button onClick={handleCreateModule} className="w-full bg-slate-800 hover:bg-slate-900 text-white font-black h-14 rounded-2xl shadow-xl transition-all active:scale-[0.98] mt-4 uppercase tracking-[0.2em] text-xs">
                          INICIAR CREACIÓN
                        </Button>
                      </div>
                    </Card>
                  </aside>
                </div>
              )}
            </div>
          )}

          {activeTab === "prizes" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xl font-black text-slate-800 tracking-tight">Premios Disponibles</h4>
                  <p className="text-sm font-bold text-slate-400">Gestiona los artículos y beneficios para los estudiantes.</p>
                </div>
                <div className="relative w-80">
                  <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Buscar premios..."
                    className="pl-11 bg-white rounded-2xl border-none h-11 shadow-sm font-medium"
                    value={prizeSearch}
                    onChange={(e) => setPrizeSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {prizes.filter(p => p.nombre.toLowerCase().includes(prizeSearch.toLowerCase())).map((prize) => (
                  <Card key={prize.id} className="glass-effect border-none card-hover rounded-3xl overflow-hidden group">
                    <div className="h-40 bg-slate-100 relative overflow-hidden flex items-center justify-center">
                      {prize.imagenUrl ? (
                        <img src={prize.imagenUrl} alt={prize.nombre} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <Trophy className="w-16 h-16 text-slate-300" />
                      )}
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-white/90 backdrop-blur-sm text-pink-600 font-black border-none px-3 py-1">
                          {prize.costoPuntos} Puntos
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <h5 className="font-black text-slate-800 text-lg mb-2 truncate">{prize.nombre}</h5>
                      <p className="text-sm text-slate-500 font-medium mb-4 line-clamp-2 h-10">{prize.descripcion}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                          Stock: {prize.stock || '∞'}
                        </span>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-9 h-9 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-xl"
                            onClick={() => handleDeletePrize(prize.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Dialog open={isPrizeDialogOpen} onOpenChange={setIsPrizeDialogOpen}>
        <DialogContent className="sm:max-w-[500px] glass-effect border-none p-0 overflow-hidden">
          <div className="h-2 bg-pink-600" />
          <div className="p-8">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-black tracking-tight text-slate-800">Añadir Nuevo Premio</DialogTitle>
              <DialogDescription className="font-medium text-slate-400">Define los beneficios y artículos para motivar a tus estudiantes.</DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Nombre del Premio</Label>
                <Input
                  value={newPrize.nombre}
                  onChange={(e) => setNewPrize({ ...newPrize, nombre: e.target.value })}
                  placeholder="Ej. PlayStation 5"
                  className="bg-slate-50 border-slate-100 rounded-lg h-11"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Descripción</Label>
                <textarea
                  value={newPrize.descripcion}
                  onChange={(e) => setNewPrize({ ...newPrize, descripcion: e.target.value })}
                  placeholder="Detalles sobre el premio..."
                  className="w-full bg-slate-50 border border-slate-100 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Costo (Puntos)</Label>
                  <Input
                    type="number"
                    value={newPrize.costoPuntos}
                    onChange={(e) => setNewPrize({ ...newPrize, costoPuntos: parseInt(e.target.value) })}
                    className="bg-slate-50 border-slate-100 rounded-lg h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Stock Inicial</Label>
                  <Input
                    type="number"
                    value={newPrize.stock}
                    onChange={(e) => setNewPrize({ ...newPrize, stock: parseInt(e.target.value) })}
                    className="bg-slate-50 border-slate-100 rounded-lg h-11"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Imagen URL (Opcional)</Label>
                <Input
                  value={newPrize.imagenUrl}
                  onChange={(e) => setNewPrize({ ...newPrize, imagenUrl: e.target.value })}
                  placeholder="https://cloude.com/image.png"
                  className="bg-slate-50 border-slate-100 rounded-lg h-11"
                />
              </div>
            </div>
            <DialogFooter className="mt-8 gap-3 sm:gap-0">
              <Button variant="ghost" onClick={() => setIsPrizeDialogOpen(false)} className="font-bold text-slate-400">Cancelar</Button>
              <Button onClick={handleCreatePrize} className="bg-pink-600 text-white font-black px-8 rounded-xl h-12 shadow-lg shadow-pink-500/20">Registrar Premio</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Popovers & Overlays */}
      <Dialog open={!!selectedModule} onOpenChange={(open) => !open && setSelectedModule(null)}>
        <DialogContent className="max-w-2xl glass-effect border-none rounded-3xl p-0 overflow-hidden shadow-2xl">
          <div className="h-2 bg-gradient-to-r from-blue-500 to-cyan-400" />
          <div className="p-8">
            <DialogHeader className="mb-8">
              <DialogTitle className="text-3xl font-black flex items-center gap-3 text-slate-800 tracking-tight">
                <Box className="text-blue-600 h-8 w-8" />
                {selectedModule?.nombreModulo}
              </DialogTitle>
              <DialogDescription className="text-slate-400 font-bold text-sm">
                Control de despliegue y acceso al módulo educativo.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2 border-b border-slate-50 pb-3">
                  <Shield className="h-4 w-4 text-purple-400" /> Comando Docente
                </h3>
                {selectedModule?.professors && selectedModule.professors.length > 0 ? (
                  <div className="space-y-3">
                    {selectedModule.professors.map((p: any) => (
                      <div key={p.id} className="flex items-center gap-4 bg-slate-50/50 p-3 rounded-2xl border border-white/50">
                        <div className="h-10 w-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700 font-black text-sm shadow-sm">{p.nombre[0]}</div>
                        <div className="overflow-hidden">
                          <p className="text-sm font-black text-slate-800 leading-none mb-1">{p.nombre}</p>
                          <p className="text-[10px] text-slate-400 font-bold truncate">{p.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-[11px] text-slate-300 font-bold italic bg-slate-50 p-4 rounded-xl text-center">Sin responsables asignados.</p>}
              </div>

              <div className="space-y-6">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2 border-b border-slate-50 pb-3">
                  <Users className="h-4 w-4 text-blue-400" /> Batallón de Alumnos ({selectedModule?.students?.length || 0})
                </h3>
                {selectedModule?.students && selectedModule.students.length > 0 ? (
                  <div className="space-y-3 max-h-[350px] overflow-y-auto pr-3">
                    {selectedModule.students.map((s: any) => (
                      <div key={s.id} className="flex items-center gap-4 bg-slate-50/50 p-3 rounded-2xl border border-white/50">
                        <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 font-black text-sm shadow-sm">{s.nombre[0]}</div>
                        <div className="overflow-hidden">
                          <p className="text-sm font-black text-slate-800 leading-none mb-1">{s.nombre}</p>
                          <p className="text-[10px] text-slate-400 font-bold truncate">{s.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-[11px] text-slate-300 font-bold italic bg-slate-50 p-4 rounded-xl text-center">Nivel de reclutamiento: 0</p>}
              </div>
            </div>

            <div className="mt-10 flex justify-end">
              <Button onClick={() => setSelectedModule(null)} className="font-black bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl px-10">Cerrar Monitor</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Global Modals for legacy Wizards */}
      {showImportWizard && (
        <ExcelImportWizard
          onClose={() => setShowImportWizard(false)}
          onSuccess={() => {
            setShowImportWizard(false);
            fetchUsers();
          }}
        />
      )}

      {showAssignWizard && (
        <ModuleAssignmentWizard
          onClose={() => setShowAssignWizard(false)}
          onSuccess={() => {
            setShowAssignWizard(false);
            fetchUsers();
            fetchModules();
          }}
        />
      )}
    </div>
  );

}
