import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, Variants } from "framer-motion";
import {
    Compass,
    Map as MapIcon,
    ChevronRight,
    Zap,
    Ship,
    Wind,
    Waves
} from "lucide-react";
import { studentApi } from "../services/student.api";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface WorldSelectorProps {
    user: {
        name: string;
        id: string;
        avatar?: string;
    };
}

export default function WorldSelector({ user }: WorldSelectorProps) {
    const [, setLocation] = useLocation();
    const [modules, setModules] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [hoveredIsland, setHoveredIsland] = useState<number | null>(null);

    useEffect(() => {
        const fetchModules = async () => {
            try {
                const data = await studentApi.getModules(user.id);
                setModules(data);
            } catch (error) {
                console.error("Error loading worlds:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchModules();
    }, [user.id]);

    const islandVariants: Variants = {
        hover: {
            scale: 1.1,
            y: -10,
            transition: { type: "spring", stiffness: 300, damping: 10 }
        },
        initial: { scale: 1, y: 0 }
    };

    if (loading) {
        return (
            <div className="h-screen w-full bg-[#0f172a] flex flex-col items-center justify-center text-white">
                <Compass className="w-12 h-12 animate-spin text-blue-400 mb-4" />
                <p className="font-bold tracking-widest uppercase text-sm animate-pulse">Localizando Mundos...</p>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-[#0a192f] overflow-hidden flex flex-col">

            {/* Dynamic Sea Background */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
                <Waves className="absolute top-1/4 left-1/4 w-64 h-64 text-blue-500 animate-pulse" />
                <Waves className="absolute bottom-1/4 right-1/4 w-96 h-96 text-blue-400 rotate-180 opacity-50" />
                <Wind className="absolute top-1/3 right-1/4 w-32 h-32 text-cyan-300 animate-bounce-slow" />
            </div>

            {/* Clouds / Mist Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a192f]/80 via-transparent to-[#0a192f]/90 z-10 pointer-events-none" />

            {/* Header Info */}
            <header className="relative z-20 p-8 flex flex-col items-center text-center">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-4 py-1.5 rounded-full mb-6"
                >
                    <MapIcon className="w-4 h-4 text-blue-400" />
                    <span className="text-blue-300 text-xs font-black uppercase tracking-[0.2em]">Mapa del Navegante</span>
                </motion.div>

                <h1 className="text-4xl md:text-6xl font-black text-white leading-none mb-4 drop-shadow-2xl">
                    MAPA DE MUNDOS
                </h1>
                <p className="text-slate-400 text-lg max-w-xl">
                    Bienvenido, <span className="text-blue-400 font-bold">{user.name}</span>. Elige un mundo para continuar tu aventura técnica.
                </p>
            </header>

            {/* Archipelago Grid */}
            <div className="relative z-20 flex-1 flex items-center justify-center p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-24 items-center">
                    {modules.map((mod, idx) => (
                        <motion.div
                            key={mod.id}
                            variants={islandVariants}
                            whileHover="hover"
                            initial="initial"
                            onMouseEnter={() => setHoveredIsland(mod.id)}
                            onMouseLeave={() => setHoveredIsland(null)}
                            className="relative cursor-pointer group"
                            onClick={() => setLocation(`/dashboard/module/${mod.id}`)}
                        >
                            {/* Island Visual Placeholder (3D-ish Card) */}
                            <div className="relative w-64 h-64 md:w-80 md:h-80 mx-auto">
                                {/* Floating Ring Effect */}
                                <div className={cn(
                                    "absolute inset-0 rounded-full blur-3xl opacity-20 transition-all duration-500 scale-150",
                                    idx === 0 ? "bg-emerald-500" : (idx === 1 ? "bg-blue-500" : "bg-purple-500")
                                )} />

                                {/* Main Island Card */}
                                <div className="relative h-full w-full bg-[#1e293b]/80 backdrop-blur-xl rounded-[3rem] border-t-2 border-white/10 shadow-2xl flex flex-col items-center justify-center p-8 transition-all group-hover:border-white/30 group-hover:translate-y-[-10px]">

                                    {/* Island Icon/Illustrative Element */}
                                    <div className={cn(
                                        "w-24 h-24 rounded-3xl mb-6 flex items-center justify-center shadow-inner",
                                        idx === 0 ? "bg-emerald-500/20 text-emerald-400" : (idx === 1 ? "bg-blue-500/20 text-blue-400" : "bg-purple-500/20 text-purple-400")
                                    )}>
                                        {idx === 0 ? <Ship className="w-12 h-12" /> : <MapIcon className="w-12 h-12" />}
                                    </div>

                                    <Badge className="bg-white/5 text-slate-400 border-none mb-2 px-3 py-1 uppercase text-[10px] tracking-widest font-black">
                                        Sector {idx + 1}
                                    </Badge>

                                    <h2 className="text-2xl font-black text-white text-center leading-tight mb-4 uppercase group-hover:text-blue-200 transition-colors">
                                        {mod.nombreModulo}
                                    </h2>

                                    {/* Progress Glow Minibar */}
                                    <div className="w-full bg-black/50 h-1.5 rounded-full overflow-hidden mt-4">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: "45%" }}
                                            className={cn(
                                                "h-full rounded-full",
                                                idx === 0 ? "bg-emerald-500" : (idx === 1 ? "bg-blue-500" : "bg-purple-500")
                                            )}
                                        />
                                    </div>

                                    <div className="mt-8 flex items-center gap-2 text-xs font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                        Explorar Mundo <ChevronRight className="w-4 h-4" />
                                    </div>
                                </div>

                                {/* Decorative Elements around islands */}
                                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex gap-4 pointer-events-none">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                                        className="w-4 h-4 border-2 border-white/5 rounded-full"
                                    />
                                    <motion.div
                                        animate={{ rotate: -360 }}
                                        transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
                                        className="w-2 h-2 bg-white/5 rounded-full translate-y-4"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Footnote HUD */}
            <footer className="relative z-20 p-8 flex justify-between items-end">
                <div className="flex gap-4">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Tu Ubicación</span>
                        <div className="flex items-center gap-2 text-white font-bold">
                            <Compass className="w-4 h-4 text-blue-400" />
                            Mares Exteriores
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-orange-400 animate-pulse" />
                        <span className="text-white font-black text-xl">1.2k</span>
                    </div>
                    <Button variant="outline" className="rounded-full bg-white/5 border-white/10 text-white hover:bg-white/10">
                        Inventario
                    </Button>
                </div>
            </footer>

        </div>
    );
}
