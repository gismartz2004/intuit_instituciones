
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
    Layers,
    Trophy,
    Target,
    Search,
    PenTool,
    CheckCircle2,
    Info,
    ChevronRight,
    Sparkles,
    ArrowRight,
    BookOpen
} from "lucide-react";
import { studentApi } from "@/features/student/services/student.api";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import AvatarGuide from "./AvatarGuide";
import { AvatarState } from "@/types/gamification";

interface PimViewerProps {
    levelId: number;
}

export default function PimViewer({ levelId }: PimViewerProps) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeModuleIdx, setActiveModuleIdx] = useState(0);
    const [avatarState, setAvatarState] = useState<AvatarState>({
        isVisible: true,
        emotion: 'happy',
        message: "¡Bienvenido al Proyecto Integrador! Aquí es donde pondrás en práctica todo lo aprendido."
    });

    useEffect(() => {
        const fetchPim = async () => {
            try {
                const result = await studentApi.getPimTemplate(levelId);
                if (result) {
                    result.modulos = typeof result.modulos === 'string' ? JSON.parse(result.modulos) : result.modulos;
                    setData(result);

                    if (result.modulos && result.modulos.length > 0) {
                        setAvatarState({
                            emotion: 'neutral',
                            message: `Este proyecto tiene ${result.modulos.length} módulos técnicos. Haz clic en cada uno para explorar el desafío.`,
                            isVisible: true
                        });
                    }
                }
            } catch (error) {
                console.error("Error fetching PIM:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPim();
    }, [levelId]); // Removed activeModuleIdx to prevent re-fetching on module change

    if (loading) return <div className="p-12 text-center text-slate-500">Cargando Proyecto Integrador...</div>;
    if (!data) return (
        <div className="flex flex-col items-center justify-center p-16 text-slate-400 bg-white rounded-2xl border-2 border-dashed border-slate-100">
            <Layers className="w-16 h-16 mb-4 opacity-10" />
            <p className="text-lg font-medium">No hay un Proyecto Integrador definido para este nivel.</p>
        </div>
    );

    // Safety check for modulos array
    if (!data.modulos || !Array.isArray(data.modulos) || data.modulos.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-16 text-slate-400 bg-white rounded-2xl border-2 border-dashed border-slate-100">
                <Layers className="w-16 h-16 mb-4 opacity-10" />
                <p className="text-lg font-medium">Este Proyecto Integrador no tiene módulos definidos.</p>
            </div>
        );
    }

    const activeModule = data.modulos[activeModuleIdx];

    return (
        <div className="max-w-5xl mx-auto space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-700 pb-4 relative h-full flex flex-col">

            {/* Project Hero Header */}
            <div className="relative rounded-2xl overflow-hidden shadow-xl bg-indigo-900 text-white flex items-center p-4 md:p-6 shrink-0">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-indigo-500/20 to-transparent pointer-events-none" />
                <div className="relative z-10 max-w-3xl space-y-2">
                    <Badge className="bg-indigo-500/30 text-indigo-100 border-indigo-400/30 px-2 py-0.5 mb-1 text-[10px]">
                        {data.anioNivel || "Proyecto Integrador"}
                    </Badge>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight leading-tight">
                        {data.tituloProyecto}
                    </h1>
                    <p className="text-sm md:text-md text-indigo-100/90 leading-relaxed max-w-2xl line-clamp-2">
                        {data.descripcionGeneral}
                    </p>
                    <div className="flex items-center gap-3 pt-1">
                        <div className="flex -space-x-1.5">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-6 h-6 rounded-full border-2 border-indigo-900 bg-indigo-400 flex items-center justify-center">
                                    <Sparkles className="w-3 h-3 text-indigo-900" />
                                </div>
                            ))}
                        </div>
                        <span className="text-indigo-200 text-[10px] font-medium">
                            {data.modulos?.length} Módulos Técnicos
                        </span>
                    </div>
                </div>
                {data.imagenUrl && (
                    <div className="hidden lg:block absolute right-8 top-1/2 -translate-y-1/2 w-32 h-32 rounded-xl overflow-hidden shadow-xl border-4 border-white/10">
                        <img src={data.imagenUrl} className="w-full h-full object-cover" />
                    </div>
                )}
            </div>

            {/* General Project Context Section - Compact */}
            {(data.problematicaGeneral || data.contextoProblema || data.objetivoProyecto) && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 shrink-0">
                    {data.problematicaGeneral && (
                        <Card className="bg-red-50 border-red-100 shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3 px-4 pt-4">
                                <CardTitle className="text-xs font-black text-red-600 uppercase tracking-widest flex items-center gap-2">
                                    <Info className="w-4 h-4" /> La Problemática
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="px-4 pb-4">
                                <p className="text-slate-700 text-xs leading-relaxed font-medium line-clamp-3">
                                    {data.problematicaGeneral}
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {data.contextoProblema && (
                        <Card className="bg-amber-50 border-amber-100 shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3 px-4 pt-4">
                                <CardTitle className="text-xs font-black text-amber-600 uppercase tracking-widest flex items-center gap-2">
                                    <BookOpen className="w-4 h-4" /> Contexto
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="px-4 pb-4">
                                <p className="text-slate-700 text-xs leading-relaxed font-medium line-clamp-3">
                                    {data.contextoProblema}
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {data.objetivoProyecto && (
                        <Card className="bg-emerald-50 border-emerald-100 shadow-sm hover:shadow-md transition-shadow md:col-span-1">
                            <CardHeader className="pb-3 px-4 pt-4">
                                <CardTitle className="text-xs font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                                    <Target className="w-4 h-4" /> Objetivo Final
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="px-4 pb-4">
                                <p className="text-slate-700 text-xs leading-relaxed font-medium line-clamp-3">
                                    {data.objetivoProyecto}
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start flex-1 min-h-0">

                {/* Module Sidebar Navigation */}
                <div className="lg:col-span-3 space-y-2 h-full flex flex-col min-h-0">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Estructura</h3>
                    <div className="space-y-1 overflow-y-auto flex-1 custom-scrollbar pr-1">
                        {data.modulos.map((mod: any, idx: number) => (
                            <button
                                key={idx}
                                onClick={() => setActiveModuleIdx(idx)}
                                className={cn(
                                    "w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between group",
                                    activeModuleIdx === idx
                                        ? "bg-white shadow-md border-l-4 border-l-indigo-600 ring-1 ring-slate-200"
                                        : "hover:bg-slate-50 text-slate-600"
                                )}
                            >
                                <div className="flex items-center gap-2">
                                    <div className={cn(
                                        "w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[10px]",
                                        activeModuleIdx === idx ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-500"
                                    )}>
                                        {idx + 1}
                                    </div>
                                    <span className="font-bold text-[10px] truncate max-w-[120px]">{mod.nombreModulo}</span>
                                </div>
                                <ChevronRight className={cn("w-3 h-3 transition-transform", activeModuleIdx === idx ? "text-indigo-600 translate-x-1" : "text-slate-300")} />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Module Details Content */}
                <div className="lg:col-span-9 h-full min-h-0">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeModuleIdx}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="h-full"
                        >
                            <Card className="border-none shadow-xl bg-white overflow-hidden h-full flex flex-col">
                                <CardHeader className="bg-indigo-600 text-white p-4 shrink-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Badge className="bg-white/20 text-white border-none text-[10px]">Módulo {activeModuleIdx + 1}</Badge>
                                    </div>
                                    <CardTitle className="text-xl font-black truncate">{activeModule.nombreModulo}</CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 space-y-4 overflow-y-auto flex-1 custom-scrollbar">

                                    {/* Focus Points */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5 p-3 rounded-2xl bg-indigo-50/50 border border-indigo-100/50 shadow-sm">
                                            <div className="flex items-center gap-2 text-indigo-700 font-bold text-[11px] uppercase tracking-wider">
                                                <Target className="w-3.5 h-3.5" /> Enfoque Técnico
                                            </div>
                                            <div className="text-indigo-900/80 leading-relaxed text-[11px] font-medium">
                                                {activeModule.enfoqueTecnico}
                                            </div>
                                        </div>
                                        <div className="space-y-1.5 p-3 rounded-2xl bg-orange-50/50 border border-orange-100/50 shadow-sm">
                                            <div className="flex items-center gap-2 text-orange-700 font-bold text-[11px] uppercase tracking-wider">
                                                <Search className="w-3.5 h-3.5" /> Problema Técnico
                                            </div>
                                            <div className="text-orange-900/80 leading-relaxed font-semibold italic text-[11px]">
                                                "{activeModule.problemaTecnico}"
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border-t border-slate-100" />

                                    {/* Investigation Section */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-md font-bold flex items-center gap-2 text-slate-800">
                                                <BookOpen className="w-4 h-4 text-blue-500" /> Investigación
                                            </h3>
                                            <div className="flex gap-1">
                                                {activeModule.formatoSugerido?.map((f: string, i: number) => (
                                                    <Badge key={i} variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none text-[9px]">
                                                        {f}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            {activeModule.actividadesInvestigacion?.map((act: string, i: number) => (
                                                <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 group hover:border-blue-200 transition-colors">
                                                    <div className="w-5 h-5 rounded-full bg-white shadow-sm flex items-center justify-center font-bold text-blue-600 text-[9px] shrink-0">
                                                        {i + 1}
                                                    </div>
                                                    <p className="text-slate-700 text-[11px] leading-snug line-clamp-2">{act}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Practice Section */}
                                    <div className="space-y-3">
                                        <h3 className="text-md font-bold flex items-center gap-2 text-slate-800">
                                            <PenTool className="w-4 h-4 text-green-500" /> Práctica
                                        </h3>
                                        <div className="bg-slate-50 p-3 rounded-xl space-y-2">
                                            <div className="flex flex-wrap gap-1">
                                                {activeModule.actividadesPractica?.map((act: string, i: number) => (
                                                    <Badge key={i} className="bg-white border-green-100 text-green-700 px-2.5 py-0.5 rounded-full text-[9px] font-medium shadow-sm flex items-center gap-1">
                                                        <CheckCircle2 className="w-3 h-3 text-green-500" /> {act}
                                                    </Badge>
                                                ))}
                                            </div>
                                            <div className="bg-white/60 p-3 rounded-xl border border-dashed border-green-200">
                                                <p className="text-[9px] text-green-800 font-bold uppercase tracking-widest mb-1.5">Sugeridos:</p>
                                                <ul className="space-y-1">
                                                    {activeModule.ejerciciosPracticos?.map((ex: string, i: number) => (
                                                        <li key={i} className="flex items-center gap-2 text-slate-700 text-[10px]">
                                                            <div className="w-1 h-1 rounded-full bg-green-400 shrink-0" />
                                                            <span className="truncate">{ex}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Project Contribution */}
                                    <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-4 rounded-2xl text-white shadow-lg relative overflow-hidden group shrink-0">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 blur-2xl group-hover:scale-150 transition-transform duration-700" />
                                        <div className="flex flex-col md:flex-row items-center gap-4 relative z-10">
                                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm shrink-0">
                                                <Trophy className="w-6 h-6 text-yellow-300" />
                                            </div>
                                            <div className="flex-1 space-y-0.5 text-center md:text-left min-w-0">
                                                <h4 className="text-sm font-black">Aporte Técnico</h4>
                                                <div className="flex flex-wrap gap-1 justify-center md:justify-start">
                                                    {activeModule.aporteTecnico?.map((ap: string, i: number) => (
                                                        <div key={i} className="bg-white/20 px-2 py-0.5 rounded-full text-[9px] font-semibold backdrop-blur-md">
                                                            {ap}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => setActiveModuleIdx(prev => Math.max(0, prev - 1))}
                                                    disabled={activeModuleIdx === 0}
                                                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                                                >
                                                    Anterior
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    onClick={() => {
                                                        if (activeModuleIdx < data.modulos.length - 1) {
                                                            setActiveModuleIdx(prev => prev + 1);
                                                        }
                                                    }}
                                                    className="bg-yellow-400 hover:bg-yellow-500 text-indigo-950 font-black rounded-full px-4 text-[11px] h-8 shrink-0"
                                                >
                                                    {activeModuleIdx === data.modulos.length - 1 ? "Completado" : "Siguiente"} <ArrowRight className="w-3 h-3 ml-1" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                </CardContent>
                            </Card>
                        </motion.div>
                    </AnimatePresence>
                </div>

            </div>

            {/* Mobile Avatar Guide */}
            <div className="lg:hidden fixed bottom-6 right-6 z-50">
                <AvatarGuide emotion={avatarState.emotion} message={avatarState.message} />
            </div>
        </div>
    );
}
