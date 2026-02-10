import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Search,
    BookOpen,
    UserPlus,
    UserMinus,
    CheckCircle2,
    Users,
} from "lucide-react";
import { adminApi } from "../services/admin.api";
import { User, ModuleWithStats } from "../types/admin.types";
import { useToast } from "@/hooks/use-toast";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export function ProfessorAssignmentsView() {
    const [modules, setModules] = useState<ModuleWithStats[]>([]);
    const [professors, setProfessors] = useState<User[]>([]);
    const [selectedModule, setSelectedModule] = useState<ModuleWithStats | null>(null);
    const [currentModuleProfessors, setCurrentModuleProfessors] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const [moduleSearch, setModuleSearch] = useState("");
    const [profSearch, setProfSearch] = useState("");

    const { toast } = useToast();

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (selectedModule) {
            loadModuleProfessors(selectedModule.id);
        }
    }, [selectedModule]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [modulesData, profsData] = await Promise.all([
                adminApi.getAllModulesWithStats(),
                adminApi.getSystemProfessors(),
            ]);
            setModules(modulesData);
            setProfessors(profsData);
            if (modulesData.length > 0) {
                setSelectedModule(modulesData[0]);
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "No se pudieron cargar los datos iniciales",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const loadModuleProfessors = async (moduleId: number) => {
        try {
            const data = await adminApi.getModuleProfessors(moduleId);
            setCurrentModuleProfessors(data);
        } catch (error) {
            console.error("Error loading module professors:", error);
        }
    };

    const handleAddProfessor = async (professorId: number) => {
        if (!selectedModule) return;
        setActionLoading(professorId);
        try {
            await adminApi.addProfessorToModule(selectedModule.id, professorId);
            toast({
                title: "Docente asignado",
                description: "El profesor ha sido vinculado al módulo",
            });
            await loadModuleProfessors(selectedModule.id);
        } catch (error) {
            toast({
                title: "Error",
                description: "No se pudo asignar el profesor",
                variant: "destructive",
            });
        } finally {
            setActionLoading(null);
        }
    };

    const handleRemoveProfessor = async (professorId: number) => {
        if (!selectedModule) return;
        setActionLoading(professorId);
        try {
            await adminApi.unassignProfessorFromModule(selectedModule.id, professorId);
            toast({
                title: "Docente removido",
                description: "El profesor ya no tiene acceso a este módulo",
            });
            await loadModuleProfessors(selectedModule.id);
        } catch (error) {
            toast({
                title: "Error",
                description: "No se pudo remover al profesor",
                variant: "destructive",
            });
        } finally {
            setActionLoading(null);
        }
    };

    const currentProfIds = new Set(currentModuleProfessors.map((p) => p.id));

    const filteredModules = modules.filter((m) =>
        m.nombreModulo.toLowerCase().includes(moduleSearch.toLowerCase())
    );

    const availableProfessors = professors.filter(
        (p) =>
            (p.nombre.toLowerCase().includes(profSearch.toLowerCase()) ||
                p.email.toLowerCase().includes(profSearch.toLowerCase())) &&
            !currentProfIds.has(p.id)
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-160px)] bg-white rounded-2xl border border-slate-100">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
                <p className="text-slate-500 font-medium">Cargando Gestor de Docentes...</p>
            </div>
        );
    }

    return (
        <div className="bg-slate-50 border border-slate-100 rounded-3xl overflow-hidden h-[calc(100vh-160px)] flex flex-col">
            <header className="bg-white border-b px-6 py-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <Users className="w-5 h-5 text-purple-600" />
                            Gestión de Docentes por Módulo
                        </h1>
                        <p className="text-sm text-slate-500">Asigna uno o más profesores para tutelar este contenido</p>
                    </div>
                </div>
            </header>

            <div className="flex flex-col xl:flex-row overflow-hidden flex-1 min-h-0">
                <aside className="w-full xl:w-80 bg-white border-r flex flex-col overflow-hidden shadow-sm min-h-0">
                    <div className="p-4 border-b bg-slate-50/50">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <Input
                                placeholder="Buscar módulo..."
                                className="pl-9 bg-white border-slate-200 rounded-xl"
                                value={moduleSearch}
                                onChange={(e) => setModuleSearch(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto scrollbar-hidden p-3 space-y-2">
                        {filteredModules.map((mod) => (
                            <button
                                key={mod.id}
                                onClick={() => setSelectedModule(mod)}
                                className={`w-full text-left p-4 rounded-xl transition-all border-2 ${selectedModule?.id === mod.id
                                        ? "bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-200"
                                        : "bg-white text-slate-600 border-transparent hover:border-slate-100 hover:bg-slate-50"
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <BookOpen className="w-4 h-4" />
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold truncate">{mod.nombreModulo}</div>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </aside>

                <main className="flex-1 overflow-y-auto scrollbar-hidden p-6 flex flex-col gap-6 min-h-0">
                    {selectedModule && (
                        <>
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">
                                    {selectedModule.nombreModulo}
                                </h2>
                                <Badge className="bg-purple-100 text-purple-700 border-none px-3">
                                    {currentModuleProfessors.length} Profesores Asignados
                                </Badge>
                            </div>

                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                <Card className="border-none shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden ring-1 ring-slate-100">
                                    <CardHeader className="bg-emerald-50/50 border-b border-emerald-100">
                                        <CardTitle className="text-emerald-900 flex items-center gap-2">
                                            <CheckCircle2 className="w-5 h-5" />
                                            Docentes Asignados
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-2">
                                        <Table>
                                            <TableBody>
                                                {currentModuleProfessors.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell className="text-center py-12 text-slate-400 italic">
                                                            Sin docentes específicos.
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    currentModuleProfessors.map((p) => (
                                                        <TableRow key={p.id} className="hover:bg-emerald-50/10 border-emerald-100/30">
                                                            <TableCell>
                                                                <div className="font-bold text-slate-800">{p.nombre}</div>
                                                                <div className="text-xs text-slate-500">{p.email}</div>
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleRemoveProfessor(p.id)}
                                                                    disabled={actionLoading === p.id}
                                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                                                                >
                                                                    <UserMinus className="w-4 h-4 mr-2" />
                                                                    Quitar
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>

                                <Card className="border-none shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden ring-1 ring-slate-100 flex flex-col">
                                    <CardHeader className="bg-purple-50/50 border-b border-purple-100">
                                        <CardTitle className="text-purple-900 flex items-center gap-2">
                                            <UserPlus className="w-5 h-5" />
                                            Directorio de Docentes
                                        </CardTitle>
                                        <div className="relative mt-4">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                            <Input
                                                placeholder="Buscar por nombre o email..."
                                                className="pl-9 h-10 bg-white border-purple-100 rounded-xl"
                                                value={profSearch}
                                                onChange={(e) => setProfSearch(e.target.value)}
                                            />
                                        </div>
                                    </CardHeader>
                                    <div className="flex-1 overflow-y-auto p-2">
                                        <Table>
                                            <TableBody>
                                                {availableProfessors.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell className="text-center py-12 text-slate-400 italic">
                                                            No hay más docentes disponibles.
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    availableProfessors.map((p) => (
                                                        <TableRow key={p.id} className="hover:bg-purple-50/10 border-purple-100/30">
                                                            <TableCell>
                                                                <div className="font-bold text-slate-800">{p.nombre}</div>
                                                                <div className="text-xs text-slate-500">{p.email}</div>
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => handleAddProfessor(p.id)}
                                                                    disabled={actionLoading === p.id}
                                                                    className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-sm"
                                                                >
                                                                    <UserPlus className="w-4 h-4 mr-2" />
                                                                    Asignar
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </Card>
                            </div>
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}
