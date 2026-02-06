import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import apiClient from "@/services/api.client";
import {
    Book,
    Trophy,
    Target,
    User,
    Shield,
    Code,
    GraduationCap,
    LogOut,
    Settings,
    Bot,
    Award,
    FileText,
    Cpu,
    ChevronRight,
    Sparkles,
    Store
} from "lucide-react";
import generatedImage from '@/assets/generated_images/arg_academy_logo.png';

type Role = "student" | "admin" | "professor" | "superadmin";

interface SidebarContentProps {
    currentRole: Role;
    onLogout: () => void;
    userPlanId?: number;
    onClose?: () => void;
}

const iconMap: Record<string, any> = {
    BookOpen: Book,
    Trophy,
    Code,
    User,
    Bot,
    Award,
    Target,
    Shield,
    Settings,
    GraduationCap,
    Gift: Store,
    Cpu
};

export function SidebarContent({ currentRole, onLogout, userPlanId = 1, onClose }: SidebarContentProps) {
    const [location] = useLocation();
    const [studentLinks, setStudentLinks] = useState<any[]>([]);

    useEffect(() => {
        if (currentRole === "student" && userPlanId) {
            fetchPlanFeatures();
        }
    }, [currentRole, userPlanId]);

    const fetchPlanFeatures = async () => {
        try {
            const planData = await apiClient.get<any>(`/api/plans/${userPlanId}/features`);
            const links = planData.sidebar.map((item: any) => ({
                href: item.path,
                icon: iconMap[item.icon] || Book,
                label: item.label
            }));
            if (!links.find((l: any) => l.href === '/lab')) {
                links.push({ href: "/lab", icon: Code, label: "Lab de Código" });
            }
            if (!links.find((l: any) => l.href === '/arduino-lab')) {
                links.push({ href: "/arduino-lab", icon: Cpu, label: "Lab Arduino" });
            }
            setStudentLinks(links);
        } catch (error) {
            setStudentLinks([
                { href: "/dashboard", icon: Book, label: "Aprende" },
                { href: "/lab", icon: Code, label: "Lab de Código" },
                { href: "/arduino-lab", icon: Cpu, label: "Lab Arduino" },
                { href: "/profile", icon: User, label: "Perfil" }
            ]);
        }
    };

    const adminLinks = [
        { href: "/admin", icon: Shield, label: "Dashboard" },
        { href: "/admin/users", icon: User, label: "Usuarios" },
        { href: "/admin/modules", icon: Book, label: "Módulos" },
        { href: "/admin/assignments", icon: Target, label: "Asignaciones" },
        { href: "/admin/prizes", icon: Trophy, label: "Premios" },
    ];

    const superadminLinks = adminLinks;

    const professorLinks = [
        { href: "/teach", icon: GraduationCap, label: "Mis Módulos" },
        { href: "/files", icon: FileText, label: "Archivos" },
        { href: "/profile", icon: Settings, label: "Perfil" },
    ];

    const links = currentRole === "admin" ? adminLinks :
        currentRole === "superadmin" ? superadminLinks :
            currentRole === "professor" ? professorLinks :
                studentLinks;

    return (
        <div className="flex flex-col h-full bg-[#0a0f1d] border-r border-white/5">
            {/* Brand Header */}
            <div className="relative h-28 flex items-center px-8 shrink-0 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none" />
                <div className="flex items-center gap-4 z-10">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-blue-500 rounded-2xl blur-lg opacity-10 group-hover:opacity-20 transition-opacity" />
                        <img src={generatedImage} alt="Logo" className="h-11 w-11 object-contain relative rounded-xl bg-[#1e293b] p-2 border border-white/10 shadow-xl" />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-xl font-black text-white leading-none tracking-tight">ARG</h1>
                        <span className="text-[10px] font-bold text-slate-500 tracking-[0.2em] uppercase mt-1">Plataforma Académica</span>
                    </div>
                </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 px-4 py-8 space-y-1 overflow-y-auto custom-scrollbar">
                {links.map((link) => {
                    const isActive = location === link.href;
                    return (
                        <Link key={link.href} href={link.href} onClick={onClose}>
                            <div
                                className={cn(
                                    "group relative flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all duration-300 cursor-pointer",
                                    isActive
                                        ? "bg-blue-600/10 text-white border border-blue-500/20 shadow-[0_4px_20px_rgba(37,99,235,0.05)]"
                                        : "text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent"
                                )}
                            >
                                <div className={cn(
                                    "p-2 rounded-lg transition-all duration-300",
                                    isActive
                                        ? "bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                                        : "bg-slate-800 group-hover:bg-slate-700 text-slate-400 group-hover:text-white border border-white/5"
                                )}>
                                    <link.icon className="h-4 w-4" />
                                </div>

                                <span className={cn(
                                    "font-bold text-xs tracking-wide transition-colors duration-300",
                                    isActive ? "text-white" : "group-hover:text-white"
                                )}>
                                    {link.label}
                                </span>

                                {isActive && (
                                    <div className="ml-auto w-1 h-1 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
                                )}
                            </div>
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Action Area */}
            <div className="p-6 mt-auto border-t border-white/5 bg-[#0f172a]/50">
                <button
                    onClick={() => {
                        onLogout();
                        onClose?.();
                    }}
                    className="flex items-center gap-4 w-full px-5 py-4 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 border border-white/5 hover:border-red-500/20 transition-all duration-300 font-bold text-[10px] tracking-widest uppercase group"
                >
                    <div className="p-2 bg-slate-800 rounded-lg group-hover:bg-red-500/20 transition-colors border border-white/5">
                        <LogOut className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                    </div>
                    <span>Cerrar Sesión</span>
                </button>
            </div>
        </div>
    );
}
