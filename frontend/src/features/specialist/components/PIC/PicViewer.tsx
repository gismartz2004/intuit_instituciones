import { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Rocket,
    CheckCircle2,
    ArrowRight,
    ArrowLeft,
    Target,
    FileText,
    Users,
    Calendar,
    Settings,
    Sparkles,
    PlayCircle,
    Award,
    Bot,
    Terminal,
    Map,
    Upload
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLocation, useRoute } from "wouter";
import specialistProfessorApi from "@/features/specialist-professor/services/specialistProfessor.api";

interface PicStep {
    id: number;
    title: string;
    description?: string;
}

const PicViewer = forwardRef(({ levelId: propLevelId, isFullscreen }: { levelId?: number, isFullscreen?: boolean }, ref) => {
    const [match, params] = useRoute("/specialist/pic/:id");
    const [, setLocation] = useLocation();

    const routeLevelId = match && params ? (params as any).id : null;
    const levelId = propLevelId || routeLevelId;

    const [currentStep, setCurrentStep] = useState(1);
    const [picTemplate, setPicTemplate] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        alcanceProyecto: "",
        objetivoPrincipal: "",
        entregables: "",
        cronograma: "",
        checklist: {
            objetivos: false,
            plan: false,
            recursos: false,
            demo: false
        }
    });

    useEffect(() => {
        if (levelId) {
            fetchPicTemplate();
        }
    }, [levelId]);

    const fetchPicTemplate = async () => {
        try {
            setLoading(true);
            const data = await specialistProfessorApi.getPicTemplate(parseInt(levelId));
            if (data) setPicTemplate(data);
        } catch (error) {
            console.error("Error fetching PIC template:", error);
        } finally {
            setLoading(false);
        }
    };

    useImperativeHandle(ref, () => ({
        goNext: () => {
            if (currentStep < 10) {
                setCurrentStep(prev => prev + 1);
                return { handled: true };
            }
            return { handled: false };
        },
        goPrev: () => {
            if (currentStep > 1) {
                setCurrentStep(prev => prev - 1);
                return { handled: true };
            }
            return { handled: false };
        },
        getCurrentStep: () => currentStep
    }));

    const steps: PicStep[] = [
        { id: 1, title: "Propósito", description: "Visión del Proyecto" },
        { id: 2, title: "Alcance", description: "Límites del Diseño" },
        { id: 3, title: "Objetivos", description: "Metas Técnicas" },
        { id: 4, title: "Entregables", description: "Productos Finales" },
        { id: 5, title: "Cronograma", description: "Plan de Trabajo" },
        { id: 6, title: "Recursos", description: "Herramientas Necesarias" },
        { id: 7, title: "Desarrollo", description: "Ejecución Técnica" },
        { id: 8, title: "Evidencia", description: "Documentación" },
        { id: 9, title: "Presentación", description: "Demo Final" },
        { id: 10, title: "Finish", description: "Proyecto Completado" }
    ];

    if (loading) return <div className="h-full flex items-center justify-center bg-slate-50 text-fuchsia-600 font-black italic animate-pulse">CARGANDO PROYECTO...</div>;

    const renderStepContent = () => {
        switch (currentStep) {
            case 1: // Propósito
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <header className="space-y-4">
                            <Badge className="bg-fuchsia-100 text-fuchsia-700 border-none px-4 py-1.5 rounded-full font-black uppercase tracking-widest text-[10px]">
                                <Rocket className="w-3 h-3 mr-2 inline" /> Proyecto PIC
                            </Badge>
                            <h1 className="text-5xl font-black italic tracking-tighter text-slate-800 uppercase leading-none">
                                {picTemplate?.nombre || "Proyecto de Innovación"}
                            </h1>
                        </header>

                        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl relative overflow-hidden group">
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-fuchsia-50 rounded-full blur-3xl group-hover:bg-fuchsia-100 transition-colors" />
                            <blockquote className="relative z-10 border-l-4 border-fuchsia-500 pl-8 m-0 italic text-2xl text-slate-600 font-medium leading-relaxed">
                                {picTemplate?.proposito || "El producto culminante donde aplicas cada bit de conocimiento técnica en una solución real, disruptiva y funcional."}
                            </blockquote>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
                            <div className="p-8 bg-slate-900 rounded-[2rem] text-white space-y-4">
                                <div className="w-12 h-12 bg-fuchsia-500 rounded-2xl flex items-center justify-center">
                                    <Sparkles className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-xl font-black uppercase italic tracking-tight">Creatividad Técnica</h3>
                                <p className="text-slate-400 font-medium">No solo es código, es ingeniería aplicada a resolver un problema mediante la innovación.</p>
                            </div>
                            <div className="p-8 bg-fuchsia-600 rounded-[2rem] text-white space-y-4 shadow-xl shadow-fuchsia-200">
                                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                                    <Map className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-xl font-black uppercase italic tracking-tight">Hoja de Ruta</h3>
                                <p className="text-fuchsia-100 font-medium">Define los hitos, gestiona tus recursos y entrega una solución de alto impacto profesional.</p>
                            </div>
                        </div>
                    </div>
                );

            case 2: // Alcance
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
                        <header className="space-y-2">
                            <Badge className="bg-amber-100 text-amber-700 border-none px-4 py-1.5 rounded-full font-black uppercase tracking-widest text-[10px]">
                                Definición de Límites
                            </Badge>
                            <h1 className="text-5xl font-black italic tracking-tighter text-slate-800 uppercase leading-none">
                                Alcance del Proyecto
                            </h1>
                        </header>

                        <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-10">
                            <div className="prose prose-slate">
                                <p className="text-xl text-slate-500 font-medium italic">"{picTemplate?.alcance || "Describe los límites de tu solución para asegurar que el proyecto sea viable en el tiempo asignado."}"</p>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic pl-1">Documento de Alcance</label>
                                <textarea
                                    value={formData.alcanceProyecto}
                                    onChange={(e) => setFormData({ ...formData, alcanceProyecto: e.target.value })}
                                    placeholder="Ej: El sistema gestionará inventarios pero no incluirá pagos externos..."
                                    className="bg-slate-50 border border-slate-100 rounded-2xl px-8 py-6 text-slate-700 font-medium focus:outline-none focus:border-fuchsia-500 focus:ring-4 focus:ring-fuchsia-100 transition-all w-full min-h-[250px] resize-none hover:bg-white"
                                />
                            </div>
                        </div>
                    </div>
                );

            case 3: // Objetivos - Metas Técnicas
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <header className="space-y-2">
                            <Badge className="bg-indigo-100 text-indigo-700 border-none px-4 py-1.5 rounded-full font-black uppercase tracking-widest text-[10px]">
                                Roadmap
                            </Badge>
                            <h1 className="text-5xl font-black italic tracking-tighter text-slate-800 uppercase leading-none">
                                Objetivos SMART
                            </h1>
                        </header>

                        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-slate-600 font-medium">
                                <div className="space-y-4">
                                    <h3 className="text-xl font-black italic text-slate-800 uppercase">General</h3>
                                    <p className="p-6 bg-slate-50 rounded-2xl border border-slate-100">{picTemplate?.objetivoGeneral || "Cargando objetivo general..."}</p>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-xl font-black italic text-slate-800 uppercase">Específicos</h3>
                                    <div className="space-y-3">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="flex items-center gap-3 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
                                                <Target className="w-4 h-4 text-indigo-500" />
                                                <span className="text-sm">Objetivo técnico {i}: Verificable y directo.</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 4: // Entregables - Productos Finales
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <header className="space-y-2">
                            <Badge className="bg-emerald-100 text-emerald-700 border-none px-4 py-1.5 rounded-full font-black uppercase tracking-widest text-[10px]">
                                Artifacts
                            </Badge>
                            <h1 className="text-5xl font-black italic tracking-tighter text-slate-800 uppercase leading-none">
                                Entregables Clave
                            </h1>
                        </header>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { title: "Código Fuente", icon: <Terminal className="w-6 h-6" />, desc: "Repositorio Git con el código funcional." },
                                { title: "Documentación", icon: <FileText className="w-6 h-6" />, desc: "Manual técnico y de usuario final." },
                                { title: "Demo Video", icon: <PlayCircle className="w-6 h-6" />, desc: "Demostración visual de 3 minutos." }
                            ].map((item, i) => (
                                <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-lg hover:border-fuchsia-200 transition-all group">
                                    <div className="w-12 h-12 bg-slate-50 text-slate-400 group-hover:bg-fuchsia-50 group-hover:text-fuchsia-500 rounded-xl flex items-center justify-center mb-6 transition-colors">
                                        {item.icon}
                                    </div>
                                    <h3 className="text-lg font-black italic uppercase text-slate-800 mb-2">{item.title}</h3>
                                    <p className="text-sm text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 5: // Cronograma - Plan de Trabajo
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <header className="space-y-2">
                            <Badge className="bg-slate-900 text-white border-none px-4 py-1.5 rounded-full font-black uppercase tracking-widest text-[10px]">
                                PMO
                            </Badge>
                            <h1 className="text-5xl font-black italic tracking-tighter text-slate-800 uppercase leading-none">
                                Plan de Trabajo
                            </h1>
                        </header>

                        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
                            <div className="space-y-4">
                                {[
                                    { week: "W1", task: "Investigación y Diseño", status: "Done" },
                                    { week: "W2", task: "Desarrollo del Core", status: "In Progress" },
                                    { week: "W3", task: "Testing y Refactor", status: "Upcoming" },
                                    { week: "W4", task: "Entrega Final", status: "Upcoming" }
                                ].map((step, i) => (
                                    <div key={i} className="flex items-center gap-6 p-6 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 rounded-2xl transition-colors">
                                        <span className="text-xl font-black italic text-fuchsia-500 w-12">{step.week}</span>
                                        <div className="flex-1">
                                            <p className="font-bold text-slate-800 uppercase text-sm tracking-tight">{step.task}</p>
                                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{step.status}</p>
                                        </div>
                                        <div className={cn(
                                            "w-3 h-3 rounded-full",
                                            step.status === "Done" ? "bg-emerald-500" : step.status === "In Progress" ? "bg-amber-500 animate-pulse" : "bg-slate-200"
                                        )} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case 6: // Recursos - Herramientas Necesarias
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <header className="space-y-2">
                            <Badge className="bg-indigo-100 text-indigo-700 border-none px-4 py-1.5 rounded-full font-black uppercase tracking-widest text-[10px]">
                                Stack
                            </Badge>
                            <h1 className="text-5xl font-black italic tracking-tighter text-slate-800 uppercase leading-none">
                                Herramientas & Stack
                            </h1>
                        </header>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-6">
                                <h3 className="text-2xl font-black italic text-slate-800 uppercase tracking-tighter">Entorno</h3>
                                <div className="flex flex-wrap gap-3">
                                    {["VS Code", "Node.js", "Docker", "Git", "Postman"].map(tool => (
                                        <Badge key={tool} className="bg-slate-100 text-slate-600 border-none px-4 py-2 rounded-xl font-bold uppercase text-[10px] tracking-widest">
                                            {tool}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-fuchsia-600 p-10 rounded-[2.5rem] text-white flex flex-col justify-center shadow-lg shadow-fuchsia-200">
                                <p className="text-3xl font-black italic uppercase leading-none mb-4">Recursos 24/7</p>
                                <p className="text-fuchsia-100 font-medium">Tienes acceso a la base de conocimientos y mentoría técnica durante todo el proceso.</p>
                            </div>
                        </div>
                    </div>
                );

            case 7: // Desarrollo - Ejecución Técnica
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <header className="space-y-2">
                            <Badge className="bg-red-100 text-red-700 border-none px-4 py-1.5 rounded-full font-black uppercase tracking-widest text-[10px]">
                                Execution
                            </Badge>
                            <h1 className="text-5xl font-black italic tracking-tighter text-slate-800 uppercase leading-none">
                                Fase de Desarrollo
                            </h1>
                        </header>

                        <div className="bg-slate-900 p-12 rounded-[2.5rem] border border-slate-800 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/10 blur-[100px]" />
                            <div className="relative z-10 space-y-6">
                                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-fuchsia-400">
                                    <Settings className="w-8 h-8 animate-spin-slow" />
                                </div>
                                <h3 className="text-3xl font-black italic text-white uppercase tracking-tighter">Iniciando el Sprint</h3>
                                <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-2xl">
                                    En esta etapa, el enfoque debe estar en la funcionalidad "Core". No te pierdas en detalles estéticos antes de tener la lógica de negocio robusta.
                                </p>
                                <div className="pt-6 flex gap-4">
                                    <Button className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-black italic text-sm px-8 rounded-xl h-14">
                                        REPORTAR AVANCE
                                    </Button>
                                    <Button variant="outline" className="border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white font-black italic text-sm px-8 rounded-xl h-14">
                                        SOLICITAR FEEDBACK
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 8: // Evidencia - Documentación
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <header className="space-y-2">
                            <Badge className="bg-violet-100 text-violet-700 border-none px-4 py-1.5 rounded-full font-black uppercase tracking-widest text-[10px]">
                                Delivery
                            </Badge>
                            <h1 className="text-5xl font-black italic tracking-tighter text-slate-800 uppercase leading-none">
                                Carga de Evidencia
                            </h1>
                        </header>

                        <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-8 text-center">
                            <div className="w-24 h-24 bg-violet-50 rounded-[2rem] flex items-center justify-center mx-auto mb-4">
                                <Upload className="w-10 h-10 text-violet-600" />
                            </div>
                            <div className="max-w-2xl mx-auto space-y-4">
                                <h3 className="text-3xl font-black italic text-slate-800 uppercase leading-tight">Misión Cumplida</h3>
                                <p className="text-lg text-slate-500 font-medium">Sube el documento final de tu proyecto PIC (PDF o ZIP).</p>
                            </div>
                            <div className="p-12 border-4 border-dashed border-slate-100 rounded-[3rem] bg-slate-50 relative group transition-all hover:bg-white hover:border-violet-200">
                                <Button className="bg-violet-600 hover:bg-violet-700 text-white rounded-2xl font-black italic h-16 px-12 text-xl shadow-xl shadow-violet-100">
                                    SELECCIONAR ARCHIVO
                                </Button>
                                <p className="mt-6 text-xs text-slate-400 font-black uppercase tracking-widest font-sans">Tamaño máximo: 50MB</p>
                            </div>
                        </div>
                    </div>
                );

            case 9: // Presentación - Demo Final
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <header className="space-y-2">
                            <Badge className="bg-emerald-100 text-emerald-700 border-none px-4 py-1.5 rounded-full font-black uppercase tracking-widest text-[10px]">
                                Demo Day
                            </Badge>
                            <h1 className="text-5xl font-black italic tracking-tighter text-slate-800 uppercase leading-none">
                                Presentación Final
                            </h1>
                        </header>

                        <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 shadow-xl">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-8">
                                    <h3 className="text-3xl font-black italic text-slate-800 uppercase leading-tight">Pitch de Proyecto</h3>
                                    <div className="space-y-6">
                                        {[
                                            { q: "¿Qué problema resuelves?", a: "Situación real del entorno." },
                                            { q: "¿Cómo lo resuelves?", a: "Arquitectura de la solución." },
                                            { q: "¿Qué tecnología usaste?", a: "Justificación del stack." }
                                        ].map((item, i) => (
                                            <div key={i} className="space-y-2">
                                                <p className="text-xs font-black text-fuchsia-600 uppercase tracking-widest">{item.q}</p>
                                                <p className="text-slate-600 font-bold italic border-l-2 border-slate-100 pl-4">{item.a}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white space-y-6 flex flex-col justify-between">
                                    <div className="space-y-4">
                                        <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center">
                                            <Users className="w-6 h-6" />
                                        </div>
                                        <h4 className="text-xl font-black uppercase italic tracking-tight">Evaluación 360</h4>
                                        <p className="text-slate-400 text-sm leading-relaxed">
                                            Tu presentación será evaluada por el tribunal técnico basándose en originalidad, ejecución y escalabilidad.
                                        </p>
                                    </div>
                                    <Button className="bg-white text-slate-900 hover:bg-slate-100 font-black italic rounded-xl h-14">
                                        PROGRAMAR DEMO
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 10: // Finish
                return (
                    <div className="flex flex-col items-center justify-center text-center space-y-8 animate-in zoom-in duration-700 h-full py-12">
                        <div className="relative">
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 4, repeat: Infinity }}
                                className="absolute inset-0 bg-fuchsia-200 blur-3xl opacity-50"
                            />
                            <div className="relative w-48 h-48 bg-white rounded-[3rem] border-4 border-fuchsia-100 shadow-2xl flex items-center justify-center mx-auto">
                                <Award className="w-24 h-24 text-fuchsia-500" />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h1 className="text-7xl font-black italic tracking-tighter text-slate-800 uppercase leading-none">
                                PROYECTO <span className="text-fuchsia-600">CULMINADO</span>
                            </h1>
                            <p className="text-2xl text-slate-400 max-w-md mx-auto font-black uppercase italic tracking-widest">Insignia de Innovación</p>
                        </div>

                        <div className="max-w-xl bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl">
                            <p className="text-xl text-slate-600 font-medium leading-relaxed italic">
                                "Has demostrado excelencia técnica y visión innovadora. Este proyecto es una prueba tangible de tu crecimiento como especialista."
                            </p>
                        </div>

                        <Button
                            className="h-20 px-12 bg-fuchsia-600 hover:bg-fuchsia-700 text-white rounded-3xl font-black italic text-2xl gap-4 shadow-2xl shadow-fuchsia-200 transition-all hover:scale-105"
                            onClick={() => setLocation('/dashboard')}
                        >
                            ENTRAR AL SALÓN DE LA FAMA <ArrowRight className="w-8 h-8" />
                        </Button>
                    </div>
                );

            default:
                return (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                        <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center">
                            <Settings className="w-10 h-10 text-slate-300 animate-spin-slow" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-800 uppercase italic">PIC - Fase {currentStep}</h3>
                            <p className="text-slate-400 font-medium">Arquitectura de proyecto en construcción...</p>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className={cn(
            "w-full bg-slate-50 flex overflow-hidden transition-all duration-500 font-sans",
            isFullscreen
                ? "h-screen rounded-0 border-0"
                : "h-[calc(100vh-140px)] rounded-[2.5rem] border border-slate-200 shadow-sm"
        )}>
            {/* MAIN CONTENT AREA - 75% */}
            <div className="flex-[3] bg-white h-full overflow-y-auto custom-scrollbar relative">
                <div className={cn(
                    "mx-auto min-h-full transition-all duration-500",
                    isFullscreen ? "max-w-none p-8 md:p-12" : "p-12 md:p-20 max-w-5xl"
                )}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {renderStepContent()}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Breadcrumb */}
                <div className="absolute top-8 left-8 flex items-center gap-2">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Proyecto PIC</span>
                    <span className="text-slate-200">/</span>
                    <span className="text-[10px] font-black text-fuchsia-500 uppercase tracking-widest">Hito {currentStep}</span>
                </div>
            </div>

            {/* SIDEBAR PLAYLIST - 25% */}
            <div className="hidden lg:flex flex-1 flex-col bg-slate-50 border-l border-slate-200 h-full overflow-hidden">
                <div className="p-8 border-b border-slate-200 bg-white">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Pasos del Proyecto</h3>
                    <div className="flex items-center justify-between">
                        <p className="text-lg font-black italic text-slate-800 tracking-tight">Evolución PIC</p>
                        <Badge className="bg-fuchsia-600 text-[10px] px-2">{currentStep}/10</Badge>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                    {steps.map((step) => {
                        const isActive = currentStep === step.id;
                        const isCompleted = currentStep > step.id;
                        return (
                            <button
                                key={step.id}
                                onClick={() => setCurrentStep(step.id)}
                                className={cn(
                                    "w-full flex items-center gap-4 p-4 rounded-2xl transition-all group relative",
                                    isActive
                                        ? "bg-white shadow-lg shadow-slate-200/50 border border-slate-200"
                                        : "hover:bg-slate-100 border border-transparent"
                                )}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="sidebarHighlightPIC"
                                        className="absolute left-1 w-1 h-8 bg-fuchsia-600 rounded-full"
                                    />
                                )}

                                <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105",
                                    isActive ? "bg-fuchsia-600 text-white shadow-lg shadow-fuchsia-200" :
                                        isCompleted ? "bg-emerald-100 text-emerald-600" : "bg-slate-200 text-slate-400"
                                )}>
                                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : isActive ? <PlayCircle className="w-5 h-5 animate-pulse" /> : <span className="text-xs font-black">{step.id}</span>}
                                </div>

                                <div className="text-left overflow-hidden">
                                    <p className={cn(
                                        "text-xs font-black tracking-tight truncate",
                                        isActive ? "text-slate-900" : "text-slate-500"
                                    )}>
                                        {step.title}
                                    </p>
                                    <p className="text-[10px] text-slate-400 font-medium truncate uppercase tracking-widest">{step.description}</p>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* PIC Motivation Footer */}
                <div className="p-6 bg-white border-t border-slate-200">
                    <div className="p-4 bg-fuchsia-50 rounded-2xl flex items-start gap-4">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                            <Bot className="w-4 h-4 text-fuchsia-600" />
                        </div>
                        <p className="text-[10px] font-bold text-fuchsia-700 leading-tight">
                            "Innovación PIC: Este documento es el plano de tu obra maestra tecnológica."
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default PicViewer;
