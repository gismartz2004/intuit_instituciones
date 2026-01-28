import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
    Download,
    BookOpen,
    Search,
    Trophy,
    Plus,
    Trash2
} from 'lucide-react';
import {
    ModuleContentViewer,
    AssignmentsTable,
    ExcelImportWizard,
    ModuleAssignmentWizard,
    ModuleWithStats,
    SystemStats,
    superadminApi,
} from '../';
import { adminApi } from '../../admin/services/admin.api';
import { type Premio } from '../../admin/types/admin.types';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export function SuperAdminDashboard() {
    const [modules, setModules] = useState<ModuleWithStats[]>([]);
    const [stats, setStats] = useState<SystemStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);
    const [showImportWizard, setShowImportWizard] = useState(false);
    const [showAssignWizard, setShowAssignWizard] = useState(false);
    const [moduleSearch, setModuleSearch] = useState('');
    const [prizes, setPrizes] = useState<Premio[]>([]);
    const [prizeSearch, setPrizeSearch] = useState('');
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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0047AB] mx-auto mb-4"></div>
                    <p className="text-slate-500">Cargando panel de super administrador...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Super Administrador</h1>
                    <p className="text-slate-500 mt-1">Vista completa del sistema</p>
                </div>
                <Badge className="bg-yellow-500 text-white px-4 py-2">
                    <Eye className="w-4 h-4 mr-2" />
                    Modo Solo Lectura
                </Badge>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Módulos</CardTitle>
                        <FolderTree className="h-4 w-4 text-slate-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalModules || 0}</div>
                        <p className="text-xs text-slate-500">Total en sistema</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Estudiantes</CardTitle>
                        <Users className="h-4 w-4 text-slate-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalStudents || 0}</div>
                        <p className="text-xs text-slate-500">Registrados</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Profesores</CardTitle>
                        <UserCheck className="h-4 w-4 text-slate-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalProfessors || 0}</div>
                        <p className="text-xs text-slate-500">Activos</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Asignaciones</CardTitle>
                        <BarChart3 className="h-4 w-4 text-slate-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalAssignments || 0}</div>
                        <p className="text-xs text-slate-500">Totales</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="modules" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="modules">
                        <FolderTree className="w-4 h-4 mr-2" />
                        Módulos & Contenido
                    </TabsTrigger>
                    <TabsTrigger value="assignments">
                        <Users className="w-4 h-4 mr-2" />
                        Asignaciones
                    </TabsTrigger>
                    <TabsTrigger value="students">
                        <FileSpreadsheet className="w-4 h-4 mr-2" />
                        Gestión de Estudiantes
                    </TabsTrigger>
                    <TabsTrigger value="prizes">
                        <Trophy className="w-4 h-4 mr-2" />
                        Catálogo de Premios
                    </TabsTrigger>
                </TabsList>

                {/* Modules Tab */}
                <TabsContent value="modules" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Todos los Módulos</CardTitle>
                                    <CardDescription>
                                        Vista completa de módulos con acceso de solo lectura a RAG, HA y PIM
                                    </CardDescription>
                                </div>
                                <div className="relative w-72">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                    <Input
                                        placeholder="Buscar módulos..."
                                        value={moduleSearch}
                                        onChange={(e) => setModuleSearch(e.target.value)}
                                        className="pl-10 rounded-xl"
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4">
                                {modules
                                    .filter(m => m.nombreModulo.toLowerCase().includes(moduleSearch.toLowerCase()))
                                    .map((module) => (
                                        <Card key={module.id} className="hover:shadow-md transition-shadow">
                                            <CardHeader>
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <CardTitle className="text-lg">{module.nombreModulo}</CardTitle>
                                                        <CardDescription className="flex gap-4 mt-2">
                                                            <span>{module.levelCount} niveles</span>
                                                            <span>•</span>
                                                            <span>{module.studentCount} estudiantes</span>
                                                            <span>•</span>
                                                            <span>{module.professorCount} profesores</span>
                                                        </CardDescription>
                                                    </div>
                                                    <Button
                                                        onClick={() => setSelectedModuleId(module.id)}
                                                        variant="outline"
                                                    >
                                                        <Eye className="w-4 h-4 mr-2" />
                                                        Ver Contenido
                                                    </Button>
                                                </div>
                                            </CardHeader>
                                        </Card>
                                    ))}
                                {modules.filter(m => m.nombreModulo.toLowerCase().includes(moduleSearch.toLowerCase())).length === 0 && (
                                    <div className="text-center py-12 text-slate-400">
                                        No se encontraron módulos con ese nombre.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Assignments Tab */}
                <TabsContent value="assignments" className="space-y-4">
                    <div className="flex justify-end">
                        <Button onClick={() => setShowAssignWizard(true)} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 shadow-md shadow-blue-500/20">
                            <BookOpen className="w-4 h-4 mr-2" />
                            Nueva Asignación
                        </Button>
                    </div>
                    <AssignmentsTable />
                </TabsContent>

                {/* Students Management Tab */}
                <TabsContent value="students" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Importación de Estudiantes</CardTitle>
                                    <CardDescription>
                                        Crear múltiples estudiantes desde archivo Excel
                                    </CardDescription>
                                </div>
                                <Button onClick={() => setShowImportWizard(true)}>
                                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                                    Importar Excel
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8 text-slate-500">
                                <FileSpreadsheet className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                <p className="mb-4">Haz clic en "Importar Excel" para comenzar</p>
                                <Button variant="outline" size="sm">
                                    <Download className="w-4 h-4 mr-2" />
                                    Descargar Plantilla Excel
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Prizes Tab */}
                <TabsContent value="prizes" className="space-y-4">
                    <div className="flex justify-end">
                        <Button onClick={() => setIsPrizeDialogOpen(true)} className="bg-pink-600 hover:bg-pink-700 text-white rounded-xl px-6">
                            <Plus className="w-4 h-4 mr-2" />
                            Nuevo Premio
                        </Button>
                    </div>
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Catálogo de Premios</CardTitle>
                                    <CardDescription>
                                        Gestiona los artículos disponibles en el Sorteo Gamer
                                    </CardDescription>
                                </div>
                                <div className="relative w-72">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                    <Input
                                        placeholder="Buscar premios..."
                                        value={prizeSearch}
                                        onChange={(e) => setPrizeSearch(e.target.value)}
                                        className="pl-10 rounded-xl"
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {prizes
                                    .filter(p => p.nombre.toLowerCase().includes(prizeSearch.toLowerCase()))
                                    .map((prize) => (
                                        <Card key={prize.id} className="relative group overflow-hidden border-2">
                                            <div className="h-40 bg-slate-50 flex items-center justify-center relative">
                                                {prize.imagenUrl ? (
                                                    <img src={prize.imagenUrl} alt={prize.nombre} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Trophy className="w-16 h-16 text-slate-200" />
                                                )}
                                                <Button
                                                    variant="destructive"
                                                    size="icon"
                                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => handleDeletePrize(prize.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                            <CardHeader className="text-center pt-4">
                                                <CardTitle className="text-lg truncate">{prize.nombre}</CardTitle>
                                                <CardDescription className="text-lg font-bold text-purple-600">
                                                    {prize.costoPuntos} Puntos
                                                </CardDescription>
                                            </CardHeader>
                                        </Card>
                                    ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Module Content Viewer Modal */}
            {selectedModuleId && (
                <ModuleContentViewer
                    moduleId={selectedModuleId}
                    onClose={() => setSelectedModuleId(null)}
                />
            )}

            {/* Excel Import Wizard Modal */}
            {showImportWizard && (
                <ExcelImportWizard
                    onClose={() => setShowImportWizard(false)}
                    onSuccess={() => {
                        setShowImportWizard(false);
                        loadData(); // Reload stats
                    }}
                />
            )}

            {/* Module Assignment Wizard Modal */}
            {showAssignWizard && (
                <ModuleAssignmentWizard
                    onClose={() => setShowAssignWizard(false)}
                    onSuccess={() => {
                        setShowAssignWizard(false);
                        loadData(); // Reload stats
                    }}
                />
            )}

            {/* Create Prize Dialog */}
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
