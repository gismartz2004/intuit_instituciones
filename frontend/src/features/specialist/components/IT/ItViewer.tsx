import { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Target,
    CheckCircle2,
    ArrowRight,
    ArrowLeft,
    Lightbulb,
    AlertCircle,
    FileText,
    Zap,
    Settings,
    Layout,
    Globe,
    Code2,
    Database,
    ExternalLink,
    Terminal,
    Play,
    Upload,
    PlayCircle,
    Cpu,
    Sparkles,
    Award,
    Bot,
    Layers
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLocation, useRoute } from "wouter";
import specialistProfessorApi from "@/features/specialist-professor/services/specialistProfessor.api";

interface ItStep {
    id: number;
    title: string;
    description?: string;
}

const ItViewer = forwardRef(({ levelId: propLevelId, isFullscreen }: { levelId?: number, isFullscreen?: boolean }, ref) => {
    const [match, params] = useRoute("/specialist/it/:id");
    const [, setLocation] = useLocation();

    const routeLevelId = match && params ? (params as any).id : null;
    const levelId = propLevelId || routeLevelId;

    const [currentStep, setCurrentStep] = useState(1);
    const [itTemplate, setItTemplate] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        variablePrincipal: "",
        condicionRegla: "",
        decisionSistema: "",
        escenarioPrueba: "",
        checklist: {
            logica: false,
            integracion: false,
            prueba: false,
            codigo: false
        }
    });

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

    useEffect(() => {
        if (levelId) {
            fetchItTemplate();
        }
    }, [levelId]);

    const fetchItTemplate = async () => {
        try {
            setLoading(true);
            const data = await specialistProfessorApi.getItTemplate(parseInt(levelId));
            if (data) setItTemplate(data);
        } catch (error) {
            console.error("Error fetching IT template:", error);
        } finally {
            setLoading(false);
        }
    };

    const steps: ItStep[] = [
        { id: 1, title: "Propósito", description: "Misión de Integración" },
        { id: 2, title: "Insumos", description: "Requisitos Previos" },
        { id: 3, title: "Concepto", description: "Lógica de Decisión" },
        { id: 4, title: "Ejemplo", description: "Caso de Referencia" },
        { id: 5, title: "Reto", description: "Actividad de Código" },
        { id: 6, title: "Prueba", description: "Escenario de Test" },
        { id: 7, title: "Evidencia", description: "Carga de Resultados" },
        { id: 8, title: "Validación", description: "Checklist 360" },
        { id: 9, title: "Competencias", description: "Skills Logradas" },
        { id: 10, title: "Finish", description: "Iteración Completada" }
    ];

    if (loading) return <div className="h-full flex items-center justify-center bg-slate-50 text-violet-600 font-black italic animate-pulse">CARGANDO ITERACIÓN...</div>;

    const renderStepContent = () => {
        switch (currentStep) {
            case 1: // Propósito
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <header className="space-y-4">
                            <Badge className="bg-violet-100 text-violet-700 hover:bg-violet-100 border-none px-4 py-1.5 rounded-full font-black uppercase tracking-widest text-[10px]">
                                <Target className="w-3 h-3 mr-2 inline" /> Iteración IT
                            </Badge>
                            <h1 className="text-5xl font-black italic tracking-tighter text-slate-800 uppercase leading-none">
                                {itTemplate?.nombre || "Propósito de la Iteración"}
                            </h1>
                        </header>

                        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl relative overflow-hidden group">
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-violet-50 rounded-full blur-3xl group-hover:bg-violet-100 transition-colors" />
                            <blockquote className="relative z-10 border-l-4 border-violet-500 pl-8 m-0 italic text-2xl text-slate-600 font-medium leading-relaxed">
                                {itTemplate?.proposito || "Integrar los conocimientos sistémicos para que tu proyecto pueda tomar decisiones automatizadas basadas en variables reales."}
                            </blockquote>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
                            <div className="p-8 bg-slate-900 rounded-[2rem] text-white space-y-4">
                                <div className="w-12 h-12 bg-violet-500 rounded-2xl flex items-center justify-center">
                                    <Cpu className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-xl font-black uppercase italic tracking-tight">Comportamiento Dinámico</h3>
                                <p className="text-slate-400 font-medium">Pasaremos de un sistema estático a uno que reacciona a los cambios en sus entradas.</p>
                            </div>
                            <div className="p-8 bg-violet-600 rounded-[2rem] text-white space-y-4 shadow-xl shadow-violet-200">
                                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                                    <Code2 className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-xl font-black uppercase italic tracking-tight">Capa de Lógica</h3>
                                <p className="text-violet-100 font-medium">Aprenderás a implementar reglas de negocio que controlen el flujo de la información.</p>
                            </div>
                        </div>
                    </div>
                );

            case 2: // Insumos - Requisitos Previos
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <header className="space-y-2">
                            <Badge className="bg-amber-100 text-amber-700 border-none px-4 py-1.5 rounded-full font-black uppercase tracking-widest text-[10px]">
                                Preparación
                            </Badge>
                            <h1 className="text-5xl font-black italic tracking-tighter text-slate-800 uppercase leading-none">
                                Requisitos Previos
                            </h1>
                        </header>

                        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-8">
                            <p className="text-xl text-slate-500 font-medium">Antes de programar la lógica, asegúrate de tener estos componentes listos:</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    { text: "Esquema BD validado", icon: <Database className="w-5 h-5" /> },
                                    { text: "Entorno de desarrollo activo", icon: <Terminal className="w-5 h-5" /> },
                                    { text: "Variables de entrada definidas", icon: <Layers className="w-5 h-5" /> },
                                    { text: "Conexión a base de datos", icon: <Globe className="w-5 h-5" /> }
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                        <div className="text-violet-500">{item.icon}</div>
                                        <span className="font-bold text-slate-700 italic uppercase text-sm tracking-tight">{item.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case 3: // Concepto - Lógica de Decisión
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <header className="space-y-2">
                            <Badge className="bg-indigo-100 text-indigo-700 border-none px-4 py-1.5 rounded-full font-black uppercase tracking-widest text-[10px]">
                                Arquitectura
                            </Badge>
                            <h1 className="text-5xl font-black italic tracking-tighter text-slate-800 uppercase leading-none">
                                Lógica de Decisión
                            </h1>
                        </header>

                        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl">
                            <div className="flex flex-col md:flex-row gap-10 items-center">
                                <div className="flex-1 space-y-6">
                                    <p className="text-xl text-slate-600 leading-relaxed font-medium">
                                        {itTemplate?.concepto || "Un sistema inteligente utiliza sentencias condicionales para transformar datos de entrada en resultados específicos."}
                                    </p>
                                    <div className="p-6 bg-slate-900 rounded-3xl text-violet-400 font-mono text-sm border border-slate-800">
                                        <p>IF (entrada === valor) {"{"}</p>
                                        <p className="pl-4">ejecutarAccion();</p>
                                        <p>{"}"} ELSE {"{"}</p>
                                        <p className="pl-4">ejecutarAlternativa();</p>
                                        <p>{"}"}</p>
                                    </div>
                                </div>
                                <div className="w-full md:w-64 aspect-square bg-indigo-50 rounded-[3rem] flex items-center justify-center relative overflow-hidden">
                                    <Zap className="w-24 h-24 text-indigo-500 animate-pulse relative z-10" />
                                    <div className="absolute inset-0 bg-[radial-gradient(circle,white_0%,transparent_70%)] opacity-50" />
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 4: // Ejemplo - Caso de Referencia
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <header className="space-y-2">
                            <Badge className="bg-blue-100 text-blue-700 border-none px-4 py-1.5 rounded-full font-black uppercase tracking-widest text-[10px]">
                                Referencia
                            </Badge>
                            <h1 className="text-5xl font-black italic tracking-tighter text-slate-800 uppercase leading-none">
                                Caso de Éxito
                            </h1>
                        </header>

                        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-8">
                            <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl">
                                <p className="text-lg font-bold italic text-slate-700 uppercase tracking-tight">Módulo: {itTemplate?.ejemplo?.titulo || "Cargando..."}</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[
                                    { label: "Entrada", val: itTemplate?.ejemplo?.entrada || "Nivel de Agua", color: "text-indigo-600" },
                                    { label: "Regla", val: itTemplate?.ejemplo?.regla || "Si nivel > 80%", color: "text-amber-600" },
                                    { label: "Acción", val: itTemplate?.ejemplo?.accion || "Cerrar Válvula", color: "text-emerald-600" }
                                ].map((item, i) => (
                                    <div key={i} className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm text-center">
                                        <p className={cn("text-[10px] font-black uppercase tracking-widest mb-2", item.color)}>{item.label}</p>
                                        <p className="text-sm font-black text-slate-800 italic uppercase">{item.val}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case 5: // Reto de Integración
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
                        <header className="space-y-2">
                            <Badge className="bg-red-100 text-red-700 border-none px-4 py-1.5 rounded-full font-black uppercase tracking-widest text-[10px]">
                                El Desafío
                            </Badge>
                            <h1 className="text-5xl font-black italic tracking-tighter text-slate-800 uppercase leading-none">
                                Lógica del Sistema
                            </h1>
                        </header>

                        <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-10">
                            <div className="prose prose-slate">
                                <p className="text-xl text-slate-500 font-medium">Ajusta tu sistema para que tome una decisión inteligente basada en una variable específica.</p>
                            </div>

                            <div className="grid grid-cols-1 gap-8">
                                {[
                                    { id: 'variablePrincipal', label: '1️⃣ Variable Principal', placeholder: 'Variable que influye en la decisión (ej. Temperatura, Stock, Edad)' },
                                    { id: 'condicionRegla', label: '2️⃣ Condición o Regla', placeholder: 'Ej: Si la temp es > 30°C...' },
                                    { id: 'decisionSistema', label: '3️⃣ Decisión del Sistema', placeholder: 'Ej: Activar ventilador' }
                                ].map((field) => (
                                    <div key={field.id} className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic pl-1">{field.label}</label>
                                        <input
                                            type="text"
                                            value={(formData as any)[field.id]}
                                            onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                                            placeholder={field.placeholder}
                                            className="bg-slate-50 border border-slate-100 rounded-2xl px-8 py-5 text-slate-700 font-medium focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100 transition-all w-full hover:bg-white"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case 6: // Prueba - Escenario de Test
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <header className="space-y-2">
                            <Badge className="bg-slate-900 text-white border-none px-4 py-1.5 rounded-full font-black uppercase tracking-widest text-[10px]">
                                QC & Testing
                            </Badge>
                            <h1 className="text-5xl font-black italic tracking-tighter text-slate-800 uppercase leading-none">
                                Escenario de Prueba
                            </h1>
                        </header>

                        <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-8">
                            <div className="prose prose-slate">
                                <p className="text-xl text-slate-500 font-bold italic">"Diseña un escenario donde la regla se dispare y verifiques que la salida es la correcta."</p>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 mb-4">
                                    <Terminal className="w-6 h-6 text-slate-400" />
                                    <span className="text-xs font-black uppercase tracking-widest text-slate-400 italic">Playground de Pruebas</span>
                                </div>
                                <textarea
                                    value={formData.escenarioPrueba}
                                    onChange={(e) => setFormData({ ...formData, escenarioPrueba: e.target.value })}
                                    placeholder="Ej: Si ingreso 25, el sistema debería mostrar 'Acceso Denegado'..."
                                    className="w-full bg-slate-50 border border-slate-100 rounded-3xl p-8 text-slate-700 font-medium focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100 transition-all min-h-[200px] resize-none"
                                />
                            </div>
                        </div>
                    </div>
                );

            case 7: // Evidencia - Carga de Resultados
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <header className="space-y-2">
                            <Badge className="bg-violet-100 text-violet-700 border-none px-4 py-1.5 rounded-full font-black uppercase tracking-widest text-[10px]">
                                Deployment
                            </Badge>
                            <h1 className="text-5xl font-black italic tracking-tighter text-slate-800 uppercase leading-none">
                                Carga de Integración
                            </h1>
                        </header>

                        <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 shadow-xl">
                            <div className="flex flex-col md:flex-row gap-12 items-center">
                                <div className="flex-1 space-y-6">
                                    <h3 className="text-3xl font-black italic uppercase leading-none text-slate-800">Sube tu Código</h3>
                                    <p className="text-lg text-slate-500 font-medium">Carga una captura o archivo de tu implementación lógica funcionando.</p>
                                    <div className="p-10 border-4 border-dashed border-slate-100 rounded-[2rem] flex flex-col items-center justify-center bg-slate-50 relative group transition-all hover:bg-slate-100/50">
                                        <Upload className="w-12 h-12 text-slate-300 mb-4 group-hover:text-violet-500 transition-colors" />
                                        <Button className="bg-white text-violet-600 border border-slate-200 shadow-sm hover:bg-violet-50 rounded-xl font-black italic">
                                            BROWSE FILES
                                        </Button>
                                    </div>
                                </div>
                                <div className="w-full md:w-80 bg-slate-900 rounded-[2.5rem] p-8 text-white space-y-6 shadow-2xl">
                                    <div className="w-12 h-12 bg-violet-500 rounded-2xl flex items-center justify-center">
                                        <Play className="w-6 h-6 fill-current" />
                                    </div>
                                    <h4 className="text-xl font-black uppercase italic tracking-tight">Run Verification</h4>
                                    <p className="text-xs text-slate-400 leading-relaxed font-medium">
                                        Asegúrate de que el código esté comentado y siga las buenas prácticas de nombrado de variables.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 8: // Validación - Checklist 360
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <header className="space-y-2">
                            <Badge className="bg-emerald-100 text-emerald-700 border-none px-4 py-1.5 rounded-full font-black uppercase tracking-widest text-[10px]">
                                QA Review
                            </Badge>
                            <h1 className="text-5xl font-black italic tracking-tighter text-slate-800 uppercase leading-none">
                                Validación 360
                            </h1>
                        </header>

                        <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 shadow-xl">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[
                                    { id: 'logica', label: "La lógica IF/ELSE es correcta." },
                                    { id: 'integracion', label: "El sistema consume entradas reales." },
                                    { id: 'prueba', label: "El escenario de prueba fue exitoso." },
                                    { id: 'codigo', label: "El código es limpio y legible." }
                                ].map(item => (
                                    <button
                                        key={item.id}
                                        onClick={() => setFormData({
                                            ...formData,
                                            checklist: { ...formData.checklist, [item.id]: !(formData.checklist as any)[item.id] }
                                        })}
                                        className={cn(
                                            "p-8 rounded-[2rem] border transition-all text-left flex items-center gap-6",
                                            (formData.checklist as any)[item.id]
                                                ? "bg-emerald-50 border-emerald-200 shadow-inner"
                                                : "bg-slate-50 border-slate-100 hover:border-violet-200"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-8 h-8 rounded-xl flex items-center justify-center border-2 shrink-0 transition-colors",
                                            (formData.checklist as any)[item.id] ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300"
                                        )}>
                                            {(formData.checklist as any)[item.id] && <CheckCircle2 className="w-5 h-5" />}
                                        </div>
                                        <span className="font-black italic uppercase tracking-tight text-slate-700">{item.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case 9: // Competencias - Skills Logradas
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <header className="space-y-2">
                            <Badge className="bg-amber-100 text-amber-700 border-none px-4 py-1.5 rounded-full font-black uppercase tracking-widest text-[10px]">
                                Dominio
                            </Badge>
                            <h1 className="text-5xl font-black italic tracking-tighter text-slate-800 uppercase leading-none">
                                Competencias Logradas
                            </h1>
                        </header>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-slate-900 rounded-[3rem] p-12 text-white">
                                <h3 className="text-3xl font-black italic uppercase text-amber-500 mb-8 leading-none">Hard Skills</h3>
                                <div className="space-y-6">
                                    {[
                                        "Lógica Programática",
                                        "Integración de Sistemas",
                                        "Unit Testing Básico"
                                    ].map((skill, i) => (
                                        <div key={i} className="flex items-center gap-4">
                                            <Badge className="bg-amber-500 text-slate-900 border-none">LVL {i + 2}</Badge>
                                            <span className="font-black italic text-xl text-slate-300">{skill}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-white border border-slate-100 rounded-[3rem] p-12 shadow-xl flex flex-col justify-center">
                                <div className="space-y-8">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-violet-100 rounded-2xl">
                                            <Sparkles className="w-6 h-6 text-violet-600" />
                                        </div>
                                        <h4 className="text-2xl font-black italic uppercase text-slate-800 tracking-tight">Especialista IT</h4>
                                    </div>
                                    <p className="text-lg text-slate-500 font-medium italic leading-relaxed">
                                        Has demostrado que puedes ir más allá del diseño y entrar en la ejecución técnica de reglas de negocio integrales.
                                    </p>
                                    <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: "100%" }}
                                            transition={{ duration: 1.5 }}
                                            className="h-full bg-violet-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            default:
                return (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                        <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center">
                            <Settings className="w-10 h-10 text-slate-300 animate-spin-slow" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-800 uppercase italic">Fase {currentStep}</h3>
                            <p className="text-slate-400 font-medium">Contenido técnico en construcción...</p>
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
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Iteración IT</span>
                    <span className="text-slate-200">/</span>
                    <span className="text-[10px] font-black text-violet-500 uppercase tracking-widest">Paso {currentStep}</span>
                </div>
            </div>

            {/* SIDEBAR PLAYLIST - 25% */}
            <div className="hidden lg:flex flex-1 flex-col bg-slate-50 border-l border-slate-200 h-full overflow-hidden">
                <div className="p-8 border-b border-slate-200 bg-white">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Pasos de Integración</h3>
                    <div className="flex items-center justify-between">
                        <p className="text-lg font-black italic text-slate-800 tracking-tight">Curva de Código</p>
                        <Badge className="bg-violet-600 text-[10px] px-2">{currentStep}/10</Badge>
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
                                        layoutId="sidebarHighlightIT"
                                        className="absolute left-1 w-1 h-8 bg-violet-600 rounded-full"
                                    />
                                )}

                                <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105",
                                    isActive ? "bg-violet-600 text-white shadow-lg shadow-violet-200" :
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

                {/* IT Motivator Overlay */}
                <div className="p-6 bg-white border-t border-slate-200">
                    <div className="p-4 bg-violet-50 rounded-2xl flex items-start gap-4">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                            <Sparkles className="w-4 h-4 text-violet-600" />
                        </div>
                        <p className="text-[10px] font-bold text-violet-700 leading-tight">
                            "Integración técnica: Estás uniendo los puntos para crear inteligencia funcional."
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default ItViewer;
