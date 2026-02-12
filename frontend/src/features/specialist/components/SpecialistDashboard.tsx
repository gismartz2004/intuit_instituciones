import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Cpu,
    Zap,
    Star,
    Layout,
    BookOpen,
    Code2,
    ChevronLeft,
    Terminal,
    ArrowRight,
    Play,
    Trophy,
    CheckCircle2,
    Lock
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { studentApi } from "@/features/student/services/student.api";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

interface SpecialistDashboardProps {
    user: {
        name: string;
        id: string;
        especializacion?: string;
    };
}

export default function SpecialistDashboard({ user }: SpecialistDashboardProps) {
    const [view, setView] = useState<'selection' | 'path'>('selection');
    const [modules, setModules] = useState<any[]>([]);
    const [selectedModule, setSelectedModule] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [levelProgress, setLevelProgress] = useState<Record<number, any>>({});

    useEffect(() => {
        const fetchSpecialistData = async () => {
            try {
                const data = await studentApi.getModules(user.id);
                // Filter by category if possible, or just take all for now
                // In a real scenario, we'd have many, here we might have 1 or 2
                const specialistModules = data.filter((m: any) => m.categoria === 'specialization' || m.nombreModulo.toLowerCase().includes('tech'));
                setModules(specialistModules);

                // If there's only one, we could auto-select, but let's keep the selector for now
            } catch (error) {
                console.error("Error fetching specialist modules:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSpecialistData();
    }, [user.id]);

    const handleSelectModule = async (mod: any) => {
        setSelectedModule(mod);
        setLoading(true);
        try {
            const progress = await studentApi.getModuleProgress(user.id, mod.id);
            const progressMap: Record<number, any> = {};
            progress.forEach((p: any) => progressMap[p.id] = p);
            setLevelProgress(progressMap);
            setView('path');
        } catch (error) {
            console.error("Error fetching module progress:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !selectedModule) {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Terminal className="w-12 h-12 text-cyan-500 animate-pulse" />
                    <p className="text-cyan-500 font-black tracking-widest uppercase text-[10px]">Iniciando Protocolo...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020617] text-white selection:bg-cyan-500/30">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                {user.especializacion === "Ciencias Computacionales" ? (
                    <div className="absolute inset-0 opacity-[0.03] select-none font-mono text-[10px] leading-tight break-all overflow-hidden p-4">
                        {Array.from({ length: 100 }).map((_, i) => (
                            <div key={i}>01101001 01101110 01101111 01110110 01100001 01110100 01101001 01101111 01101110 00100000 01110011 01111001 01110011 01110100 01100101 01101101 00001010</div>
                        ))}
                    </div>
                ) : user.especializacion === "Mecatrónica" ? (
                    <svg className="absolute inset-0 w-full h-full opacity-[0.05]" xmlns="http://www.w3.org/2000/svg">
                        <pattern id="circuit" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                            <path d="M0 50 H30 L40 40 V10 M40 40 H70 L80 50 H100 M50 100 V70 L60 60 H90" fill="none" stroke="#f97316" strokeWidth="0.5" />
                            <circle cx="30" cy="50" r="1" fill="#f97316" />
                            <circle cx="80" cy="50" r="1" fill="#f97316" />
                            <circle cx="40" cy="10" r="1" fill="#f97316" />
                        </pattern>
                        <rect width="100%" height="100%" fill="url(#circuit)" />
                    </svg>
                ) : null}
                <div className={cn(
                    "absolute top-0 left-1/4 w-[500px] h-[500px] blur-[120px] rounded-full",
                    user.especializacion === "Mecatrónica" ? "bg-orange-600/10" :
                        user.especializacion === "Electrónica" ? "bg-yellow-600/10" : "bg-cyan-600/10"
                )} />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full" />
            </div>

            <AnimatePresence mode="wait">
                {view === 'selection' ? (
                    <motion.div
                        key="selection"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="relative z-10 p-8 pt-16 max-w-7xl mx-auto"
                    >
                        <header className="mb-16">
                            <Badge variant="outline" className="text-cyan-400 border-cyan-400/30 mb-4 px-4 py-1 uppercase tracking-[0.3em] font-black text-[10px] bg-cyan-400/5">
                                Academia de Especialización
                            </Badge>
                            <h1 className="text-6xl font-black tracking-tighter mb-4 italic">
                                SELECT <span className="text-cyan-500">MISSION</span>
                            </h1>
                            <p className="text-slate-400 text-lg max-w-2xl border-l-2 border-slate-800 pl-6">
                                Bienvenida, {user.name}. Selecciona una ruta de especialización para comenzar tu entrenamiento técnico avanzado.
                            </p>
                        </header>

                        {modules.length === 0 ? (
                            <div className="bg-slate-900/50 border border-white/5 p-12 rounded-3xl text-center">
                                <Cpu className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                                <p className="text-slate-500 font-bold">No tienes misiones de especialización asignadas aún.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {modules.map((mod, idx) => (
                                    <motion.div
                                        key={mod.id}
                                        whileHover={{ y: -8, scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleSelectModule(mod)}
                                        className="relative group cursor-pointer"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-purple-600/20 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                        <div className="relative bg-slate-900/80 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] h-full flex flex-col items-center text-center overflow-hidden">
                                            {/* Tech Symbol (< />) */}
                                            <div className="w-24 h-24 bg-slate-800 rounded-3xl flex items-center justify-center mb-6 group-hover:bg-cyan-500 transition-colors duration-500 shadow-2xl relative">
                                                <Code2 className="w-12 h-12 text-cyan-400 group-hover:text-white transition-colors" />
                                                <div className="absolute inset-0 bg-cyan-400/20 rounded-3xl blur-lg opacity-0 group-hover:opacity-100 animate-pulse" />
                                            </div>

                                            <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 mb-4 px-3 py-1 text-[10px] font-black">
                                                MOD {idx + 1}
                                            </Badge>

                                            <h3 className="text-2xl font-black mb-3 tracking-tight group-hover:text-cyan-400 transition-colors uppercase">
                                                {mod.nombreModulo}
                                            </h3>

                                            <p className="text-slate-500 text-sm font-medium mb-8">
                                                Dominio técnico avanzado de {mod.nombreModulo.toLowerCase()}.
                                            </p>

                                            <div className="mt-auto w-full pt-6 border-t border-white/5 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Zap className="w-4 h-4 text-cyan-500" />
                                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Enter Mission</span>
                                                </div>
                                                <ArrowRight className="w-5 h-5 text-slate-600 group-hover:translate-x-1 transition-transform group-hover:text-cyan-400" />
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        key="path"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="relative z-10 flex flex-col h-screen"
                    >
                        {/* Static Header for Path View */}
                        <div className="p-8 pb-4 border-b border-white/5 backdrop-blur-md sticky top-0 bg-[#020617]/50 z-50">
                            <div className="max-w-7xl mx-auto flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                    <button
                                        onClick={() => setView('selection')}
                                        className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-colors"
                                    >
                                        <ChevronLeft className="w-6 h-6" />
                                    </button>
                                    <div>
                                        <h2 className="text-2xl font-black uppercase tracking-tight italic">
                                            {selectedModule.nombreModulo}
                                        </h2>
                                        <div className="flex items-center gap-3 mt-1">
                                            <Badge className="bg-indigo-600 text-[9px] px-2 py-0">SPECIALIST TRACK</Badge>
                                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1">
                                                <Star className="w-3 h-3 text-yellow-500" /> 1200 XP en juego
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-900 border border-white/10 p-4 py-2 rounded-2xl flex items-center gap-3">
                                    <div className="text-right">
                                        <p className="text-[9px] font-black text-slate-500 uppercase">Progreso Global</p>
                                        <p className="text-lg font-black text-cyan-400">0%</p>
                                    </div>
                                    <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                                        <Zap className="w-6 h-6 text-cyan-400" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Level Path Body */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 pt-20">
                            <div className="max-w-4xl mx-auto flex flex-col items-center gap-32 pb-32">
                                {selectedModule.levels?.map((lvl: any, lIdx: number) => {
                                    const progress = levelProgress[lvl.id];
                                    const isCompleted = progress?.completado;
                                    const isAvailable = progress?.isUnlocked && !progress?.isManuallyBlocked;
                                    const isActive = isAvailable && !isCompleted;

                                    return (
                                        <div key={lvl.id} className="relative group">
                                            {/* Connector line (vertical for simplicity in this tech design) */}
                                            {lIdx < selectedModule.levels.length - 1 && (
                                                <div className="absolute top-24 left-1/2 -translate-x-1/2 w-0.5 h-32 bg-slate-800">
                                                    <div className={cn(
                                                        "h-full w-full bg-cyan-500 transition-all duration-1000",
                                                        isCompleted ? "scale-y-100" : "scale-y-0"
                                                    )} />
                                                </div>
                                            )}

                                            <Link href={isAvailable ? `/level/${lvl.id}` : "#"}>
                                                <motion.button
                                                    whileHover={isAvailable ? { scale: 1.1, y: -4 } : {}}
                                                    whileTap={isAvailable ? { scale: 0.95 } : {}}
                                                    className={cn(
                                                        "w-32 h-32 rounded-[2.5rem] border-4 flex flex-col items-center justify-center transition-all duration-500 relative z-10",
                                                        isActive ? (
                                                            user.especializacion === "Mecatrónica" ? "bg-slate-900 border-orange-400 shadow-[0_0_50px_rgba(249,115,22,0.3)]" :
                                                                user.especializacion === "Electrónica" ? "bg-slate-900 border-yellow-400 shadow-[0_0_50px_rgba(234,179,8,0.3)]" :
                                                                    "bg-slate-900 border-cyan-400 shadow-[0_0_50px_rgba(34,211,238,0.3)]"
                                                        ) :
                                                            isCompleted ? (
                                                                user.especializacion === "Mecatrónica" ? "bg-orange-500 border-orange-400" :
                                                                    user.especializacion === "Electrónica" ? "bg-yellow-500 border-yellow-400" :
                                                                        "bg-cyan-500 border-cyan-400"
                                                            ) :
                                                                isAvailable ? "bg-slate-900 border-white/20" :
                                                                    "bg-slate-900 border-slate-800 opacity-40 grayscale pointer-events-none"
                                                    )}
                                                >
                                                    {isCompleted ? (
                                                        <CheckCircle2 className="w-12 h-12 text-white" />
                                                    ) : !isAvailable ? (
                                                        <Lock className="w-12 h-12 text-slate-600" />
                                                    ) : (
                                                        <>
                                                            {lIdx === 0 ? <Play className="w-12 h-12 text-cyan-400 fill-cyan-400" /> :
                                                                lIdx === selectedModule.levels.length - 1 ? <Trophy className="w-12 h-12 text-yellow-500" /> :
                                                                    <Terminal className="w-12 h-12 text-white" />}
                                                        </>
                                                    )}

                                                    <div className={cn(
                                                        "absolute -bottom-8 bg-slate-900 border border-white/10 px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest whitespace-nowrap",
                                                        isActive && (
                                                            user.especializacion === "Mecatrónica" ? "text-orange-400 border-orange-400/30" :
                                                                user.especializacion === "Electrónica" ? "text-yellow-400 border-yellow-400/30" :
                                                                    "text-cyan-400 border-cyan-400/30"
                                                        )
                                                    )}>
                                                        {lvl.tipoActividad || "Nivel"} {lIdx + 1}
                                                    </div>
                                                </motion.button>
                                            </Link>

                                            {/* Level Title and Description */}
                                            <div className={cn(
                                                "absolute left-40 top-1/2 -translate-y-1/2 w-64 transition-all duration-500",
                                                isAvailable ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"
                                            )}>
                                                <h4 className="text-xl font-black italic tracking-tight">{lvl.tituloNivel}</h4>
                                                <p className="text-slate-500 text-xs mt-1 font-medium">{lvl.descripcion || "Misión técnica de alta especialización."}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
