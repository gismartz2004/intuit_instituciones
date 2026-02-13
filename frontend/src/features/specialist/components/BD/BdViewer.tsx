import { useState, useEffect, useImperativeHandle, forwardRef, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Terminal,
    Cpu,
    Zap,
    BookOpen,
    Code2,
    CheckCircle2,
    ArrowRight,
    ArrowLeft,
    Rocket,
    Layout,
    Layers,
    FileText,
    Settings,
    Shield,
    Bot,
    Sparkles,
    MousePointer2,
    Lightbulb,
    Target,
    ClipboardCheck,
    Award,
    Eye,
    MessageSquare,
    Share2,
    Upload,
    ChevronRight,
    PlayCircle,
    Menu,
    AlertCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRoute } from "wouter";
import specialistProfessorApi from "@/features/specialist-professor/services/specialistProfessor.api";
import SpecialistGuide from "../SpecialistGuide";

interface BdStep {
    id: number;
    title: string;
    description?: string;
}

const BdViewer = forwardRef(({ levelId: propLevelId, isFullscreen }: { levelId?: number, isFullscreen?: boolean }, ref) => {
    const [match, params] = useRoute("/specialist/bd/:id");
    const [currentStep, setCurrentStep] = useState(1);
    const [bdTemplate, setBdTemplate] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);
    const [isGuideVisible, setIsGuideVisible] = useState(true);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = 0;
        }
    }, [currentStep]);

    const routeLevelId = match && params ? (params as any).id : null;
    const levelId = propLevelId || routeLevelId;

    const [formData, setFormData] = useState({
        problema: "",
        nombreSistema: "",
        entradas: "",
        procesos: "",
        salidas: "",
        checklist: {
            real: false,
            entradas: false,
            procesos: false,
            salidas: false,
            entendible: false
        }
    });

    useImperativeHandle(ref, () => ({
        goNext: () => {
            if (currentStep < 12) {
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

    useEffect(() => {
        if (levelId) {
            fetchBdTemplate();
        }
    }, [levelId]);

    const fetchBdTemplate = async () => {
        try {
            setLoading(true);
            const data = await specialistProfessorApi.getBdTemplate(parseInt(levelId));
            if (data) setBdTemplate(data);
        } catch (error) {
            console.error("Error fetching BD template:", error);
        } finally {
            setLoading(false);
        }
    };

    const steps: BdStep[] = [
        { id: 1, title: "Propósito", description: "Misión del Bloque" },
        { id: 2, title: "Contenido", description: "¿Qué es un Sistema?" },
        { id: 3, title: "Diagramación", description: "Reglas de Diseño" },
        { id: 4, title: "Ejemplo", description: "Caso Real" },
        { id: 5, title: "Activador", description: "Desafío Mental" },
        { id: 6, title: "Núcleo", description: "Tu Propuesta" },
        { id: 7, title: "Esquema", description: "Dibujo Técnico" },
        { id: 8, title: "Evidencia", description: "Carga de Datos" },
        { id: 9, title: "Review", description: "Checklist" },
        { id: 10, title: "Learning", description: "Resultados" },
        { id: 11, title: "Skills", description: "Competencias" },
        { id: 12, title: "Finish", description: "Próximos Pasos" }
    ];

    if (loading) return <div className="h-full flex items-center justify-center bg-slate-50 text-violet-600 font-black italic animate-pulse">CARGANDO BLOQUE...</div>;

    const renderStepContent = () => {
        switch (currentStep) {
            case 1: // Propósito
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <header className="space-y-4">
                            <Badge className="bg-violet-100 text-violet-700 hover:bg-violet-100 border-none px-4 py-1.5 rounded-full font-black uppercase tracking-widest text-[10px]">
                                <Rocket className="w-3 h-3 mr-2 inline" /> Introducción
                            </Badge>
                            <h1 className="text-5xl font-black italic tracking-tighter text-slate-800 uppercase leading-none">
                                {bdTemplate?.nombreModulo || "Propósito del Bloque"}
                            </h1>
                        </header>

                        <div className="prose prose-slate max-w-none">
                            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden group">
                                <div className="absolute -top-10 -right-10 w-40 h-40 bg-violet-50 rounded-full blur-3xl group-hover:bg-violet-100 transition-colors" />
                                <blockquote className="relative z-10 border-l-4 border-violet-500 pl-8 m-0 italic text-2xl text-slate-600 font-medium leading-relaxed">
                                    {bdTemplate?.proposito || "Cargando propósito..."}
                                </blockquote>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
                            <div className="p-8 bg-slate-900 rounded-[2rem] text-white space-y-4">
                                <div className="w-12 h-12 bg-violet-500 rounded-2xl flex items-center justify-center">
                                    <Target className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-xl font-black uppercase italic tracking-tight">Objetivo Final</h3>
                                <p className="text-slate-400 font-medium">Al terminar este bloque, habrás diseñado tu primer esquema de sistema completamente funcional.</p>
                            </div>
                            <div className="p-8 bg-violet-600 rounded-[2rem] text-white space-y-4 shadow-xl shadow-violet-200">
                                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                                    <Zap className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-xl font-black uppercase italic tracking-tight">Resultados</h3>
                                <p className="text-violet-100 font-medium">Obtendrás insignias técnicas y XP por cada fase que completes con éxito.</p>
                            </div>
                        </div>
                    </div>
                );

            case 2: // Contenido - ¿Qué es un Sistema?
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <header className="space-y-2">
                            <Badge className="bg-amber-100 text-amber-700 border-none px-4 py-1.5 rounded-full font-black uppercase tracking-widest text-[10px]">
                                Concepto Clave
                            </Badge>
                            <h1 className="text-5xl font-black italic tracking-tighter text-slate-800 uppercase leading-none">
                                ¿Qué es un Sistema?
                            </h1>
                        </header>

                        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl">
                            <p className="text-xl text-slate-600 leading-relaxed font-medium mb-10">
                                {bdTemplate?.definicionSistema || "Cargando definición..."}
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {[
                                    { title: "Entradas", icon: <Layers className="w-6 h-6" />, color: "bg-indigo-50 text-indigo-600", desc: bdTemplate?.componentes?.entradas },
                                    { title: "Procesos", icon: <Cpu className="w-6 h-6" />, color: "bg-amber-50 text-amber-600", desc: bdTemplate?.componentes?.procesos },
                                    { title: "Salidas", icon: <Target className="w-6 h-6" />, color: "bg-emerald-50 text-emerald-600", desc: bdTemplate?.componentes?.salidas }
                                ].map((item, i) => (
                                    <div key={i} className="p-8 border border-slate-100 rounded-3xl hover:border-violet-200 hover:shadow-lg transition-all text-center space-y-4">
                                        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mx-auto", item.color)}>
                                            {item.icon}
                                        </div>
                                        <h3 className="font-black uppercase tracking-wider text-slate-800">{item.title}</h3>
                                        <p className="text-sm text-slate-500 font-medium leading-relaxed">{item.desc || "Cargando..."}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case 3: // Diagramación - Reglas de Diseño
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <header className="space-y-2">
                            <Badge className="bg-indigo-100 text-indigo-700 border-none px-4 py-1.5 rounded-full font-black uppercase tracking-widest text-[10px]">
                                Estándar Técnico
                            </Badge>
                            <h1 className="text-5xl font-black italic tracking-tighter text-slate-800 uppercase leading-none">
                                Reglas de Diseño
                            </h1>
                        </header>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-6">
                                <h3 className="text-2xl font-black italic text-slate-800 uppercase tracking-tighter">Cómo diagramar</h3>
                                <ul className="space-y-4">
                                    {[
                                        "Usa rectángulos para procesos y óvalos para entradas/salidas.",
                                        "Las flechas deben indicar el flujo lógico del dato.",
                                        "Evita cruzar líneas para mantener la claridad.",
                                        "Cada elemento debe tener un nombre corto y descriptivo."
                                    ].map((rule, i) => (
                                        <li key={i} className="flex items-start gap-4 text-slate-600 font-medium">
                                            <div className="mt-1.5 w-2 h-2 rounded-full bg-violet-500 shrink-0" />
                                            {rule}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="bg-slate-900 p-10 rounded-[2.5rem] text-white flex flex-col justify-center">
                                <div className="space-y-4 text-center">
                                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <Eye className="w-8 h-8 text-violet-400" />
                                    </div>
                                    <p className="text-violet-200 font-black uppercase tracking-widest text-xs">Visualización</p>
                                    <p className="text-slate-400 text-sm leading-relaxed">
                                        Un buen diagrama habla por sí solo. El 80% de los errores de software se previenen con un diseño sistémico claro.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 4: // Ejemplo Modelo - EL DIAGRAMA INTERACTIVO
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <header className="space-y-2">
                            <Badge className="bg-blue-100 text-blue-700 border-none px-4 py-1.5 rounded-full font-black uppercase tracking-widest text-[10px]">
                                Caso Real
                            </Badge>
                            <h1 className="text-5xl font-black italic tracking-tighter text-slate-800 uppercase leading-none">
                                Ejemplo Modelo
                            </h1>
                        </header>

                        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-8">
                            <div className="flex items-center gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-violet-600 font-black italic">!</div>
                                <p className="text-slate-600 font-bold italic text-lg">Sistema: {bdTemplate?.ejemplo?.nombre || "Cargando..."}</p>
                            </div>

                            <div className="bg-slate-900 p-12 rounded-[2.5rem] relative overflow-hidden">
                                {/* Background decoration */}
                                <div className="absolute inset-0 opacity-5 pointer-events-none">
                                    <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:30px_30px]"></div>
                                </div>

                                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4">
                                    {/* Entradas */}
                                    <div className="flex-1 w-full max-w-[200px] text-center space-y-3">
                                        <div className="w-16 h-16 bg-indigo-500/20 border border-indigo-500/30 rounded-3xl flex items-center justify-center text-indigo-400 mx-auto shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                                            <Layers className="w-8 h-8" />
                                        </div>
                                        <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                                            <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">Entradas</p>
                                            <p className="text-white text-xs font-bold">{bdTemplate?.ejemplo?.entradas || "..."}</p>
                                        </div>
                                    </div>

                                    <ChevronRight className="w-8 h-8 text-slate-700 rotate-90 md:rotate-0" />

                                    {/* Procesos */}
                                    <div className="flex-1 w-full max-w-[200px] text-center space-y-3">
                                        <div className="w-16 h-16 bg-amber-500/20 border border-amber-500/30 rounded-3xl flex items-center justify-center text-amber-400 mx-auto shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                                            <Cpu className="w-8 h-8" />
                                        </div>
                                        <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                                            <p className="text-[9px] font-black text-amber-400 uppercase tracking-widest mb-1">Procesos</p>
                                            <p className="text-white text-xs font-bold">{bdTemplate?.ejemplo?.procesos || "..."}</p>
                                        </div>
                                    </div>

                                    <ChevronRight className="w-8 h-8 text-slate-700 rotate-90 md:rotate-0" />

                                    {/* Salidas */}
                                    <div className="flex-1 w-full max-w-[200px] text-center space-y-3">
                                        <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/30 rounded-3xl flex items-center justify-center text-emerald-400 mx-auto shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                                            <Target className="w-8 h-8" />
                                        </div>
                                        <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                                            <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1">Salidas</p>
                                            <p className="text-white text-xs font-bold">{bdTemplate?.ejemplo?.salidas || "..."}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 5: // Activador - Desafío Mental
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <header className="space-y-2">
                            <Badge className="bg-fuchsia-100 text-fuchsia-700 border-none px-4 py-1.5 rounded-full font-black uppercase tracking-widest text-[10px]">
                                Calentamiento
                            </Badge>
                            <h1 className="text-5xl font-black italic tracking-tighter text-slate-800 uppercase leading-none">
                                Desafío Mental
                            </h1>
                        </header>

                        <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 shadow-xl text-center space-y-10">
                            <div className="w-20 h-20 bg-fuchsia-50 rounded-[2rem] flex items-center justify-center mx-auto">
                                <Lightbulb className="w-10 h-10 text-fuchsia-600 animate-pulse" />
                            </div>
                            <div className="max-w-2xl mx-auto">
                                <p className="text-2xl font-black italic text-slate-800 tracking-tight leading-tight uppercase">
                                    ¿Qué pasaría si una de tus entradas fallara o fuera incorrecta?
                                </p>
                                <p className="mt-6 text-lg text-slate-500 font-medium">
                                    Piensa en la cascada de efectos: ¿Cómo afectaría el proceso final y qué tipo de salida errónea obtendría el usuario?
                                </p>
                            </div>
                            <div className="p-8 bg-slate-50 rounded-3xl inline-block border border-slate-100">
                                <p className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Prepárate para el Reto Nucleo</p>
                            </div>
                        </div>
                    </div>
                );

            case 6: // Núcleo - Tu Propuesta (EL RETO)
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
                        <header className="space-y-2">
                            <Badge className="bg-red-100 text-red-700 border-none px-4 py-1.5 rounded-full font-black uppercase tracking-widest text-[10px]">
                                Tu Misión
                            </Badge>
                            <h1 className="text-5xl font-black italic tracking-tighter text-slate-800 uppercase leading-none">
                                Define tu Sistema
                            </h1>
                        </header>

                        <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-10">
                            <div className="prose prose-slate">
                                <p className="text-xl text-slate-500 font-medium italic">"{bdTemplate?.tituloReto || "Identifica un problema real de tu entorno y define qué entradas, procesos y salidas tendría un sistema que lo resuelva."}"</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    {[
                                        { id: "problema", label: "Problema real a resolver", icon: <AlertCircle className="w-4 h-4" /> },
                                        { id: "nombreSistema", label: "Nombre del sistema", icon: <Settings className="w-4 h-4" /> }
                                    ].map(field => (
                                        <div key={field.id} className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                                {field.icon} {field.label}
                                            </label>
                                            <input
                                                type="text"
                                                value={(formData as any)[field.id]}
                                                onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-700 font-medium focus:ring-4 focus:ring-violet-100 focus:outline-none transition-all"
                                                placeholder="Escribe aquí..."
                                            />
                                        </div>
                                    ))}
                                </div>
                                <div className="space-y-6">
                                    {[
                                        { id: "entradas", label: "Entradas (Datos/Insumos)", color: "border-indigo-100 text-indigo-600" },
                                        { id: "procesos", label: "Procesos (Acciones)", color: "border-amber-100 text-amber-600" },
                                        { id: "salidas", label: "Salidas (Resultados)", color: "border-emerald-100 text-emerald-600" }
                                    ].map(field => (
                                        <div key={field.id} className="space-y-3">
                                            <label className={cn("text-[10px] font-black uppercase tracking-widest", field.color.split(' ')[1])}>
                                                {field.label}
                                            </label>
                                            <input
                                                type="text"
                                                value={(formData as any)[field.id]}
                                                onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                                                className={cn("w-full bg-slate-50 border rounded-2xl px-6 py-4 text-slate-700 font-medium focus:outline-none transition-all", field.color)}
                                                placeholder="Definición..."
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 7: // Esquema - Dibujo Técnico
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <header className="space-y-2">
                            <Badge className="bg-slate-900 text-white border-none px-4 py-1.5 rounded-full font-black uppercase tracking-widest text-[10px]">
                                Representación
                            </Badge>
                            <h1 className="text-5xl font-black italic tracking-tighter text-slate-800 uppercase leading-none">
                                Esquema Técnico
                            </h1>
                        </header>

                        <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-8">
                            <div className="p-10 border-4 border-dashed border-slate-100 rounded-[2rem] flex flex-col items-center justify-center text-center space-y-6 bg-slate-50/50 group hover:bg-slate-50 transition-colors">
                                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-slate-300 group-hover:text-violet-500 border border-slate-100 transition-colors">
                                    <Layout className="w-8 h-8" />
                                </div>
                                <div>
                                    <p className="text-xl font-black italic text-slate-800 uppercase tracking-tight">Carga tu Diagrama</p>
                                    <p className="text-slate-500 font-medium">Sube una captura de pantalla de tu diagrama digital o una foto de tu dibujo a mano.</p>
                                </div>
                                <Button className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-black italic gap-2 h-12 px-8">
                                    <Upload className="w-4 h-4" /> SELECCIONAR ARCHIVO
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-center gap-4">
                                    <AlertCircle className="w-5 h-5 text-amber-500" />
                                    <p className="text-xs text-amber-700 font-medium">Asegúrate de que las flechas y textos sean legibles.</p>
                                </div>
                                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-4">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                    <p className="text-xs text-emerald-700 font-medium">Formato aceptado: PNG, JPG o PDF.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 8: // Evidencia - Carga de Datos
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <header className="space-y-2">
                            <Badge className="bg-violet-100 text-violet-700 border-none px-4 py-1.5 rounded-full font-black uppercase tracking-widest text-[10px]">
                                Entregable
                            </Badge>
                            <h1 className="text-5xl font-black italic tracking-tighter text-slate-800 uppercase leading-none">
                                Carga de Evidencia
                            </h1>
                        </header>

                        <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 shadow-xl">
                            <div className="flex flex-col md:flex-row gap-12">
                                <div className="flex-1 space-y-6">
                                    <h3 className="text-2xl font-black italic text-slate-800 uppercase tracking-tighter">Documentación</h3>
                                    <p className="text-slate-500 font-medium leading-relaxed">
                                        Debes subir el archivo final que contenga el análisis completo de tu sistema. Este será revisado por tu profesor especialista.
                                    </p>
                                    <div className="space-y-4">
                                        <div className="p-6 border border-slate-100 rounded-2xl bg-slate-50 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <FileText className="w-6 h-6 text-slate-400" />
                                                <span className="text-sm font-bold text-slate-600">Esquema_Final.pdf</span>
                                            </div>
                                            <Badge className="bg-slate-200 text-slate-500 text-[10px]">PENDIENTE</Badge>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-1 bg-violet-600 rounded-[2rem] p-10 text-white space-y-6 shadow-[0_20px_40px_rgba(124,58,237,0.3)]">
                                    <Sparkles className="w-10 h-10 text-violet-200" />
                                    <h3 className="text-3xl font-black italic uppercase leading-none">Compromiso de Calidad</h3>
                                    <p className="text-violet-100/80 font-medium italic">
                                        "Al subir mi evidencia, certifico que este diseño es de mi autoría y cumple con los estándares técnicos solicitados."
                                    </p>
                                    <Button className="w-full bg-white text-violet-600 hover:bg-violet-50 rounded-2xl font-black italic h-14 text-lg">
                                        SUBIR AHORA
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 9: // Review - Checklist
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <header className="space-y-2">
                            <Badge className="bg-emerald-100 text-emerald-700 border-none px-4 py-1.5 rounded-full font-black uppercase tracking-widest text-[10px]">
                                Autoevaluación
                            </Badge>
                            <h1 className="text-5xl font-black italic tracking-tighter text-slate-800 uppercase leading-none">
                                Review Final
                            </h1>
                        </header>

                        <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 shadow-xl">
                            <h3 className="text-2xl font-black italic text-slate-800 uppercase tracking-tighter mb-8 text-center">Asegura tu Éxito</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    { id: "real", label: "El problema es de mi entorno real." },
                                    { id: "entradas", label: "Las entradas están bien definidas." },
                                    { id: "procesos", label: "Los procesos son lógicos y claros." },
                                    { id: "salidas", label: "Las salidas resuelven el problema." },
                                    { id: "entendible", label: "El diagrama es fácil de entender." }
                                ].map(item => (
                                    <button
                                        key={item.id}
                                        onClick={() => setFormData({
                                            ...formData,
                                            checklist: { ...formData.checklist, [item.id]: !(formData.checklist as any)[item.id] }
                                        })}
                                        className={cn(
                                            "flex items-center gap-4 p-6 rounded-3xl border transition-all text-left",
                                            (formData.checklist as any)[item.id]
                                                ? "bg-emerald-50 border-emerald-200 text-emerald-900 shadow-sm"
                                                : "bg-slate-50 border-slate-100 text-slate-500 hover:bg-white hover:border-violet-200"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-colors",
                                            (formData.checklist as any)[item.id] ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300"
                                        )}>
                                            {(formData.checklist as any)[item.id] && <CheckCircle2 className="w-4 h-4" />}
                                        </div>
                                        <span className="font-bold text-sm uppercase italic tracking-tight">{item.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case 10: // Learning - Resultados
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <header className="space-y-2">
                            <Badge className="bg-violet-100 text-violet-700 border-none px-4 py-1.5 rounded-full font-black uppercase tracking-widest text-[10px]">
                                Logros
                            </Badge>
                            <h1 className="text-5xl font-black italic tracking-tighter text-slate-800 uppercase leading-none">
                                Resultados de Aprendizaje
                            </h1>
                        </header>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { title: "Pensamiento Sistémico", icon: <Target className="w-8 h-8" />, progress: "100%", desc: "Capacidad de ver el todo a través de sus partes." },
                                { title: "Arquitectura Lógica", icon: <Cpu className="w-8 h-8" />, progress: "85%", desc: "Estructura de procesos automatizables." },
                                { title: "Diseño Técnico", icon: <Layout className="w-8 h-8" />, progress: "90%", desc: "Representación visual de soluciones." }
                            ].map((skill, i) => (
                                <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-4">
                                    <div className="w-14 h-14 bg-violet-50 text-violet-600 rounded-2xl flex items-center justify-center">
                                        {skill.icon}
                                    </div>
                                    <h3 className="font-black italic uppercase text-slate-800 tracking-tight">{skill.title}</h3>
                                    <p className="text-xs text-slate-500 font-medium leading-relaxed">{skill.desc}</p>
                                    <div className="pt-4">
                                        <div className="flex justify-between items-end mb-2">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nivel de Dominio</span>
                                            <span className="text-sm font-black text-violet-600 italic">{skill.progress}</span>
                                        </div>
                                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: skill.progress }}
                                                transition={{ duration: 1, delay: 0.5 }}
                                                className="h-full bg-violet-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 11: // Skills - Competencias
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <header className="space-y-2">
                            <Badge className="bg-amber-100 text-amber-700 border-none px-4 py-1.5 rounded-full font-black uppercase tracking-widest text-[10px]">
                                Perfil Profesional
                            </Badge>
                            <h1 className="text-5xl font-black italic tracking-tighter text-slate-800 uppercase leading-none" style={{ fontSize: 'min(4rem, 10vw)' }}>
                                Competencias <span className="text-amber-500">Desarrolladas</span>
                            </h1>
                        </header>

                        <div className="bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl">
                            <div className="absolute top-0 right-0 p-12 opacity-10">
                                <Award className="w-40 h-40 text-amber-500" />
                            </div>
                            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div className="space-y-8">
                                    <h3 className="text-2xl font-black italic uppercase tracking-tighter text-amber-400">Habilidades Técnicas</h3>
                                    <div className="space-y-4">
                                        {[
                                            "Análisis de Flujos de Información",
                                            "Documentación de Procesos de Software",
                                            "Validación de Requisitos Sistémicos"
                                        ].map((skill, i) => (
                                            <div key={i} className="flex items-center gap-4 group">
                                                <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                                                    <Award className="w-5 h-5" />
                                                </div>
                                                <span className="font-bold text-slate-300 italic">{skill}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-8">
                                    <h3 className="text-2xl font-black italic uppercase tracking-tighter text-indigo-400">Soft Skills</h3>
                                    <div className="space-y-4">
                                        {[
                                            "Resolución de Problemas Complejos",
                                            "Pensamiento Algorítmico",
                                            "Atención al Detalle Estructural"
                                        ].map((skill, i) => (
                                            <div key={i} className="flex items-center gap-4 group">
                                                <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                                                    <Bot className="w-5 h-5" />
                                                </div>
                                                <span className="font-bold text-slate-300 italic">{skill}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 12: // Final - Misión Cumplida
                return (
                    <div className="flex flex-col items-center justify-center text-center space-y-8 animate-in zoom-in duration-700 h-full py-12">
                        <div className="relative">
                            <motion.div
                                animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
                                transition={{ duration: 6, repeat: Infinity }}
                                className="absolute inset-0 bg-violet-200 blur-3xl opacity-30"
                            />
                            <div className="relative w-48 h-48 bg-white rounded-[3rem] border-4 border-violet-100 shadow-2xl flex items-center justify-center">
                                <Award className="w-24 h-24 text-violet-500" />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h1 className="text-7xl font-black italic tracking-tighter text-slate-800 uppercase leading-none">
                                BLOQUE <span className="text-violet-600">SUPERADO</span>
                            </h1>
                            <p className="text-2xl text-slate-400 font-black tracking-widest uppercase italic">Insignia Técnica Obtenida</p>
                        </div>

                        <div className="max-w-xl bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
                            <p className="text-xl text-slate-600 italic font-medium leading-relaxed">
                                {bdTemplate?.mensajeMotivacional || "Has demostrado una gran capacidad de análisis sistémico. Tu esquema es el primer paso para construir soluciones tecnológicas reales."}
                            </p>
                        </div>

                        <Button
                            className="h-20 px-12 bg-violet-600 hover:bg-violet-700 text-white rounded-3xl font-black italic text-2xl gap-4 shadow-2xl shadow-violet-200 transition-all hover:scale-105 active:scale-95"
                            onClick={() => window.location.href = '/dashboard'}
                        >
                            FINALIZAR BLOQUE <ArrowRight className="w-8 h-8" />
                        </Button>
                    </div>
                );

            default:
                return (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                        <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center">
                            <Layers className="w-10 h-10 text-slate-300" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-800 uppercase italic">Fase {currentStep}</h3>
                            <p className="text-slate-400 font-medium">Contenido interactivo en preparación...</p>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="relative w-full h-full">
            <div className={cn(
                "w-full bg-slate-50 flex overflow-hidden transition-all duration-500 font-sans",
                isFullscreen
                    ? "h-screen rounded-0 border-0"
                    : "h-full min-h-screen rounded-none border-0 shadow-none",
                isGuideVisible && "blur-xl scale-[0.98] pointer-events-none"
            )}>
                {/* MAIN CONTENT AREA - Dynamic Width based on sidebar state */}
                <div
                    ref={scrollContainerRef}
                    className="flex-1 h-full overflow-y-auto custom-scrollbar relative"
                >
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

                        {/* Navigation Buttons */}
                        <div className="mt-16 pt-8 border-t border-slate-100 flex items-center justify-between pb-12">
                            <Button
                                variant="ghost"
                                onClick={() => currentStep > 1 && setCurrentStep(currentStep - 1)}
                                disabled={currentStep === 1}
                                className="flex items-center gap-3 px-6 py-6 rounded-2xl text-slate-500 hover:bg-slate-50 transition-all font-black uppercase text-[10px] tracking-widest"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Regresar
                            </Button>

                            <div className="flex items-center gap-2">
                                {steps.map(s => (
                                    <div key={s.id} className={cn(
                                        "w-1.5 h-1.5 rounded-full transition-all",
                                        currentStep === s.id ? "bg-slate-800 w-6" : s.id < currentStep ? "bg-slate-300" : "bg-slate-200"
                                    )} />
                                ))}
                            </div>

                            <Button
                                onClick={() => currentStep < 12 && setCurrentStep(currentStep + 1)}
                                disabled={currentStep === 12}
                                className="bg-slate-800 hover:bg-slate-900 text-white flex items-center gap-3 px-8 py-6 rounded-2xl shadow-xl shadow-slate-200 transition-all font-black uppercase text-[10px] tracking-widest"
                            >
                                {currentStep === 12 ? "Finalizar" : "Continuar"}
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    </div>

                    {/* Breadcrumb */}
                    <div className="absolute top-8 left-8 flex items-center gap-2">
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Iteración BD</span>
                        <span className="text-slate-200">/</span>
                        <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Paso {currentStep}</span>
                    </div>
                </div>

                {/* SIDEBAR PLAYLIST - Collapsible on Hover */}
                < motion.div
                    onMouseEnter={() => setIsPlaylistOpen(true)}
                    onMouseLeave={() => setIsPlaylistOpen(false)}
                    initial={false}
                    animate={{
                        width: isPlaylistOpen ? "320px" : "64px"
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="hidden lg:flex flex-col bg-slate-50 border-l border-slate-200 h-full overflow-hidden relative z-50 shadow-xl"
                >
                    <div className={cn(
                        "p-8 border-b border-slate-200 bg-white transition-opacity duration-300",
                        isPlaylistOpen ? "opacity-100" : "opacity-0 invisible h-0 p-0"
                    )}>
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Contenido del Bloque</h3>
                        <div className="flex items-center justify-between">
                            <p className="text-lg font-black italic text-slate-800 tracking-tight">Ruta de Aprendizaje</p>
                            <Badge className="bg-slate-800 text-[10px] px-2">{currentStep}/12</Badge>
                        </div>
                    </div>

                    {/* Minimized Trigger Area - Vertical Text or Icon */}
                    {
                        !isPlaylistOpen && (
                            <div className="absolute inset-y-0 left-0 w-full flex flex-col items-center py-8 gap-8 pointer-events-none">
                                <Menu className="w-6 h-6 text-slate-400" />
                                <div className="flex flex-col gap-1 items-center">
                                    {steps.slice(0, 8).map(s => (
                                        <div key={s.id} className={cn(
                                            "w-1 h-1 rounded-full",
                                            currentStep === s.id ? "bg-slate-800 h-4" : "bg-slate-300"
                                        )} />
                                    ))}
                                </div>
                                <span className="[writing-mode:vertical-lr] text-[10px] font-black uppercase tracking-widest text-slate-400 rotate-180">
                                    Ruta de Aprendizaje
                                </span>
                            </div>
                        )
                    }

                    <div className={cn(
                        "flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar transition-opacity duration-300",
                        isPlaylistOpen ? "opacity-100" : "opacity-0 invisible"
                    )}>
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
                                            layoutId="sidebarHighlightBD"
                                            className="absolute left-1 w-1 h-8 bg-slate-800 rounded-full"
                                        />
                                    )}

                                    <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105",
                                        isActive ? "bg-slate-800 text-white shadow-lg shadow-slate-200" :
                                            isCompleted ? "bg-slate-100 text-slate-600" : "bg-slate-200 text-slate-400"
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
                                        <p className="text-[10px] text-slate-400 font-medium truncate uppercase tracking-widest">Paso {step.id}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Footer Motivation - Only visible when open */}
                    <div className={cn(
                        "p-6 bg-white border-t border-slate-200 transition-opacity duration-300",
                        isPlaylistOpen ? "opacity-100" : "opacity-0 invisible h-0 p-0"
                    )}>
                        <div className="p-4 bg-slate-50 rounded-2xl flex items-start gap-4">
                            <div className="p-2 bg-white rounded-lg shadow-sm">
                                <Bot className="w-4 h-4 text-slate-600" />
                            </div>
                            <p className="text-[10px] font-bold text-slate-700 leading-tight">
                                "Concentración total. Estás a {12 - currentStep} pasos de dominar este sistema."
                            </p>
                        </div>
                    </div>
                </motion.div>

            </div >
            <SpecialistGuide
                viewMode="bd"
                onClose={() => setIsGuideVisible(false)}
            />
        </div>
    );
});

export default BdViewer;
