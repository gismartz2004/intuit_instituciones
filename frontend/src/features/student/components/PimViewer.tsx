
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
    }, [levelId]);

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
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700 pb-24 relative">

            {/* Project Hero Header */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-indigo-900 text-white min-h-[300px] flex items-center p-8 md:p-12">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-indigo-500/20 to-transparent pointer-events-none" />
                <div className="relative z-10 max-w-2xl space-y-4">
                    <Badge className="bg-indigo-500/30 text-indigo-100 border-indigo-400/30 px-3 py-1 mb-2">
                        {data.anioNivel || "Proyecto Integrador"}
                    </Badge>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
                        {data.tituloProyecto}
                    </h1>
                    <p className="text-lg md:text-xl text-indigo-100/90 leading-relaxed">
                        {data.descripcionGeneral}
                    </p>
                    <div className="flex items-center gap-4 pt-4">
                        <div className="flex -space-x-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-8 h-8 rounded-full border-2 border-indigo-900 bg-indigo-400 flex items-center justify-center">
                                    <Sparkles className="w-4 h-4 text-indigo-900" />
                                </div>
                            ))}
                        </div>
                        <span className="text-indigo-200 text-sm font-medium">
                            {data.modulos?.length} Módulos Técnicos Disponibles
                        </span>
                    </div>
                </div>
                {data.imagenUrl && (
                    <div className="hidden lg:block absolute right-12 top-1/2 -translate-y-1/2 w-64 h-64 rounded-2xl overflow-hidden transform rotate-3 shadow-2xl border-8 border-white/10">
                        <img src={data.imagenUrl} className="w-full h-full object-cover" />
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* Module Sidebar Navigation */}
                <div className="lg:col-span-4 space-y-4">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest px-2">Estructura del Proyecto</h3>
                    <div className="space-y-2">
                        {data.modulos.map((mod: any, idx: number) => (
                            <button
                                key={idx}
                                onClick={() => setActiveModuleIdx(idx)}
                                className={cn(
                                    "w-full text-left p-4 rounded-xl transition-all flex items-center justify-between group",
                                    activeModuleIdx === idx
                                        ? "bg-white shadow-lg border-l-4 border-l-indigo-600 ring-1 ring-slate-200"
                                        : "hover:bg-slate-50 text-slate-600"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm",
                                        activeModuleIdx === idx ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-500"
                                    )}>
                                        {idx + 1}
                                    </div>
                                    <span className="font-bold text-sm truncate max-w-[180px]">{mod.nombreModulo}</span>
                                </div>
                                <ChevronRight className={cn("w-4 h-4 transition-transform", activeModuleIdx === idx ? "text-indigo-600 translate-x-1" : "text-slate-300")} />
                            </button>
                        ))}
                    </div>

                    {/* Avatar Guide Placement */}
                    <div className="hidden lg:block pt-6">
                        <AvatarGuide
                            emotion={avatarState.emotion}
                            message={avatarState.message}
                            className="w-full"
                        />
                    </div>
                </div>

                {/* Module Details Content */}
                <div className="lg:col-span-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeModuleIdx}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-6"
                        >
                            <Card className="border-none shadow-xl bg-white overflow-hidden">
                                <CardHeader className="bg-indigo-600 text-white p-8">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Badge className="bg-white/20 text-white border-none">Módulo {activeModuleIdx + 1}</Badge>
                                    </div>
                                    <CardTitle className="text-3xl font-black">{activeModule.nombreModulo}</CardTitle>
                                </CardHeader>
                                <CardContent className="p-8 space-y-10">

                                    {/* Focus Points */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 text-indigo-600 font-bold">
                                                <Target className="w-5 h-5" /> Enfoque Técnico
                                            </div>
                                            <div className="p-4 bg-indigo-50 rounded-2xl text-indigo-900 leading-relaxed">
                                                {activeModule.enfoqueTecnico}
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 text-orange-600 font-bold">
                                                <Search className="w-5 h-5" /> Problema Técnico
                                            </div>
                                            <div className="p-4 bg-orange-50 rounded-2xl text-orange-900 leading-relaxed font-semibold italic">
                                                "{activeModule.problemaTecnico}"
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border-t border-slate-100" />

                                    {/* Investigation Section */}
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-xl font-bold flex items-center gap-2 text-slate-800">
                                                <BookOpen className="w-6 h-6 text-blue-500" /> Exploración e Investigación
                                            </h3>
                                            <div className="flex gap-2">
                                                {activeModule.formatoSugerido?.map((f: string, i: number) => (
                                                    <Badge key={i} variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none">
                                                        {f}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {activeModule.actividadesInvestigacion?.map((act: string, i: number) => (
                                                <div key={i} className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-blue-200 transition-colors">
                                                    <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center font-bold text-blue-600 text-xs shrink-0 group-hover:scale-110 transition-transform">
                                                        {i + 1}
                                                    </div>
                                                    <p className="text-slate-700 text-sm leading-snug">{act}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Practice Section */}
                                    <div className="space-y-6">
                                        <h3 className="text-xl font-bold flex items-center gap-2 text-slate-800">
                                            <PenTool className="w-6 h-6 text-green-500" /> Aplicación y Práctica
                                        </h3>
                                        <div className="bg-slate-50 p-6 rounded-3xl space-y-4">
                                            <div className="flex flex-wrap gap-2">
                                                {activeModule.actividadesPractica?.map((act: string, i: number) => (
                                                    <Badge key={i} className="bg-white border-green-100 text-green-700 px-4 py-2 rounded-full font-medium shadow-sm flex items-center gap-2">
                                                        <CheckCircle2 className="w-4 h-4 text-green-500" /> {act}
                                                    </Badge>
                                                ))}
                                            </div>
                                            <div className="bg-white/60 p-4 rounded-2xl border border-dashed border-green-200">
                                                <p className="text-xs text-green-800 font-bold uppercase tracking-widest mb-3">Ejercicios sugeridos de aplicación:</p>
                                                <ul className="space-y-2">
                                                    {activeModule.ejerciciosPracticos?.map((ex: string, i: number) => (
                                                        <li key={i} className="flex items-center gap-3 text-slate-700 text-sm">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                                                            {ex}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Project Contribution */}
                                    <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 rounded-[2rem] text-white shadow-lg relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-700" />
                                        <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                                            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                                                <Trophy className="w-10 h-10 text-yellow-300" />
                                            </div>
                                            <div className="flex-1 space-y-2 text-center md:text-left">
                                                <h4 className="text-xl font-black">Aporte Técnico al Proyecto Fin de Año</h4>
                                                <div className="flex flex-wrap gap-2 justify-center md:justify-start pt-2">
                                                    {activeModule.aporteTecnico?.map((ap: string, i: number) => (
                                                        <div key={i} className="bg-white/20 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md">
                                                            {ap}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <Button className="bg-yellow-400 hover:bg-yellow-500 text-indigo-950 font-black rounded-full px-6">
                                                Continuar <ArrowRight className="w-4 h-4 ml-2" />
                                            </Button>
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
