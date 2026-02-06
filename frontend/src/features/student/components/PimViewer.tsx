import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
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
    ChevronLeft,
    ChevronRight,
    Sparkles,
    ArrowRight,
    BookOpen,
    Rocket,
    CheckCircle
} from "lucide-react";
import { studentApi } from "@/features/student/services/student.api";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import AvatarGuide from "./AvatarGuide";
import { AvatarState } from "@/types/gamification";

type PimSection = 'intro' | 'project_context' | 'technical_modules' | 'submission';

export const PimViewer = forwardRef(({ levelId }: { levelId: number }, ref) => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [currentSection, setCurrentSection] = useState<PimSection>('intro');
    const [activeModuleIdx, setActiveModuleIdx] = useState(0);
    const [avatarState, setAvatarState] = useState<AvatarState>({
        isVisible: true,
        emotion: 'happy',
        message: "¡Bienvenido al Proyecto Integrador! Aquí es donde pondrás en práctica todo lo aprendido."
    });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const result = await studentApi.getPimTemplate(levelId);
                if (result) {
                    // Parse modulos if string
                    result.modulos = typeof result.modulos === 'string' ? JSON.parse(result.modulos) : result.modulos;
                    setData(result);
                }
            } catch (error) {
                console.error("Error fetching PIM template:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [levelId]);

    const handleNext = () => {
        const sections: PimSection[] = ['intro', 'project_context', 'technical_modules', 'submission'];
        const currentIdx = sections.indexOf(currentSection);

        if (currentSection === 'technical_modules') {
            if (activeModuleIdx < (data?.modulos?.length - 1)) {
                setActiveModuleIdx(prev => prev + 1);
                setAvatarState({
                    isVisible: true,
                    emotion: 'happy',
                    message: `Estamos en el módulo ${activeModuleIdx + 2}: ${data.modulos[activeModuleIdx + 1].titulo}.`
                });
                return true;
            }
        }

        if (currentIdx < sections.length - 1) {
            const nextSec = sections[currentIdx + 1];
            setCurrentSection(nextSec);

            // Update avatar message based on section
            if (nextSec === 'project_context') {
                setAvatarState({
                    isVisible: true,
                    emotion: 'thinking',
                    message: "Es fundamental entender el contexto y los objetivos antes de comenzar a construir."
                });
            } else if (nextSec === 'technical_modules') {
                setAvatarState({
                    isVisible: true,
                    emotion: 'happy',
                    message: "¡Hora de la verdad! Vamos a ver los módulos técnicos que debes implementar."
                });
            } else if (nextSec === 'submission') {
                setAvatarState({
                    isVisible: true,
                    emotion: 'celebrating',
                    message: "¡Has revisado todo el proyecto! Ahora solo queda completar la entrega."
                });
            }
            return true;
        }
        return false;
    };

    const handlePrev = () => {
        const sections: PimSection[] = ['intro', 'project_context', 'technical_modules', 'submission'];
        const currentIdx = sections.indexOf(currentSection);

        if (currentSection === 'technical_modules') {
            if (activeModuleIdx > 0) {
                setActiveModuleIdx(prev => prev - 1);
                return true;
            }
        }

        if (currentIdx > 0) {
            setCurrentSection(sections[currentIdx - 1]);
            return true;
        }
        return false;
    };

    useImperativeHandle(ref, () => ({
        goNext: () => {
            const success = handleNext();
            return { handled: success };
        },
        goPrev: () => {
            const success = handlePrev();
            return { handled: success };
        }
    }));

    if (loading) return (
        <div className="w-full h-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                <p className="font-black text-xs text-slate-400 uppercase tracking-widest">Cargando desafío PIM...</p>
            </div>
        </div>
    );

    if (!data) return <div className="p-8 text-center text-slate-500 font-bold uppercase tracking-widest">No hay proyecto integrador para este nivel.</div>;

    const sections: PimSection[] = ['intro', 'project_context', 'technical_modules', 'submission'];
    const activeSectionIdx = sections.indexOf(currentSection);
    const activeModule = data.modulos?.[activeModuleIdx];

    return (
        <div className="w-full h-full max-w-5xl mx-auto flex flex-col relative px-4 overflow-hidden pt-4">

            {/* PROGRESS TRACKER */}
            <div className="flex items-center justify-between mb-8 px-8 relative shrink-0">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -translate-y-1/2 z-0" />
                {sections.map((sec, idx) => (
                    <div
                        key={sec}
                        className={cn(
                            "relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 border-2",
                            activeSectionIdx >= idx
                                ? "bg-indigo-600 border-indigo-400 shadow-[0_0_15px_rgba(79,70,229,0.5)] scale-110"
                                : "bg-white border-slate-300 scale-90"
                        )}
                    >
                        {activeSectionIdx > idx ? (
                            <CheckCircle className="w-5 h-5 text-white" />
                        ) : (
                            <span className={cn("font-black text-sm", activeSectionIdx === idx ? "text-white" : "text-slate-400")}>
                                {idx + 1}
                            </span>
                        )}
                        <span className={cn(
                            "absolute -bottom-6 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase tracking-tighter whitespace-nowrap transition-colors duration-500",
                            activeSectionIdx >= idx ? "text-indigo-600 opacity-100" : "text-slate-400 opacity-60"
                        )}>
                            {sec.replace('_', ' ')}
                        </span>
                    </div>
                ))}
            </div>

            <ScrollArea className="flex-1 w-full h-full">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSection + (currentSection === 'technical_modules' ? activeModuleIdx : '')}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="pb-24 pt-4"
                    >
                        {currentSection === 'intro' && (
                            <Card className="border-none bg-slate-900 text-white overflow-hidden shadow-2xl relative group">
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-transparent to-purple-600/20 opacity-50" />
                                <CardHeader className="relative z-10 p-12 text-center">
                                    <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 mb-6">
                                        <Rocket className="w-4 h-4 text-indigo-400" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300">Proyecto Integrador Final</span>
                                    </div>
                                    <CardTitle className="text-5xl font-black mb-6 tracking-tighter leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-indigo-100">
                                        {data.tituloProyecto}
                                    </CardTitle>
                                    <CardDescription className="text-slate-300 text-lg font-medium max-w-2xl mx-auto leading-relaxed italic">
                                        "{data.descripcionGeneral}"
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="relative z-10 px-12 pb-12 flex justify-center">
                                    <Button onClick={handleNext} className="h-14 px-10 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest text-xs shadow-xl transition-all hover:scale-105 active:scale-95 group">
                                        Comenzar Desafío <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </CardContent>
                            </Card>
                        )}

                        {currentSection === 'project_context' && (
                            <div className="space-y-6">
                                <div className="text-center mb-10">
                                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">Contexto de la Misión</h2>
                                    <p className="text-slate-500 font-medium">Analiza el problema antes de proponer una solución técnica.</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <Card className="bg-red-50 border-red-100 shadow-md hover:shadow-xl transition-all hover:-translate-y-2 group">
                                        <CardHeader>
                                            <CardTitle className="text-sm font-black text-red-600 uppercase tracking-widest flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-2xl bg-red-100 flex items-center justify-center group-hover:rotate-12 transition-transform">
                                                    <Info className="w-5 h-5" />
                                                </div>
                                                Problemática
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-slate-700 text-sm leading-relaxed font-medium">
                                                {data.problematicaGeneral}
                                            </p>
                                        </CardContent>
                                    </Card>

                                    <Card className="bg-amber-50 border-amber-100 shadow-md hover:shadow-xl transition-all hover:-translate-y-2 group">
                                        <CardHeader>
                                            <CardTitle className="text-sm font-black text-amber-600 uppercase tracking-widest flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center group-hover:rotate-12 transition-transform">
                                                    <BookOpen className="w-5 h-5" />
                                                </div>
                                                Contexto
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-slate-700 text-sm leading-relaxed font-medium">
                                                {data.contextoProblema}
                                            </p>
                                        </CardContent>
                                    </Card>

                                    <Card className="bg-emerald-50 border-emerald-100 shadow-md hover:shadow-xl transition-all hover:-translate-y-2 group h-full">
                                        <CardHeader>
                                            <CardTitle className="text-sm font-black text-emerald-600 uppercase tracking-widest flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    <Target className="w-5 h-5" />
                                                </div>
                                                Meta Final
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-slate-700 text-sm leading-relaxed font-medium">
                                                {data.objetivoProyecto}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </div>
                                <div className="flex justify-center pt-8">
                                    <Button onClick={handleNext} className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-full px-12 h-14 font-black uppercase tracking-widest text-xs shadow-lg group">
                                        Revisar Módulos Técnicos <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        {currentSection === 'technical_modules' && activeModule && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex flex-col">
                                        <h3 className="text-slate-500 font-black uppercase tracking-[0.2em] text-[10px]">Módulo Técnico {activeModuleIdx + 1} de {data.modulos.length}</h3>
                                        <h2 className="text-4xl font-black text-slate-800 tracking-tighter">{activeModule.titulo}</h2>
                                    </div>
                                    <div className="flex gap-2">
                                        {data.modulos.map((_: any, idx: number) => (
                                            <div
                                                key={idx}
                                                className={cn(
                                                    "w-12 h-1.5 rounded-full transition-all duration-300",
                                                    activeModuleIdx === idx ? "bg-indigo-600 w-20" : "bg-slate-200"
                                                )}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <Card className="border-none shadow-2xl bg-white/80 backdrop-blur-sm overflow-hidden rounded-3xl border border-slate-100">
                                    <div className="h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
                                    <CardHeader className="p-8">
                                        <div className="flex items-center justify-between mb-4">
                                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-4 py-1 text-xs font-black uppercase">
                                                <Layers className="w-4 h-4 mr-2" /> Enfoque: {activeModule.enfoqueTecnico}
                                            </Badge>
                                            <div className="flex gap-2">
                                                {activeModule.formatoSugerido?.map((f: string, i: number) => (
                                                    <Badge key={i} className="bg-slate-900 text-white text-[9px] font-black uppercase px-3">
                                                        {f}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="px-8 pb-12 space-y-10">
                                        {/* Investigation */}
                                        <div className="space-y-4">
                                            <h3 className="text-xl font-black flex items-center gap-3 text-slate-800 uppercase tracking-tight">
                                                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                                                    <Search className="w-5 h-5" />
                                                </div>
                                                Investigación Sugerida
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {activeModule.actividadesInvestigacion?.map((act: string, i: number) => (
                                                    <motion.div
                                                        key={i}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: 0.1 * i }}
                                                        className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-white transition-all group"
                                                    >
                                                        <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-black text-xs shrink-0 group-hover:scale-110 transition-transform">
                                                            {i + 1}
                                                        </div>
                                                        <p className="text-slate-700 text-sm font-medium leading-snug">{act}</p>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Practice */}
                                        <div className="space-y-4">
                                            <h3 className="text-xl font-black flex items-center gap-3 text-slate-800 uppercase tracking-tight">
                                                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-green-600">
                                                    <PenTool className="w-5 h-5" />
                                                </div>
                                                Retos de Práctica
                                            </h3>
                                            <div className="bg-green-50/50 p-6 rounded-3xl border border-green-100 space-y-4">
                                                <div className="flex flex-wrap gap-2">
                                                    {activeModule.actividadesPractica?.map((act: string, i: number) => (
                                                        <Badge key={i} className="bg-white border-green-200 text-green-700 px-4 py-2 rounded-xl text-xs font-black shadow-sm flex items-center gap-2 hover:scale-105 transition-transform cursor-default">
                                                            <CheckCircle2 className="w-4 h-4 text-green-500" /> {act}
                                                        </Badge>
                                                    ))}
                                                </div>
                                                <div className="bg-white p-6 rounded-2xl border border-dashed border-green-200 shadow-inner">
                                                    <p className="text-xs text-green-800 font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                                                        <Sparkles className="w-4 h-4" /> Ejercicios para el laboratorio
                                                    </p>
                                                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {activeModule.ejerciciosPracticos?.map((ex: string, i: number) => (
                                                            <li key={i} className="flex items-start gap-3 text-slate-700 text-sm bg-slate-50 p-3 rounded-xl border border-slate-100 hover:border-green-100 transition-all">
                                                                <div className="w-2 h-2 rounded-full bg-green-400 mt-1.5 shrink-0" />
                                                                <span className="font-medium text-slate-700">{ex}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <div className="flex justify-center gap-4 pt-4">
                                    <Button variant="outline" onClick={handlePrev} className="rounded-full px-8 h-12 border-slate-200 font-black uppercase text-[10px] tracking-widest">
                                        Anterior
                                    </Button>
                                    <Button onClick={handleNext} className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-full px-12 h-12 font-black uppercase tracking-widest text-xs">
                                        {activeModuleIdx === data.modulos.length - 1 ? 'Finalizar Revisión' : 'Siguiente Módulo'}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {currentSection === 'submission' && (
                            <div className="max-w-3xl mx-auto">
                                <Card className="border-none shadow-2xl bg-indigo-600 text-white rounded-3xl overflow-hidden text-center p-12 relative group">
                                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/20 to-transparent" />
                                    <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform">
                                        <Trophy className="w-12 h-12 text-indigo-100" />
                                    </div>
                                    <CardHeader>
                                        <CardTitle className="text-4xl font-black mb-4 tracking-tighter">¡Listo para la Entrega!</CardTitle>
                                        <CardDescription className="text-indigo-100 text-lg font-medium leading-relaxed">
                                            Has revisado todos los requerimientos y módulos del proyecto. Asegúrate de que tu prototipo cumpla con todos los puntos técnicos.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="pt-8">
                                        <div className="flex flex-col gap-4 max-w-sm mx-auto">
                                            <Button className="h-14 bg-white text-indigo-600 hover:bg-indigo-50 rounded-full font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all">
                                                Subir Mi Proyecto <Rocket className="ml-3 w-5 h-5" />
                                            </Button>
                                            <Button variant="ghost" onClick={() => setCurrentSection('intro')} className="text-white hover:bg-white/10 font-bold text-xs uppercase tracking-widest">
                                                Volver a Revisar Todo
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </ScrollArea>

            {/* NAV FOOTER (INTERNAL) - Repositioned to avoid overlap with total scroll */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white/80 backdrop-blur-md border border-slate-200 px-6 py-3 rounded-full shadow-xl z-20 md:hidden">
                <Button variant="ghost" size="icon" disabled={activeSectionIdx === 0} onClick={handlePrev} className="text-slate-500 hover:text-indigo-600">
                    <ChevronLeft className="w-6 h-6" />
                </Button>
                <div className="w-px h-6 bg-slate-200" />
                <Button variant="ghost" size="icon" onClick={handleNext} className="text-slate-500 hover:text-indigo-600">
                    <ChevronRight className="w-6 h-6" />
                </Button>
            </div>

            {/* AVATAR GUIDE */}
            <div className="fixed bottom-4 right-4 z-50 pointer-events-none transition-opacity duration-500">
                <div className="pointer-events-auto">
                    <AvatarGuide emotion={avatarState.emotion} message={avatarState.message} />
                </div>
            </div>
        </div>
    );
});

export default PimViewer;
