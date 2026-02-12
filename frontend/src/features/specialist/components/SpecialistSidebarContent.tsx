import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
    Layout,
    Cpu,
    Zap,
    Trophy,
    User,
    LogOut,
    Settings,
    FileText,
    GraduationCap,
    Rocket,
    Terminal,
    Layers,
    BookOpen
} from "lucide-react";
import generatedImage from '@/assets/generated_images/arg_academy_logo.png';

type Role = "specialist" | "specialist_professor";

interface SpecialistSidebarContentProps {
    currentRole: Role;
    onLogout: () => void;
    onClose?: () => void;
}

export function SpecialistSidebarContent({ currentRole, onLogout, onClose }: SpecialistSidebarContentProps) {
    const [location] = useLocation();

    const specialistLinks = [
        { href: "/dashboard", icon: BookOpen, label: "Aprende" },
        { href: "/quests", icon: Rocket, label: "Misiones" },
        { href: "/lab", icon: Terminal, label: "Sandbox Tech" },
        { href: "/profile", icon: User, label: "Mi Perfil" },
    ];

    const specialistProfessorLinks = [
        { href: "/specialist-teach", icon: GraduationCap, label: "Mis Proyectos" },
        { href: "/files", icon: Layers, label: "Repositorio" },
        { href: "/profile", icon: Settings, label: "Configuración" },
    ];

    const links = currentRole === "specialist" ? specialistLinks : specialistProfessorLinks;

    return (
        <div className="flex flex-col h-full bg-[#0a0f1d] border-r border-cyan-500/10">
            {/* Specialist Brand Header */}
            <div className="relative h-28 flex items-center px-8 shrink-0 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-cyan-500/10 to-transparent pointer-events-none" />
                <div className="flex items-center gap-4 z-10">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-cyan-500 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
                        <img src={generatedImage} alt="Logo" className="h-11 w-11 object-contain relative rounded-xl bg-[#0f172a] p-2 border border-cyan-500/20 shadow-[0_0_20px_rgba(34,211,238,0.2)]" />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-xl font-black text-white leading-none tracking-tight flex items-center gap-2">
                            ARG <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-500/30">TECH</span>
                        </h1>
                        <span className="text-[10px] font-bold text-slate-500 tracking-[0.2em] uppercase mt-1 italic">Specialist Layer</span>
                    </div>
                </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto custom-scrollbar">
                {links.map((link) => {
                    const isActive = location === link.href;
                    return (
                        <Link key={link.href} href={link.href} onClick={onClose}>
                            <motion.div
                                whileHover={{ x: 4 }}
                                className={cn(
                                    "group relative flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all duration-300 cursor-pointer overflow-hidden",
                                    isActive
                                        ? "bg-cyan-500/10 text-white border border-cyan-500/20 shadow-[0_4px_20px_rgba(34,211,238,0.1)]"
                                        : "text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent"
                                )}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeSpecialistNav"
                                        className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-transparent z-0"
                                    />
                                )}

                                <div className={cn(
                                    "p-2 rounded-lg transition-all duration-300 z-10",
                                    isActive
                                        ? "bg-cyan-500 text-white shadow-[0_0_15px_rgba(34,211,238,0.4)]"
                                        : "bg-slate-800 group-hover:bg-slate-700 text-slate-400 group-hover:text-cyan-400 border border-white/5"
                                )}>
                                    <link.icon className="h-4 w-4" />
                                </div>

                                <span className={cn(
                                    "font-bold text-xs tracking-widest uppercase transition-colors duration-300 z-10",
                                    isActive ? "text-white" : "group-hover:text-white"
                                )}>
                                    {link.label}
                                </span>

                                {isActive && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="ml-auto w-1 h-1 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)] z-10"
                                    />
                                )}
                            </motion.div>
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Action Area */}
            <div className="p-6 mt-auto border-t border-white/5 bg-[#0f172a]/80">
                <button
                    onClick={() => {
                        onLogout();
                        onClose?.();
                    }}
                    className="flex items-center gap-4 w-full px-5 py-4 rounded-xl text-slate-500 hover:bg-red-500/10 hover:text-red-400 border border-white/5 hover:border-red-500/20 transition-all duration-300 font-bold text-[10px] tracking-widest uppercase group"
                >
                    <div className="p-2 bg-slate-800 rounded-lg group-hover:bg-red-500/20 transition-colors border border-white/5">
                        <LogOut className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                    </div>
                    <span>Disconnect</span>
                </button>
            </div>
        </div>
    );
}
