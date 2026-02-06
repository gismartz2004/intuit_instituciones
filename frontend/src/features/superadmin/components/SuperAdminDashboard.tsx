
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    FolderTree,
    Users,
    UserCheck,
    BarChart3,
    FileSpreadsheet,
    Eye,
    BookOpen,
    Search,
    Trophy,
    Plus,
    Trash2,
    Settings,
    LogOut,
    Shield,
    Activity,
    Monitor,
    Layout,
    ClipboardList,
    TrendingUp
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ModuleContentViewer } from './ModuleContentViewer';
import { AssignmentsTable } from './AssignmentsTable';
import { ExcelImportWizard } from './ExcelImportWizard';
import { ModuleAssignmentWizard } from './ModuleAssignmentWizard';
import { AssignmentManagerView } from './AssignmentManagerView';
import { UserManagementView } from './UserManagementView';
import { superadminApi, ModuleWithStats, SystemStats } from '../services/superadmin.api';
import { adminApi } from '../../admin/services/admin.api';
import { type Premio } from '../../admin/types/admin.types';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useLocation } from 'wouter';

export function SuperAdminDashboard() {
    const [_, setLocation] = useLocation();
    const [activeTab, setActiveTab] = useState("overview");

    const [modules, setModules] = useState<ModuleWithStats[]>([]);
    const [stats, setStats] = useState<SystemStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);
    const [showImportWizard, setShowImportWizard] = useState(false);
    const [showAssignWizard, setShowAssignWizard] = useState(false);

    // Search states
    const [moduleSearch, setModuleSearch] = useState('');
    const [prizes, setPrizes] = useState<Premio[]>([]);
    const [prizeSearch, setPrizeSearch] = useState('');

    // Prize Dialog
    const [isPrizeDialogOpen, setIsPrizeDialogOpen] = useState(false);
    const [newPrize, setNewPrize] = useState({
        nombre: "",
        descripcion: "",
        costoPuntos: 100,
        imagenUrl: "",
        stock: 10
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [modulesData, statsData, prizesData] = await Promise.all([
                superadminApi.getAllModules(),
                superadminApi.getSystemStats(),
                adminApi.getPrizes(),
            ]);
            setModules(modulesData);
            setStats(statsData);
            setPrizes(prizesData);
        } catch (error) {
            console.error('Error loading superadmin data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePrize = async () => {
        try {
            await adminApi.createPrize(newPrize);
            loadData();
            setIsPrizeDialogOpen(false);
            setNewPrize({ nombre: "", descripcion: "", costoPuntos: 100, imagenUrl: "", stock: 10 });
        } catch (e) {
            console.error(e);
        }
    };

    const handleDeletePrize = async (prizeId: number) => {
        if (!confirm("¿Estás seguro de eliminar este premio?")) return;
        try {
            await adminApi.deletePrize(prizeId);
            loadData();
        } catch (e) {
            console.error(e);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("edu_user");
        localStorage.removeItem("edu_token");
        setLocation("/login");
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-[#0f172a]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-slate-400 font-bold">Cargando sistema central...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[hsl(var(--background))] premium-gradient-bg flex">
            {/* Sidebar Command Center */}
            <div className="w-72 bg-[#0f172a] text-white flex flex-col shadow-2xl z-20 sticky top-0 h-screen border-r border-white/5">
                <div className="p-8 pb-12 flex items-center gap-3">
                    <div className="bg-blue-600/20 p-2 rounded-xl backdrop-blur-md border border-blue-500/30">
                        <Shield className="w-8 h-8 text-blue-400" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black tracking-tighter uppercase">Command Center</h1>
                        <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest leading-none">Management & Control</p>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    {[
                        { id: "overview", label: "Dashboard", icon: BarChart3, color: "text-blue-400" },
                        { id: "users", label: "Usuarios", icon: Users, color: "text-emerald-400" },
                        { id: "modules", label: "Academia", icon: BookOpen, color: "text-purple-400" },
                        { id: "assignments", label: "Asignaciones", icon: ClipboardList, color: "text-orange-400" },
                        { id: "prizes", label: "Premios", icon: Trophy, color: "text-pink-400" },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-4 rounded-xl font-bold transition-all duration-300 group relative",
                                activeTab === item.id
                                    ? "bg-white/10 text-white shadow-lg border border-white/5"
                                    : "text-white/40 hover:text-white/80 hover:bg-white/5"
                            )}
                        >
                            <item.icon className={cn("w-5 h-5 transition-colors", activeTab === item.id ? item.color : "text-white/20 group-hover:text-white/60")} />
                            {item.label}
                            {activeTab === item.id && (
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-l-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                            )}
                        </button>
                    ))}
                </nav>

                <div className="p-6 space-y-4">
                    <Card className="bg-gradient-to-br from-blue-900/50 to-slate-900/50 border-white/10 text-white overflow-hidden backdrop-blur-sm">
                        <CardContent className="p-4 relative">
                            <div className="absolute -right-4 -top-4 opacity-20">
                                <Activity className="w-20 h-20 text-blue-400" />
                            </div>
                            <p className="text-[10px] text-blue-200/60 font-black uppercase mb-2 tracking-widest">Estado Global</p>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                                <span className="text-sm font-bold tracking-tight">Sistema Nominal</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Button
                        variant="ghost"
                        onClick={handleLogout}
                        className="w-full flex items-center justify-start gap-3 px-4 py-3 rounded-xl font-bold text-white/40 hover:text-white hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20 group"
                    >
                        <LogOut className="w-5 h-5 text-white/20 group-hover:text-red-400 transition-colors" />
                        Cerrar Sesión
                    </Button>
                </div>
            </div>

            {/* Main Action Area */}
            <main className="flex-1 p-10 overflow-auto h-screen">
                {/* Top Header Bar */}
                <header className="flex justify-between items-center mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
                    <div>
                        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                            <Badge variant="outline" className="border-blue-200 text-blue-600 px-2 py-0.5 rounded-md text-[10px]">ROOT ACCESS</Badge>
                            / {activeTab === 'overview' ? 'Vista General' :
                                activeTab === 'users' ? 'Gestión de Usuarios' :
                                    activeTab === 'modules' ? 'Contenido Académico' :
                                        activeTab === 'assignments' ? 'Centro de Asignaciones' : 'Catálogo de Premios'}
                        </h2>
                        <h3 className="text-4xl font-black text-slate-800 tracking-tight">
                            {activeTab === 'overview' && "Panel de Control"}
                            {activeTab === 'users' && "Directorio Global"}
                            {activeTab === 'modules' && "Matriz Curricular"}
                            {activeTab === 'assignments' && "Gestión de Accesos"}
                            {activeTab === 'prizes' && "Recompensas"}
                        </h3>
                    </div>
                </header>

                <div className="space-y-6">
                    {/* View: Overview */}
                    {activeTab === 'overview' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                            {/* Stats Overlay */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                {[
                                    { label: "Módulos Totales", value: stats?.totalModules || 0, icon: FolderTree, color: "text-blue-600", bg: "bg-blue-500/10", border: "border-blue-100" },
                                    { label: "Estudiantes", value: stats?.totalStudents || 0, icon: Users, color: "text-emerald-600", bg: "bg-emerald-500/10", border: "border-emerald-100" },
                                    { label: "Profesores", value: stats?.totalProfessors || 0, icon: UserCheck, color: "text-purple-600", bg: "bg-purple-500/10", border: "border-purple-100" },
                                    { label: "Asignaciones", value: stats?.totalAssignments || 0, icon: ClipboardList, color: "text-orange-600", bg: "bg-orange-500/10", border: "border-orange-100" }
                                ].map((stat, i) => (
                                    <Card key={i} className={cn("glass-effect shadow-xl shadow-slate-200/40 rounded-3xl border overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl", stat.border)}>
                                        <CardContent className="p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className={cn("p-3 rounded-2xl", stat.bg)}>
                                                    <stat.icon className={cn("w-6 h-6", stat.color)} />
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                                                <p className="text-4xl font-black text-slate-800 tracking-tighter">{stat.value}</p>
                                            </div>

                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            {/* Main Charts */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <Card className="md:col-span-2 glass-effect border-none rounded-3xl p-6 shadow-xl shadow-slate-200/40">
                                    <CardHeader className="px-0 pt-0">
                                        <CardTitle className="text-xl font-black text-slate-800">Actividad del Sistema</CardTitle>
                                        <CardDescription className="font-bold text-slate-400">Interacciones registradas por día de la semana.</CardDescription>
                                    </CardHeader>
                                    <div className="h-[300px] mt-6">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={[
                                                { name: 'Lun', active: 400, usage: 240 },
                                                { name: 'Mar', active: 600, usage: 380 },
                                                { name: 'Mie', active: 800, usage: 520 },
                                                { name: 'Jue', active: 1100, usage: 780 },
                                                { name: 'Vie', active: 1300, usage: 900 },
                                                { name: 'Sab', active: 900, usage: 600 },
                                                { name: 'Dom', active: 700, usage: 450 },
                                            ]}>
                                                <defs>
                                                    <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                                                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} />
                                                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }} />
                                                <Area type="monotone" dataKey="active" stroke="#2563eb" strokeWidth={4} fillOpacity={1} fill="url(#colorActive)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </Card>

                                <div className="space-y-6">
                                    <Card className="glass-effect border-none rounded-3xl p-8 flex flex-col justify-center items-center text-center relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-2xl">
                                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                                        <div className="relative z-10 space-y-6">
                                            <div className="w-20 h-20 bg-blue-500/20 rounded-3xl flex items-center justify-center mx-auto ring-1 ring-white/10 backdrop-blur-md">
                                                <TrendingUp className="w-10 h-10 text-blue-400" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-300 mb-2">Cuota de Rendimiento</p>
                                                <h4 className="text-3xl font-black tracking-tight">92.4%</h4>
                                                <div className="w-full bg-white/10 h-1.5 rounded-full mt-4 overflow-hidden">
                                                    <div className="bg-blue-500 h-full rounded-full" style={{ width: '92.4%' }} />
                                                </div>
                                            </div>
                                            <p className="text-xs text-slate-400 font-bold italic">Nivel de eficiencia optimizado</p>
                                        </div>
                                    </Card>

                                    <Card className="glass-effect border-none rounded-3xl p-8 relative overflow-hidden group bg-white shadow-xl shadow-slate-200/40 border border-blue-50">
                                        <div className="relative z-10">
                                            <h4 className="text-lg font-black text-slate-800 mb-4">Acceso Rápido</h4>
                                            <div className="grid grid-cols-1 gap-3">
                                                <Button onClick={() => setShowImportWizard(true)} variant="outline" className="justify-start h-12 rounded-xl border-slate-100 hover:bg-slate-50 font-bold text-xs uppercase tracking-wider">
                                                    <FileSpreadsheet className="w-4 h-4 mr-3 text-emerald-500" />
                                                    Carga Masiva
                                                </Button>
                                                <Button onClick={() => setShowAssignWizard(true)} variant="outline" className="justify-start h-12 rounded-xl border-slate-100 hover:bg-slate-50 font-bold text-xs uppercase tracking-wider">
                                                    <ClipboardList className="w-4 h-4 mr-3 text-orange-500" />
                                                    Nuevas Asignaciones
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* View: Users Management */}
                    {activeTab === 'users' && (
                        <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
                            <UserManagementView />
                        </div>
                    )}

                    {/* View: Modules */}
                    {activeTab === 'modules' && (
                        <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 space-y-6">
                            <Card className="glass-effect border-none p-6 rounded-3xl">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <CardTitle className="text-xl font-black text-slate-800">Repositorio Académico</CardTitle>
                                        <CardDescription className="font-bold text-slate-400">Explora todos los módulos, niveles y contenidos del sistema.</CardDescription>
                                    </div>
                                    <div className="relative w-72">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                        <Input
                                            placeholder="Filtrar módulos..."
                                            value={moduleSearch}
                                            onChange={(e) => setModuleSearch(e.target.value)}
                                            className="pl-11 h-12 rounded-xl border-slate-200 bg-white/50 focus:bg-white transition-all font-medium"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {modules
                                        .filter(m => m.nombreModulo.toLowerCase().includes(moduleSearch.toLowerCase()))
                                        .map((module) => (
                                            <Card key={module.id} className="group hover:shadow-xl transition-all duration-300 border-none bg-white rounded-2xl overflow-hidden shadow-sm">
                                                <div className="h-32 bg-gradient-to-br from-blue-600 to-purple-700 relative p-6 flex flex-col justify-between">
                                                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                                                    <div className="relative z-10 flex justify-between items-start">
                                                        <Badge className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-md">
                                                            {module.levelCount} Niveles
                                                        </Badge>
                                                    </div>
                                                    <h4 className="relative z-10 text-xl font-black text-white leading-tight">{module.nombreModulo}</h4>
                                                </div>
                                                <CardContent className="p-6">
                                                    <div className="space-y-4">
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-slate-500 font-bold">Estudiantes</span>
                                                            <span className="text-slate-800 font-black">{module.studentCount}</span>
                                                        </div>
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-slate-500 font-bold">Profesores</span>
                                                            <span className="text-slate-800 font-black">{module.professorCount}</span>
                                                        </div>

                                                        <Button
                                                            onClick={() => setSelectedModuleId(module.id)}
                                                            className="w-full mt-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold border border-slate-200"
                                                        >
                                                            <Eye className="w-4 h-4 mr-2" />
                                                            Inspeccionar Contenido
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* View: Assignments */}
                    {activeTab === 'assignments' && (
                        <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 space-y-6">
                            <div className="flex justify-end gap-3 mb-4">
                                <Button
                                    onClick={() => setShowAssignWizard(true)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 px-6 shadow-lg shadow-blue-500/20 font-bold transition-all active:scale-95"
                                >
                                    <BookOpen className="w-4 h-4 mr-2" />
                                    Nueva Asignación Rápida
                                </Button>
                            </div>

                            <AssignmentManagerView onClose={() => loadData()} />
                        </div>
                    )}

                    {/* View: Prizes */}
                    {activeTab === 'prizes' && (
                        <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
                            <div className="flex justify-end mb-6">
                                <Button onClick={() => setIsPrizeDialogOpen(true)} className="bg-pink-600 hover:bg-pink-700 text-white rounded-xl h-12 px-6 shadow-lg shadow-pink-500/20 font-bold">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Nuevo Premio
                                </Button>
                            </div>

                            <Card className="glass-effect border-none p-6 rounded-3xl">
                                <CardHeader className="px-0 pt-0 pb-6 border-b border-slate-100 mb-6">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-xl font-black text-slate-800">Catálogo de Premios</CardTitle>
                                        <div className="relative w-72">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                            <Input
                                                placeholder="Buscar premios..."
                                                value={prizeSearch}
                                                onChange={(e) => setPrizeSearch(e.target.value)}
                                                className="pl-11 h-11 rounded-xl bg-white border-slate-200"
                                            />
                                        </div>
                                    </div>
                                </CardHeader>

                                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                    {prizes
                                        .filter(p => p.nombre.toLowerCase().includes(prizeSearch.toLowerCase()))
                                        .map((prize) => (
                                            <Card key={prize.id} className="relative group overflow-hidden border-2 hover:border-pink-200 transition-all rounded-2xl">
                                                <div className="h-40 bg-slate-50 flex items-center justify-center relative">
                                                    {prize.imagenUrl ? (
                                                        <img src={prize.imagenUrl} alt={prize.nombre} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Trophy className="w-16 h-16 text-slate-200" />
                                                    )}
                                                    <Button
                                                        variant="destructive"
                                                        size="icon"
                                                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100 shadow-md"
                                                        onClick={() => handleDeletePrize(prize.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                                <CardHeader className="text-center pt-4 pb-6">
                                                    <CardTitle className="text-sm font-bold truncate mb-1">{prize.nombre}</CardTitle>
                                                    <Badge className="bg-pink-100 text-pink-700 hover:bg-pink-200 border-none px-3 py-1">
                                                        {prize.costoPuntos} Puntos
                                                    </Badge>
                                                </CardHeader>
                                            </Card>
                                        ))}
                                </div>
                            </Card>
                        </div>
                    )}
                </div>
            </main>

            {/* Modals */}
            {selectedModuleId && (
                <ModuleContentViewer
                    moduleId={selectedModuleId}
                    onClose={() => setSelectedModuleId(null)}
                />
            )}

            {showImportWizard && (
                <ExcelImportWizard
                    onClose={() => setShowImportWizard(false)}
                    onSuccess={() => {
                        setShowImportWizard(false);
                        loadData();
                    }}
                />
            )}

            {showAssignWizard && (
                <ModuleAssignmentWizard
                    onClose={() => setShowAssignWizard(false)}
                    onSuccess={() => {
                        setShowAssignWizard(false);
                        loadData();
                    }}
                />
            )}

            <Dialog open={isPrizeDialogOpen} onOpenChange={setIsPrizeDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Crear Nuevo Premio</DialogTitle>
                        <DialogDescription>Añade un nuevo artículo al catálogo de recompensas</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Nombre del Premio</Label>
                            <Input
                                value={newPrize.nombre}
                                onChange={(e) => setNewPrize({ ...newPrize, nombre: e.target.value })}
                                placeholder="Ej. Tarjeta de Regalo Amazon"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Descripción</Label>
                            <Input
                                value={newPrize.descripcion}
                                onChange={(e) => setNewPrize({ ...newPrize, descripcion: e.target.value })}
                                placeholder="Breve descripción del premio"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Costo (Puntos)</Label>
                                <Input
                                    type="number"
                                    value={newPrize.costoPuntos}
                                    onChange={(e) => setNewPrize({ ...newPrize, costoPuntos: parseInt(e.target.value) })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Stock Inicial</Label>
                                <Input
                                    type="number"
                                    value={newPrize.stock}
                                    onChange={(e) => setNewPrize({ ...newPrize, stock: parseInt(e.target.value) })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>URL de Imagen (Opcional)</Label>
                            <Input
                                value={newPrize.imagenUrl}
                                onChange={(e) => setNewPrize({ ...newPrize, imagenUrl: e.target.value })}
                                placeholder="https://ejemplo.com/imagen.jpg"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsPrizeDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleCreatePrize} className="bg-pink-600 hover:bg-pink-700 text-white">Crear Premio</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
