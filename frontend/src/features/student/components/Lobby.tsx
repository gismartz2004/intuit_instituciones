import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Zap, Play, Trophy, Settings, UserCircle, Star, Sparkles, MessageSquare, Paintbrush, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ModularAvatar } from "./ModularAvatar";
import AvatarCustomizer from "./AvatarCustomizer";
import { cn } from "@/lib/utils";
import { studentApi } from '../services/student.api';

interface LobbyProps {
    user: {
        name: string;
        id: string;
        role: string;
        avatar?: string;
    };
}

export default function Lobby({ user }: LobbyProps) {
    const [showCustomizer, setShowCustomizer] = useState(false);
    const [progress, setProgress] = useState<any>(null);
    const [, setLocation] = useLocation();
    const [avatarConfig, setAvatarConfig] = useState(() => {
        const saved = localStorage.getItem('student_avatar_config');
        return saved ? JSON.parse(saved) : {
            hairStyle: "classic",
            hairColor: "#4A2B11",
            skinColor: "#FFDBAC",
            outfitId: "standard"
        };
    });

    useEffect(() => {
        if (user?.id) {
            studentApi.getProgress(user.id)
                .then(data => setProgress(data))
                .catch(err => console.error("Error fetching progress:", err));
        }
    }, [user]);

    const handleAvatarSave = (newConfig: any) => {
        setAvatarConfig(newConfig);
    };

    return (
        <div className="relative h-screen w-full bg-[#020617] overflow-hidden flex flex-col font-sans selection:bg-purple-500/30">

            {/* Background Orbs */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <motion.div
                    animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-[10%] -left-[10%] w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full"
                />
                <motion.div
                    animate={{ x: [0, -40, 0], y: [0, -60, 0] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -bottom-[10%] -right-[10%] w-[600px] h-[600px] bg-indigo-600/10 blur-[150px] rounded-full"
                />
            </div>

            {/* TOPBAR HUD */}
            <header className="relative z-50 w-full px-4 md:px-8 py-4 md:py-6 flex justify-between items-center pointer-events-auto bg-slate-950/20 backdrop-blur-sm">
                <div className="flex items-center gap-3 md:gap-6">
                    <div className="flex items-center gap-2 bg-slate-900/50 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/10 shadow-xl">
                        <Zap className="w-4 h-4 text-orange-500 fill-current" />
                        <span className="text-white font-black text-sm md:text-lg tracking-tighter">{progress?.totalPoints || 0}</span>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-900/50 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/10 shadow-xl">
                        <Trophy className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-white font-black text-sm md:text-lg tracking-tighter">LVL 1</span>
                    </div>
                </div>

                <div className="flex items-center gap-2 md:gap-4">
                    <button
                        onClick={() => setShowCustomizer(true)}
                        className="hidden sm:flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-xl text-white font-bold text-xs uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(147,51,234,0.3)]"
                    >
                        <Paintbrush className="w-4 h-4" /> Personalizar
                    </button>
                    <div className="flex items-center gap-3 bg-slate-900 px-3 md:px-4 py-1.5 rounded-2xl border-2 border-slate-700 shadow-xl">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 overflow-hidden cursor-pointer" onClick={() => setShowCustomizer(true)}>
                            <ModularAvatar {...avatarConfig} animate={false} />
                        </div>
                        <span className="text-white font-bold text-xs md:text-sm uppercase tracking-wider hidden xs:block">{user.name}</span>
                    </div>
                </div>
            </header>

            {/* MAIN LOBBY STAGE */}
            <main className="relative z-10 flex-1 flex flex-col lg:flex-row items-center justify-center px-6 md:px-12 gap-8 lg:gap-16">

                {/* Left: News/Quest Panel */}
                <div className="hidden lg:flex flex-col gap-6 w-[280px]">
                    <motion.div
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="bg-slate-900/40 backdrop-blur-xl p-6 rounded-[2rem] border border-white/10 shadow-2xl"
                    >
                        <h3 className="text-blue-400 font-black text-[10px] uppercase tracking-[0.2em] mb-4">Misiones Diarias</h3>
                        <div className="space-y-4">
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0">
                                    <Star className="w-4 h-4 text-blue-400" />
                                </div>
                                <p className="text-xs text-slate-300 font-bold leading-tight">Completa 5 bloques de código en el Lab.</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="bg-indigo-600/20 backdrop-blur-xl p-6 rounded-[2.5rem] border border-indigo-500/30 shadow-2xl overflow-hidden relative"
                    >
                        <div className="relative z-10">
                            <Sparkles className="text-indigo-400 w-8 h-8 mb-2" />
                            <h4 className="text-white font-black text-sm uppercase mt-2">Novedades Intuit</h4>
                            <p className="text-indigo-200/60 text-[10px] font-bold mt-1">¡Nuevo pack de cabellos Cyberpunk disponible ahora!</p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        onClick={() => setLocation('/minecraft-world')}
                        className="bg-emerald-600/20 backdrop-blur-xl p-6 rounded-[2.5rem] border border-emerald-500/30 shadow-2xl overflow-hidden relative group cursor-pointer hover:bg-emerald-600/30 transition-all"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent" />
                        <div className="relative z-10">
                            <div className="flex items-center gap-2">
                                <Globe className="text-emerald-400 w-6 h-6" />
                                <span className="text-emerald-400 font-black text-[10px] uppercase tracking-widest">NUEVO MUNDO</span>
                            </div>
                            <h4 className="text-white font-black text-sm uppercase mt-2">Mundo Minecraft</h4>
                            <p className="text-emerald-200/60 text-[10px] font-bold mt-1">¡Programa y construye en tu propia parcela interactiva!</p>
                        </div>
                    </motion.div>
                </div>

                {/* Center: Character Stage */}
                <div className="flex-1 flex flex-col items-center justify-center relative w-full max-w-2xl">
                    <div className="absolute bottom-1/4 w-[200px] md:w-[400px] h-[40px] md:h-[60px] bg-purple-600/30 blur-[40px] md:blur-[60px] rounded-full pointer-events-none" />

                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="relative z-20 w-full max-w-xs md:max-w-sm drop-shadow-[0_25px_50px_rgba(0,0,0,0.8)] cursor-pointer"
                        onClick={() => setShowCustomizer(true)}
                    >
                        <ModularAvatar {...avatarConfig} />
                    </motion.div>

                    {/* Call to Action */}
                    <div className="mt-8 md:mt-12 flex flex-col items-center w-full">
                        <Button
                            onClick={() => setLocation('/world-selection')}
                            className="group relative bg-[#FFD700] hover:bg-[#FFC000] text-slate-900 h-16 md:h-20 px-12 md:px-20 rounded-[1.5rem] md:rounded-[2rem] font-black italic text-2xl md:text-4xl uppercase tracking-tighter shadow-[0_10px_60px_rgba(255,215,0,0.3)] transition-all hover:scale-105 active:scale-95"
                        >
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-yellow-400 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border-2 border-yellow-400/20">
                                Aula Virtual
                            </div>
                            ¡JUGAR!
                            <Play className="ml-4 w-6 h-6 md:w-8 md:h-8 fill-current group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>
                </div>

                {/* Right: Personalization / Social Panel */}
                <div className="flex lg:flex flex-col gap-6 w-full lg:w-[280px] max-w-sm lg:max-w-none px-4 lg:px-0">
                    <motion.div
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="bg-slate-900/40 backdrop-blur-xl p-6 md:p-8 rounded-[2.5rem] md:rounded-[3rem] border border-white/10 flex flex-row lg:flex-col items-center justify-between lg:justify-center text-center group cursor-pointer hover:bg-slate-900/60 transition-all"
                        onClick={() => setShowCustomizer(true)}
                    >
                        <div className="w-16 h-16 md:w-24 md:h-24 rounded-2xl md:rounded-3xl bg-gradient-to-br from-purple-600 to-indigo-800 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                            <Paintbrush className="w-8 h-8 md:w-12 md:h-12 text-white/50" />
                        </div>
                        <div className="flex-1 lg:flex-none text-right lg:text-center ml-4 lg:ml-0 lg:mt-6">
                            <h4 className="text-white font-black text-xs md:text-sm uppercase tracking-widest">Personalizar</h4>
                            <p className="text-slate-500 text-[9px] md:text-[10px] font-bold mt-1 md:mt-2 uppercase">Cambia tu estilo Intuit</p>
                        </div>
                    </motion.div>
                </div>
            </main>

            <footer className="relative z-50 w-full px-8 md:px-12 py-6 md:py-8 flex flex-col md:flex-row justify-between items-center gap-4 md:items-end bg-slate-950/40 backdrop-blur-md">
                <div className="flex flex-col items-center md:items-start">
                    <h1 className="text-xl md:text-2xl font-black text-white italic tracking-tighter leading-none">
                        INTUIT <span className="text-purple-500">MODEL</span>
                    </h1>
                    <p className="text-slate-600 font-bold uppercase text-[8px] tracking-[0.5em] mt-2">
                        Lobby v2.1 • Educational Edition
                    </p>
                </div>

                <div className="flex gap-2 md:gap-4 overflow-x-auto w-full md:w-auto justify-center">
                    <Link href="/leaderboard">
                        <Button variant="ghost" className="text-slate-500 hover:text-white font-black uppercase text-[10px] md:text-xs tracking-widest gap-2 h-10">
                            <Trophy className="w-4 h-4" /> Rankings
                        </Button>
                    </Link>
                    <Link href="/profile">
                        <Button variant="ghost" className="text-slate-500 hover:text-white font-black uppercase text-[10px] md:text-xs tracking-widest gap-2 h-10">
                            <UserCircle className="w-4 h-4" /> Perfil
                        </Button>
                    </Link>
                </div>
            </footer>

            <AnimatePresence>
                {showCustomizer && (
                    <AvatarCustomizer
                        initialConfig={avatarConfig}
                        onClose={() => setShowCustomizer(false)}
                        onSave={handleAvatarSave}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
