import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GraduationCap, Users, BookOpen, Clock, PlusCircle, ArrowRight, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import specialistProfessorApi, { SpecialistModule } from "../services/specialistProfessor.api";

interface SpecialistProfessorDashboardProps {
    user: {
        name: string;
        id: string;
    };
}

export default function SpecialistProfessorDashboard({ user }: SpecialistProfessorDashboardProps) {
    const [modules, setModules] = useState<SpecialistModule[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [newModuleName, setNewModuleName] = useState("");
    const [newModuleDuration, setNewModuleDuration] = useState(30);
    const [newModuleSpecialization, setNewModuleSpecialization] = useState<string>("cs");
    const [, setLocation] = useLocation();

    useEffect(() => {
        fetchModules();
    }, []);

    const fetchModules = async () => {
        try {
            setLoading(true);
            const data = await specialistProfessorApi.getModules(parseInt(user.id));
            setModules(data);
        } catch (error) {
            console.error("Error fetching modules", error);
            toast({ title: "Error", description: "No se pudieron cargar los módulos", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleCreateModule = async () => {
        if (!newModuleName.trim()) {
            toast({ title: "Error", description: "El nombre del módulo es requerido", variant: "destructive" });
            return;
        }

        try {
            await specialistProfessorApi.createModule({
                nombreModulo: newModuleName,
                duracionDias: newModuleDuration,
                profesorId: parseInt(user.id),
                especializacion: newModuleSpecialization
            });
            toast({ title: "Éxito", description: "Módulo creado correctamente" });
            setShowCreateDialog(false);
            setNewModuleName("");
            fetchModules();
        } catch (error) {
            toast({ title: "Error", description: "No se pudo crear el módulo", variant: "destructive" });
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <header className="flex justify-between items-end mb-12">
                <div>
                    <Badge className="bg-indigo-600 mb-2">MODO ESPECIALISTA</Badge>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Panel de Docente Especializado</h1>
                    <p className="text-slate-500 mt-2">Gestiona el contenido de alta complejidad tecnológica para tus estudiantes.</p>
                </div>
                <div className="flex gap-4">
                    <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                        <DialogTrigger asChild>
                            <Button className="bg-slate-900 hover:bg-slate-800 h-12 px-6 rounded-xl font-bold gap-2">
                                <PlusCircle className="w-5 h-5" /> Crear Módulo
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Nuevo Módulo de Especialización</DialogTitle>
                                <DialogDescription>
                                    Crea un nuevo módulo para organizar tus niveles y actividades de especialización.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Nombre del Módulo</Label>
                                    <Input
                                        placeholder="Ej: Arquitectura de Microprocesadores"
                                        value={newModuleName}
                                        onChange={(e) => setNewModuleName(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Duración Estimada (Días)</Label>
                                    <Input
                                        type="number"
                                        value={isNaN(newModuleDuration) ? "" : newModuleDuration}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value);
                                            setNewModuleDuration(isNaN(val) ? 0 : val);
                                        }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Especialización Area</Label>
                                    <Select value={newModuleSpecialization} onValueChange={setNewModuleSpecialization}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona área" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="cs">Ciencias Computacionales</SelectItem>
                                            <SelectItem value="mechatronics">Mecatrónica</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleCreateModule} className="bg-indigo-600 gap-2">
                                    <Save className="w-4 h-4" /> Guardar Módulo
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>             
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Quick Stats */}
                {[
                    { label: 'Especialistas', value: '12', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
                    { label: 'Módulos Activos', value: modules.length.toString(), icon: BookOpen, color: 'text-violet-600', bg: 'bg-violet-100' },
                    { label: 'Proyectos Entregados', value: '45', icon: GraduationCap, color: 'text-emerald-600', bg: 'bg-emerald-100' },
                    { label: 'Horas de Mentoría', value: '120h', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                            <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                        </div>
                    </div>
                ))}

                {/* Module Management Area */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black text-slate-800">Tus Módulos de Especialización</h2>
                        <button className="text-indigo-600 font-bold text-sm hover:underline">Ver todos</button>
                    </div>

                    <div className="space-y-4">
                        {loading ? (
                            <p className="text-slate-400">Cargando módulos...</p>
                        ) : modules.length === 0 ? (
                            <div className="bg-white p-12 rounded-3xl border-2 border-dashed border-slate-200 text-center">
                                <p className="text-slate-400 font-bold">No tienes módulos creados aún</p>
                                <Button variant="link" onClick={() => setShowCreateDialog(true)}>Empieza creando uno ahora</Button>
                            </div>
                        ) : modules.map(mod => (
                            <motion.div
                                key={mod.id}
                                whileHover={{ y: -2 }}
                                className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between"
                            >
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black">
                                        {mod.nombreModulo.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-slate-800">{mod.nombreModulo}</h3>
                                        <div className="flex items-center gap-4 mt-1 text-sm text-slate-400 font-medium">
                                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {mod.duracionDias} días</span>
                                            <span className="flex items-center gap-1"><Badge variant="outline" className="text-[10px] uppercase">Specialization</Badge></span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-8">
                                    <Link href={`/specialist-professor/module/${mod.id}`}>
                                        <Button variant="outline" className="rounded-xl font-bold gap-2">
                                            Gestionar Contenido <ArrowRight className="w-4 h-4" />
                                        </Button>
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Sidebar Area */}
                <div className="space-y-6">
                    <h2 className="text-xl font-black text-slate-800">Recursos Recientes</h2>
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
                        {[
                            'Manual_ESP32_Advanced.pdf',
                            'Firmware_V1.2_Source.zip',
                            'Schematics_Logic_Shield.png'
                        ].map((file, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group">
                                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                                    <BookOpen className="w-5 h-5" />
                                </div>
                                <span className="text-sm font-bold text-slate-600 truncate">{file}</span>
                            </div>
                        ))}
                        <Button variant="ghost" className="w-full text-indigo-600 font-bold mt-4">Subir más archivos</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
