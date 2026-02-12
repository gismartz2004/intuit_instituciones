import { useState, useEffect } from "react";
import { useRoute, useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, ArrowLeft, Trash2, Code, Layers, Rocket, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import specialistProfessorApi, { SpecialistLevel } from "../services/specialistProfessor.api";
import { Badge } from "@/components/ui/badge";

export default function SpecialistCourseEditor() {
    const [match, params] = useRoute("/specialist-professor/module/:id");
    const [, setLocation] = useLocation();
    const moduleId = match && params ? (params as any).id : null;

    const [levels, setLevels] = useState<SpecialistLevel[]>([]);
    const [loading, setLoading] = useState(true);
    const [newLevelTitle, setNewLevelTitle] = useState("");
    const [showLevelDialog, setShowLevelDialog] = useState(false);
    const [selectedLevelId, setSelectedLevelId] = useState<number | null>(null);

    useEffect(() => {
        if (moduleId) {
            fetchLevels();
        }
    }, [moduleId]);

    const fetchLevels = async () => {
        try {
            setLoading(true);
            const data = await specialistProfessorApi.getLevels(parseInt(moduleId));
            setLevels(data);
            if (data.length > 0 && !selectedLevelId) {
                setSelectedLevelId(data[0].id);
            }
        } catch (error) {
            console.error("Error fetching levels", error);
            toast({ title: "Error", description: "No se pudieron cargar los niveles", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleCreateLevel = async () => {
        if (!newLevelTitle.trim()) return;

        try {
            await specialistProfessorApi.createLevel(parseInt(moduleId), {
                tituloNivel: newLevelTitle,
                orden: levels.length + 1
            });
            toast({ title: "Éxito", description: "Nivel creado correctamente" });
            setNewLevelTitle("");
            setShowLevelDialog(false);
            fetchLevels();
        } catch (error) {
            toast({ title: "Error", description: "No se pudo crear el nivel", variant: "destructive" });
        }
    };

    const handleDeleteLevel = async (levelId: number) => {
        if (!confirm("¿Estás seguro de que quieres eliminar este nivel y todas sus actividades?")) return;

        try {
            await specialistProfessorApi.deleteLevel(parseInt(moduleId), levelId);
            toast({ title: "Éxito", description: "Nivel eliminado correctamente" });
            if (selectedLevelId === levelId) {
                setSelectedLevelId(null);
            }
            fetchLevels();
        } catch (error) {
            toast({ title: "Error", description: "No se pudo eliminar el nivel", variant: "destructive" });
        }
    };

    if (loading && levels.length === 0) {
        return <div className="p-8">Cargando niveles...</div>;
    }

    const selectedLevel = levels.find(l => l.id === selectedLevelId);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Top Bar */}
            <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => setLocation("/specialist-teach")}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <Badge className="bg-indigo-600 mb-1">EDITOR ESPECIALISTA</Badge>
                        <h1 className="text-xl font-black text-slate-800">Gestión de Módulo #{moduleId}</h1>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="font-bold rounded-xl">Previsualizar</Button>
                    <Button className="bg-indigo-600 font-bold rounded-xl">Publicar Cambios</Button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar: Levels */}
                <div className="w-80 bg-white border-r border-slate-200 flex flex-col h-[calc(100vh-73px)]">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h2 className="font-black text-slate-900 uppercase text-xs tracking-widest">Niveles</h2>
                        <Dialog open={showLevelDialog} onOpenChange={setShowLevelDialog}>
                            <DialogTrigger asChild>
                                <Button size="sm" variant="ghost" className="text-indigo-600 p-0 h-6 w-6">
                                    <Plus className="w-5 h-5" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Nuevo Nivel Tecnológico</DialogTitle>
                                </DialogHeader>
                                <div className="py-4">
                                    <Label>Título del Nivel</Label>
                                    <Input
                                        placeholder="Ej: Fundamentos de FPGA"
                                        value={newLevelTitle}
                                        onChange={(e) => setNewLevelTitle(e.target.value)}
                                    />
                                </div>
                                <DialogFooter>
                                    <Button onClick={handleCreateLevel} className="bg-indigo-600">Crear Nivel</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        {levels.map((lvl) => (
                            <button
                                key={lvl.id}
                                onClick={() => setSelectedLevelId(lvl.id)}
                                className={`w-full text-left p-4 rounded-2xl transition-all border ${selectedLevelId === lvl.id
                                    ? 'bg-slate-900 border-slate-900 shadow-lg shadow-slate-200'
                                    : 'bg-white border-slate-100 hover:border-slate-300 text-slate-600'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1 mr-2 overflow-hidden">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className={`text-[10px] font-black uppercase ${selectedLevelId === lvl.id ? 'text-indigo-400' : 'text-slate-400'}`}>
                                                Nivel {lvl.orden}
                                            </span>
                                            {selectedLevelId === lvl.id && <CheckCircle2 className="w-3 h-3 text-indigo-400" />}
                                        </div>
                                        <p className={`truncate font-bold ${selectedLevelId === lvl.id ? 'text-white' : 'text-slate-700'}`}>
                                            {lvl.tituloNivel}
                                        </p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className={`h-8 w-8 rounded-lg shrink-0 ${selectedLevelId === lvl.id ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-300 hover:text-red-600 hover:bg-red-50'}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteLevel(lvl.id);
                                        }}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content Area: Activity Picker/Editor */}
                <div className="flex-1 overflow-y-auto p-12">
                    {!selectedLevelId ? (
                        <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto">
                            <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mb-6 text-slate-400">
                                <Layers className="w-10 h-10" />
                            </div>
                            <h2 className="text-2xl font-black text-slate-800 mb-2">Selecciona un nivel</h2>
                            <p className="text-slate-500">Para empezar a diseñar el contenido técnico, selecciona o crea un nivel en la barra lateral.</p>
                        </div>
                    ) : (
                        <div className="max-w-4xl mx-auto space-y-12">
                            <header>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center font-black text-sm">
                                        {selectedLevel?.orden}
                                    </span>
                                    <h2 className="text-3xl font-black text-slate-900">{selectedLevel?.tituloNivel}</h2>
                                </div>
                                <p className="text-slate-500 text-lg">Define la actividad pedagógica técnica para este nivel.</p>
                            </header>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {[
                                    {
                                        type: 'BD',
                                        title: 'Bloque de Desarrollo',
                                        desc: 'Ciclo de 12 pasos para aprendizaje teórico-práctico intenso y guiado.',
                                        icon: Code,
                                        color: 'indigo',
                                        route: `/specialist-professor/bd/edit/${selectedLevelId}`
                                    },
                                    {
                                        type: 'IT',
                                        title: 'Iteración',
                                        desc: 'Fase de integración de conocimientos donde el estudiante aplica lo aprendido en un entorno libre.',
                                        icon: Layers,
                                        color: 'violet',
                                        route: `/specialist-professor/it/edit/${selectedLevelId}`
                                    },
                                    {
                                        type: 'PIC',
                                        title: 'P. Innovación',
                                        desc: 'Proyecto de Innovación/Integración modular para consolidar hitos tecnológicos complejos.',
                                        icon: Rocket,
                                        color: 'emerald',
                                        route: `/specialist-professor/pic/edit/${selectedLevelId}`
                                    }
                                ].map((tool) => (
                                    <div
                                        key={tool.type}
                                        className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col hover:shadow-xl hover:shadow-indigo-500/5 transition-all group"
                                    >
                                        <div className={`w-14 h-14 bg-${tool.color}-100 text-${tool.color}-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                            <tool.icon className="w-8 h-8" />
                                        </div>
                                        <Badge className={`bg-${tool.color}-100 text-${tool.color}-600 self-start mb-4 border-none font-black`}>
                                            {tool.type}
                                        </Badge>
                                        <h3 className="text-xl font-black text-slate-800 mb-2">{tool.title}</h3>
                                        <p className="text-slate-500 text-sm leading-relaxed flex-1 mb-8">
                                            {tool.desc}
                                        </p>
                                        <Link href={tool.route}>
                                            <Button className={`w-full bg-slate-900 hover:bg-slate-800 h-12 rounded-xl font-bold`}>
                                                Diseñar {tool.type}
                                            </Button>
                                        </Link>
                                    </div>
                                ))}
                            </div>

                            {/* Info Card */}
                            <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 flex gap-4 items-start">
                                <AlertCircle className="w-6 h-6 text-indigo-600 shrink-0" />
                                <div className="text-sm">
                                    <p className="font-bold text-indigo-900 mb-1">Recomendación Pedagógica</p>
                                    <p className="text-indigo-700 leading-relaxed">
                                        Se recomienda seguir la secuencia **BD → IT → PIC** para maximizar la retención tecnológica.
                                        Cada nivel puede contener solo una actividad principal de este tipo para no saturar al estudiante.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
