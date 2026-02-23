import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ChevronLeft, Star, Trophy, Lock, Zap, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { studentApi } from "../services/student.api";

// Backgrounds (keeping them as defaults)
import zoneAncient from "@/assets/gamification/zone_malecon.png";
import zoneFuture from "@/assets/gamification/zone_penas.png";
import zoneSantaAna from "@/assets/gamification/zone_santa_ana.png";

const BG_MAP = [zoneAncient, zoneFuture, zoneSantaAna];
const COLOR_MAP = [
    "from-amber-400 to-orange-700",
    "from-cyan-400 to-blue-900",
    "from-violet-500 to-purple-600"
];

export default function WorldSelection() {
    const [, setLocation] = useLocation();
    const [activeWorld, setActiveWorld] = useState(0);
    const [worlds, setWorlds] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const savedUser = localStorage.getItem("edu_user");
        if (savedUser) {
            const userData = JSON.parse(savedUser);
            setUser(userData);
            fetchData(userData.id);
        } else {
            setLocation("/login");
        }
    }, []);

    const fetchData = async (userId: string) => {
        try {
            const modulesData = await studentApi.getModules(userId);

            // Group modules into "Worlds" (max 2-3 modules per world to keep the UI clean)
            const groupedWorlds: any[] = [];
            for (let i = 0; i < modulesData.length; i += 2) {
                const worldIdx = Math.floor(i / 2);
                groupedWorlds.push({
                    id: `world-${worldIdx}`,
                    name: `REGIÓN ${worldIdx + 1}`,
                    description: "Explora tus módulos de aprendizaje asignados.",
                    image: BG_MAP[worldIdx % BG_MAP.length],
                    color: COLOR_MAP[worldIdx % COLOR_MAP.length],
                    modules: modulesData.slice(i, i + 2).map((m: any) => ({
                        id: m.id,
                        name: m.nombreModulo || m.nombre || "Módulo Sin Nombre",
                        levelCount: m.levelCount || 0,
                        unlocked: true // For now all assigned are unlocked
                    }))
                });
            }

            if (groupedWorlds.length === 0) {
                // Mock world if no modules
                groupedWorlds.push({
                    id: "empty",
                    name: "SIN ASIGNACIONES",
                    description: "No tienes módulos asignados todavía.",
                    image: BG_MAP[0],
                    color: COLOR_MAP[0],
                    modules: []
                });
            }

            setWorlds(groupedWorlds);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching world data:", error);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="h-screen w-full bg-[#020617] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    const currentWorld = worlds[activeWorld];

    return (
        <div className="relative h-screen w-full bg-[#020617] overflow-hidden flex flex-col font-sans">
            <div className="absolute inset-0 z-0">
                <motion.div
                    key={activeWorld}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1 }}
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${currentWorld.image})` }}
                >
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent" />
                </motion.div>
            </div>

            <header className="relative z-50 w-full px-8 py-8 flex justify-between items-center">
                <button
                    onClick={() => setLocation('/dashboard')}
                    className="w-14 h-14 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center text-white transition-all hover:-translate-x-1"
                >
                    <ChevronLeft className="w-8 h-8" />
                </button>

                <div className="flex-1 text-center">
                    <h1 className="text-white font-black text-4xl italic tracking-tighter uppercase">Selección de <span className="text-purple-400 font-bold">Mundo</span></h1>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Tu progreso de aprendizaje personalizado</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="bg-slate-900/80 backdrop-blur-xl px-6 py-3 rounded-2xl border border-white/10 flex items-center gap-3">
                        <Zap className="w-5 h-5 text-yellow-400 fill-current" />
                        <span className="text-white font-black text-xl">PRO</span>
                    </div>
                </div>
            </header>

            <main className="relative z-10 flex-1 flex flex-col items-center justify-end pb-32">
                <div className="w-full max-w-7xl px-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                    <motion.div
                        key={`info-${activeWorld}`}
                        initial={{ x: -100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="flex flex-col gap-6"
                    >
                        <div className={cn("inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-xl bg-gradient-to-r w-fit", currentWorld.color)}>
                            Módulos Asignados
                        </div>
                        <h2 className="text-7xl font-black text-white uppercase italic tracking-tighter leading-[0.8] mb-2">{currentWorld.name}</h2>
                        <p className="text-slate-300 font-bold text-lg max-w-md">{currentWorld.description}</p>

                        <div className="flex gap-4 mt-4">
                            <div className="bg-white/10 backdrop-blur-lg p-4 rounded-3xl border border-white/5 flex flex-col">
                                <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Módulos en Zona</span>
                                <div className="flex gap-2 items-center text-white font-bold">
                                    <BookOpen className="w-5 h-5 text-blue-400" />
                                    {currentWorld.modules.length}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        key={`map-${activeWorld}`}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                    >
                        {currentWorld.modules.map((mod: any) => (
                            <motion.button
                                key={mod.id}
                                whileHover={mod.unlocked ? { scale: 1.05, y: -5 } : {}}
                                onClick={() => mod.unlocked && setLocation(`/dashboard/module/${mod.id}`)}
                                className={cn(
                                    "relative h-48 rounded-[2.5rem] border-4 overflow-hidden shadow-2xl transition-all",
                                    mod.unlocked ? "bg-white/10 border-white/20 cursor-pointer" : "bg-slate-900/80 border-slate-800 opacity-60 grayscale cursor-not-allowed"
                                )}
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent p-6 flex flex-col justify-end">
                                    {!mod.unlocked && <Lock className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 text-slate-700" />}
                                    <h4 className="text-white font-black text-xs uppercase tracking-widest mb-1 opacity-60">ID: #{mod.id}</h4>
                                    <h3 className="text-white font-black text-xl uppercase leading-none italic">{mod.name}</h3>
                                    <div className="mt-4 flex items-center justify-between">
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{mod.levelCount} Niveles</span>
                                        {mod.unlocked && (
                                            <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center">
                                                <Trophy className="w-4 h-4 text-slate-900" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.button>
                        ))}
                    </motion.div>
                </div>
            </main>

            {worlds.length > 1 && (
                <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 flex items-center gap-6">
                    {worlds.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setActiveWorld(i)}
                            className={cn(
                                "w-4 h-4 rounded-full transition-all duration-500",
                                activeWorld === i ? "bg-white w-12" : "bg-white/20 hover:bg-white/40"
                            )}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
