
import { useState, useEffect, useImperativeHandle, forwardRef } from "react";
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
    Upload
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link, useLocation, useRoute } from "wouter";
import specialistProfessorApi from "@/features/specialist-professor/services/specialistProfessor.api";

interface BdStep {
    id: number;
    title: string;
    description?: string;
}

const BdViewer = forwardRef(({ levelId: propLevelId, id }: { levelId?: number, id?: string }, ref) => {
    const [match, params] = useRoute("/specialist/bd/:id");
    const [location, setLocation] = useLocation();
    const [currentStep, setCurrentStep] = useState(1);

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
        }
    }));
    const [bdTemplate, setBdTemplate] = useState<any>(null);
    const [loading, setLoading] = useState(true);
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

    useEffect(() => {
        if (levelId) {
            fetchBdTemplate();
        }
    }, [levelId]);

    const fetchBdTemplate = async () => {
        try {
            setLoading(true);
            const data = await specialistProfessorApi.getBdTemplate(parseInt(levelId));
            setBdTemplate(data);
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

    const handleNext = () => {
        if (currentStep < 12) setCurrentStep(prev => prev + 1);
    };

    const handlePrev = () => {
        if (currentStep > 1) setCurrentStep(prev => prev - 1);
    };

    if (loading) return <div className="min-h-screen bg-[#020617] flex items-center justify-center text-cyan-500 font-black italic">CARGANDO BLOQUE...</div>;

    const secciones = bdTemplate?.secciones || [];
    const getSectionContent = (id: number) => secciones.find((s: any) => s.id === id);

    const renderStepContent = () => {
        const section = getSectionContent(currentStep);

        switch (currentStep) {
            case 1: // Propósito
                return (
                    <div className="space-y-8">
                        <div className="relative p-12 bg-slate-900/50 border border-cyan-500/20 rounded-[3rem] overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8">
                                <Rocket className="w-16 h-16 text-cyan-500/20 group-hover:text-cyan-500 transition-colors duration-700" />
                            </div>
                            <h2 className="text-4xl font-black italic tracking-tighter text-white mb-6 uppercase">
                                {section?.title || "Propósito del Bloque"}
                            </h2>
                            <p className="text-xl text-slate-300 leading-relaxed font-medium max-w-2xl border-l-4 border-cyan-500 pl-8">
                                {section?.content || "Cargando propósito..."}
                            </p>
                            <div className="mt-12 flex items-center gap-4">
                                <div className="p-3 bg-cyan-500/20 rounded-2xl">
                                    <Target className="w-6 h-6 text-cyan-400" />
                                </div>
                                <span className="text-sm font-black uppercase tracking-widest text-cyan-400/80">{section?.note || "Misión oficial del ciclo."}</span>
                            </div>
                        </div>
                    </div>
                );
            case 2: // Contenido
                return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <h2 className="text-4xl font-black italic tracking-tighter text-white uppercase">
                                {section?.title || "¿Qué es un Sistema?"}
                            </h2>
                            <div className="p-8 bg-slate-900/80 border border-white/5 rounded-3xl space-y-4">
                                <p className="text-lg text-slate-400 leading-relaxed">
                                    {section?.content}
                                </p>
                                {section?.details && (
                                    <div className="space-y-3 pt-4">
                                        {section.details.map((d: any, i: number) => (
                                            <div key={i} className="flex items-start gap-3">
                                                <Badge className="bg-cyan-500/10 text-cyan-400 border-none shrink-0">{d.label}</Badge>
                                                <p className="text-sm text-slate-500">{d.text}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="relative aspect-square bg-[#0a0f1d] rounded-[3rem] border border-cyan-500/10 flex items-center justify-center group overflow-hidden">
                            <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px_32px]" />
                            <div className="relative flex items-center gap-4 z-10 scale-110 lg:scale-125">
                                <motion.div
                                    animate={{ x: [0, 10, 0] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                    className="p-6 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl text-cyan-400 font-black uppercase text-[10px]"
                                >
                                    Inputs
                                </motion.div>
                                <ArrowRight className="w-6 h-6 text-slate-700" />
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                    className="p-8 bg-purple-500/10 border border-purple-500/20 rounded-3xl text-purple-400"
                                >
                                    <Cpu className="w-8 h-8" />
                                </motion.div>
                                <ArrowRight className="w-6 h-6 text-slate-700" />
                                <motion.div
                                    animate={{ x: [0, -10, 0] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                    className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 font-black uppercase text-[10px]"
                                >
                                    Outputs
                                </motion.div>
                            </div>
                        </div>
                    </div>
                );
            case 3: // Diagramación
                return (
                    <div className="space-y-8">
                        <header className="space-y-3">
                            <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20">Protocolo de Diseño</Badge>
                            <h2 className="text-4xl font-black italic tracking-tighter text-white uppercase">{section?.title}</h2>
                        </header>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="p-8 bg-slate-900 border border-white/5 rounded-3xl">
                                <p className="text-slate-400 text-lg mb-6 leading-relaxed">{section?.content}</p>
                                <div className="p-6 bg-black/50 border border-purple-500/30 rounded-2xl text-center">
                                    <code className="text-indigo-400 font-black text-xl">{section?.representation}</code>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic pl-2">Estándares del Bloque</h3>
                                {section?.rules?.map((rule: string, i: number) => (
                                    <div key={i} className="flex items-center gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-colors">
                                        <div className="w-6 h-6 bg-purple-500/20 rounded flex items-center justify-center text-[10px] font-black text-purple-400">{i + 1}</div>
                                        <span className="text-slate-300 font-medium">{rule}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            case 4: // Ejemplo
                return (
                    <div className="space-y-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-4xl font-black italic tracking-tighter text-white uppercase">{section?.title}</h2>
                            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 p-2 px-4 rounded-full font-black italic">REFERENCIA VISUAL</Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-2 p-12 bg-[#0a0f1d] border border-white/5 rounded-[3rem] relative overflow-hidden group">
                                <div className="absolute inset-0 bg-grid-white/[0.01] bg-[size:40px_40px]" />
                                <div className="relative z-10 space-y-6">
                                    <h3 className="text-2xl font-black text-white italic underline decoration-emerald-500 underline-offset-8 decoration-4 mb-8">Sistema: {section?.system}</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_10px_#06b6d4]" />
                                            <p className="text-slate-400">Entradas: <span className="text-white font-bold">{section?.entradas}</span></p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_10px_#a855f7]" />
                                            <p className="text-slate-400">Procesos: <span className="text-white font-bold">{section?.procesos}</span></p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                                            <p className="text-slate-400">Salidas: <span className="text-white font-bold">{section?.salidas}</span></p>
                                        </div>
                                    </div>
                                    <div className="mt-12 p-8 bg-black/40 border border-white/5 rounded-3xl font-mono text-cyan-500 text-center text-sm">
                                        {section?.esquema}
                                    </div>
                                </div>
                            </div>
                            <div className="p-8 bg-slate-900 border border-white/5 rounded-[3rem] flex flex-col items-center justify-center text-center space-y-4">
                                <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
                                    <Lightbulb className="w-8 h-8 text-emerald-500" />
                                </div>
                                <p className="text-sm text-slate-500 font-medium italic">{section?.note}</p>
                            </div>
                        </div>
                    </div>
                );
            case 5: // Activador
                return (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-8">
                        <div className="relative">
                            <motion.div
                                animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.3, 0.1] }}
                                transition={{ duration: 3, repeat: Infinity }}
                                className="absolute inset-0 bg-amber-500 blur-[80px]"
                            />
                            <div className="relative w-24 h-24 bg-slate-900 border-2 border-amber-500/30 rounded-3xl flex items-center justify-center">
                                <Zap className="w-12 h-12 text-amber-500" />
                            </div>
                        </div>
                        <h2 className="text-6xl font-black italic tracking-tighter text-white uppercase italic">{section?.title}</h2>
                        <div className="max-w-xl p-8 bg-white/5 border border-white/10 rounded-[2.5rem] backdrop-blur-xl">
                            <p className="text-3xl font-bold text-white leading-tight">"{section?.question}"</p>
                        </div>
                        <p className="text-slate-500 font-medium uppercase tracking-[0.2em] text-xs">{section?.note}</p>
                    </div>
                );
            case 6: // Núcleo (Reto)
                return (
                    <div className="max-w-3xl mx-auto space-y-8">
                        <div className="text-center space-y-4 mb-12">
                            <Badge className="bg-red-500/10 text-red-500 border-red-500/20 uppercase tracking-widest font-black">Misión Principal</Badge>
                            <h2 className="text-5xl font-black tracking-tighter text-white">EL <span className="text-red-500">RETO</span></h2>
                            <p className="text-slate-400 font-medium">{section?.reto}</p>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            {(section?.fields || ["Problema", "Sistema", "Entradas", "Procesos", "Salidas"]).map((label: string, i: number) => {
                                const fieldMap: any = {
                                    "Problema real a resolver": "problema",
                                    "Nombre del sistema": "nombreSistema",
                                    "Entradas del sistema": "entradas",
                                    "Procesos del sistema": "procesos",
                                    "Salidas del sistema": "salidas"
                                };
                                const id = fieldMap[label] || `field-${i}`;
                                return (
                                    <div key={i} className="group flex flex-col gap-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-focus-within:text-cyan-500 transition-colors italic">{label}</label>
                                        <input
                                            type="text"
                                            value={(formData as any)[id] || ""}
                                            onChange={(e) => setFormData({ ...formData, [id]: e.target.value })}
                                            placeholder={`Define ${label.toLowerCase()}...`}
                                            className="bg-slate-900 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/5 transition-all w-full"
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            case 7: // Diseño del Esquema / 8 Evidencia (Combined for better UX in 12 steps)
                return (
                    <div className="space-y-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-4xl font-black italic tracking-tighter text-white uppercase">{section?.title}</h2>
                            <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">REPRESENTACIÓN TÉCNICA</Badge>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div className="p-8 bg-slate-900 border border-white/5 rounded-3xl">
                                    <p className="text-slate-400 mb-6">{section?.instructions}</p>
                                    <div className="space-y-3">
                                        {section?.options?.map((opt: string, i: number) => (
                                            <div key={i} className="flex items-center gap-3 text-slate-500 text-sm">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                                {opt}
                                            </div>
                                        ))}
                                    </div>
                                    <p className="mt-6 text-[10px] font-black text-blue-400 uppercase tracking-widest italic">{section?.note}</p>
                                </div>
                            </div>
                            <div className="p-12 bg-white/5 border border-white/10 border-dashed rounded-[3rem] flex flex-col items-center justify-center text-center group hover:border-blue-500/40 transition-colors cursor-pointer">
                                <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Upload className="w-8 h-8 text-blue-500" />
                                </div>
                                <h4 className="text-white font-bold mb-1">Subir Diagrama</h4>
                                <p className="text-xs text-slate-500">Arrastra tu archivo o haz clic aquí</p>
                            </div>
                        </div>
                    </div>
                );
            case 8: // SECTION FOR EVIDENCIA (Types/Visibility)
                const s8 = getSectionContent(8);
                return (
                    <div className="space-y-8">
                        <h2 className="text-4xl font-black italic tracking-tighter text-white uppercase">{s8?.title}</h2>
                        <div className="p-12 bg-slate-900/50 border border-white/5 rounded-[3rem] space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {s8?.types?.map((type: string, i: number) => (
                                    <div key={i} className="p-6 bg-white/5 border border-white/5 rounded-2xl text-center">
                                        <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center mx-auto mb-4">
                                            {i === 0 ? <Eye className="w-5 h-5 text-cyan-400" /> : i === 1 ? <Share2 className="w-5 h-5 text-purple-400" /> : <Layers className="w-5 h-5 text-emerald-400" />}
                                        </div>
                                        <p className="text-[10px] font-black uppercase text-slate-300">{type}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="p-8 bg-slate-900 border border-white/5 rounded-2xl flex items-center gap-6">
                                <Bot className="w-10 h-10 text-cyan-500" />
                                <div>
                                    <p className="text-white font-bold">{s8?.visibility}</p>
                                    <p className="text-sm text-slate-500 italic">"{s8?.note}"</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 9: // Checklist
                return (
                    <div className="max-w-2xl mx-auto space-y-8">
                        <div className="text-center">
                            <h2 className="text-4xl font-black italic tracking-tighter text-white uppercase italic">{section?.title}</h2>
                            <p className="text-slate-500 text-sm mt-2">{section?.note}</p>
                        </div>
                        <div className="bg-slate-900 border border-white/5 rounded-[3rem] p-8 space-y-4">
                            {section?.items?.map((item: string, i: number) => {
                                const keyMap: any = ["real", "entradas", "procesos", "salidas", "entendible"];
                                const key = keyMap[i];
                                return (
                                    <button
                                        key={i}
                                        onClick={() => setFormData({ ...formData, checklist: { ...formData.checklist, [key]: !(formData.checklist as any)[key] } })}
                                        className={cn(
                                            "w-full p-6 rounded-2xl border flex items-center justify-between transition-all",
                                            (formData.checklist as any)[key] ? "bg-cyan-500/10 border-cyan-500/40 text-white" : "bg-white/5 border-white/5 text-slate-500"
                                        )}
                                    >
                                        <span className="font-bold">{item}</span>
                                        <div className={cn(
                                            "w-6 h-6 rounded-lg border flex items-center justify-center transition-colors",
                                            (formData.checklist as any)[key] ? "bg-cyan-500 border-cyan-400" : "border-slate-700"
                                        )}>
                                            {(formData.checklist as any)[key] && <CheckCircle2 className="w-4 h-4 text-white" />}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                );
            case 10: // Evidencia aprendizaje
                return (
                    <div className="space-y-8">
                        <h2 className="text-4xl font-black italic tracking-tighter text-white uppercase italic">{section?.title}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="p-8 bg-[#0a0f1d] border border-white/5 rounded-[3rem] space-y-6">
                                {section?.outcomes?.map((outcome: string, i: number) => (
                                    <div key={i} className="flex items-center gap-4">
                                        <div className="p-2 bg-emerald-500/20 rounded-lg"><Sparkles className="w-4 h-4 text-emerald-400" /></div>
                                        <span className="text-slate-300 font-bold">{outcome}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="p-12 bg-slate-900 border border-white/5 rounded-[3rem] flex flex-col items-center justify-center text-center">
                                <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-4">
                                    <Award className="w-8 h-8 text-emerald-500" />
                                </div>
                                <p className="text-slate-400 font-medium italic">{section?.criterion}</p>
                            </div>
                        </div>
                    </div>
                );
            case 11: // Competencias
                return (
                    <div className="space-y-8">
                        <h2 className="text-4xl font-black italic tracking-tighter text-white uppercase italic">{section?.title}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {section?.groups?.map((group: any, i: number) => (
                                <div key={i} className="p-8 bg-slate-900 border border-white/5 rounded-3xl space-y-6">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic decoration-orange-500 decoration-2 underline underline-offset-4">{group.name}</h3>
                                    <div className="space-y-4">
                                        {group.items.map((item: string, j: number) => (
                                            <div key={j} className="flex items-start gap-3">
                                                <div className="p-1 bg-white/10 rounded mt-1"><CheckCircle2 className="w-3 h-3 text-slate-400" /></div>
                                                <p className="text-xs text-slate-400 font-medium">{item}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 12: // Motivacional / Finish
                return (
                    <div className="text-center space-y-8 py-12">
                        <div className="relative inline-block">
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 4, repeat: Infinity }}
                                className="absolute inset-0 bg-cyan-500 blur-3xl opacity-20"
                            />
                            <div className="relative w-32 h-32 bg-slate-900 border-2 border-cyan-500 rounded-[2.5rem] flex items-center justify-center mx-auto">
                                <CheckCircle2 className="w-16 h-16 text-cyan-400" />
                            </div>
                        </div>
                        <h2 className="text-6xl font-black italic tracking-tighter text-white uppercase italic">MISIÓN <span className="text-cyan-500">COMPLETA</span></h2>
                        <div className="max-w-xl mx-auto space-y-6">
                            <p className="text-slate-300 text-xl font-medium leading-relaxed italic">{section?.content || "Bloque finalizado."}</p>
                            {section?.extra && <p className="text-cyan-400 font-bold uppercase tracking-widest text-xs border-y border-cyan-500/20 py-4">{section.extra}</p>}
                        </div>
                        <div className="pt-8">
                            <Button
                                onClick={() => setLocation('/dashboard')}
                                className="h-16 px-12 bg-cyan-600 hover:bg-cyan-500 text-white rounded-[2rem] font-black italic tracking-tighter text-xl gap-4 shadow-2xl shadow-cyan-500/20 transition-all hover:scale-105"
                            >
                                VOLVER AL HUB <ArrowRight className="w-6 h-6" />
                            </Button>
                        </div>
                    </div>
                );
            default:
                return (
                    <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-white/5 rounded-[3rem]">
                        <p className="text-slate-600 font-black uppercase tracking-widest text-[10px]">Página en Construcción - {section?.title || "Fase " + currentStep}</p>
                        <Settings className="w-8 h-8 text-slate-800 animate-spin mt-4" />
                    </div>
                );
        }
    };

    return (
        <div className="w-full h-full text-white">
            <div className="max-w-6xl mx-auto py-8">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.98 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                    >
                        {renderStepContent()}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
});

export default BdViewer;
