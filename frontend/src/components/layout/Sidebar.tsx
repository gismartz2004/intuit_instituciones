import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import apiClient from "@/services/api.client";
import {
  Book,
  Trophy,
  Target,
  Store,
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
  Menu,
  ChevronRight,
  Sparkles
} from "lucide-react";
import generatedImage from '@/assets/generated_images/arg_academy_logo.png';

type Role = "student" | "admin" | "professor";

interface SidebarProps {
  currentRole: Role;
  onRoleChange: (role: Role) => void;
  onLogout: () => void;
  userPlanId?: number;
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

export function Sidebar({ currentRole, onRoleChange, onLogout, userPlanId = 1 }: SidebarProps) {
  const [location] = useLocation();
  const [studentLinks, setStudentLinks] = useState<any[]>([]);

  // Fetch logic preserved
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
      if (!links.find((l: any) => l.href === '/arduino-lab')) {
        links.push({ href: "/arduino-lab", icon: Cpu, label: "Laboratorio" });
      }
      setStudentLinks(links);
    } catch (error) {
      setStudentLinks([
        { href: "/dashboard", icon: Book, label: "Aprende" },
        { href: "/profile", icon: User, label: "Perfil" },
        { href: "/arduino-lab", icon: Cpu, label: "Laboratorio" },
        { href: "/dashboard-3d", icon: Sparkles, label: "Mapa 3D (Beta)" }
      ]);
    }
  };

  const adminLinks = [
    { href: "/admin", icon: Shield, label: "Panel Admin" },
    { href: "/admin/users", icon: User, label: "Usuarios" },
    { href: "/profile", icon: Settings, label: "Configuración" },
  ];

  const professorLinks = [
    { href: "/teach", icon: GraduationCap, label: "Mis Módulos" },
    { href: "/files", icon: FileText, label: "Archivos" },
    { href: "/profile", icon: Settings, label: "Perfil" },
  ];

  const links = currentRole === "admin" ? adminLinks :
    currentRole === "professor" ? professorLinks :
      studentLinks;

  return (
    <div className="hidden md:flex flex-col w-[280px] h-screen bg-white fixed left-0 top-0 z-50 shadow-2xl border-r border-slate-100">

      {/* Brand Header using Glassmorphism */}
      <div className="relative h-24 flex items-center px-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -translate-y-10 translate-x-10 pointer-events-none" />
        <div className="flex items-center gap-3 z-10">
          <div className="relative group cursor-pointer">
            <div className="absolute inset-0 bg-blue-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity" />
            <img src={generatedImage} alt="Logo" className="h-12 w-12 object-contain relative rounded-xl shadow-sm bg-white p-1" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 leading-none tracking-tight">ARG</h1>
            <span className="text-xs font-bold text-blue-600 tracking-widest uppercase">Academy</span>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
        {links.map((link) => {
          const isActive = location === link.href;
          return (
            <Link key={link.href} href={link.href}>
              <div
                className={cn(
                  "m-2 group relative flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 cursor-pointer overflow-hidden",
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 translate-x-1"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                {/* Active Indicator Glow */}
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl -z-10" />
                )}

                <div className={cn(
                  "p-2 rounded-xl transition-colors",
                  isActive ? "bg-white/20" : "bg-slate-100 group-hover:bg-white border border-slate-100 group-hover:border-slate-200 group-hover:shadow-sm"
                )}>
                  <link.icon className={cn("h-5 w-5", isActive ? "text-white" : "text-slate-500 group-hover:text-blue-600")} />
                </div>

                <span className={cn("font-bold text-sm tracking-wide", isActive ? "text-white" : "")}>
                  {link.label}
                </span>

                {isActive && (
                  <ChevronRight className="ml-auto w-4 h-4 text-white/70 animate-pulse" />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Action Area */}
      <div className="p-4 mt-auto space-y-4">
        {/* Premium Upgrade Card (Visual Only) */}
        {/* {currentRole === 'student' && (
          <div className="bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl p-4 text-white relative overflow-hidden shadow-lg group cursor-pointer hover:shadow-xl transition-shadow">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-2xl -translate-y-5 translate-x-5" />
            <div className="flex items-start justify-between relative z-10">
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                <Sparkles className="w-5 h-5 text-yellow-300 fill-current" />
              </div>
            </div>
            <div className="mt-3 relative z-10">
              <p className="font-bold text-sm">Plan Pro</p>
              <p className="text-[10px] text-white/70 leading-tight mt-1">Desbloquea todos los niveles y skins.</p>
            </div>
          </div>
        )} */}

        <div className="border-t border-slate-100 pt-4">
          <button
            onClick={onLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all font-bold text-sm group"
          >
            <LogOut className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </div>
  );
}
