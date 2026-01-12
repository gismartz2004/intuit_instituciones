import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
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
  Cpu
} from "lucide-react";
import generatedImage from '@assets/generated_images/arg_academy_logo.png'

type Role = "student" | "admin" | "professor";

interface SidebarProps {
  currentRole: Role;
  onRoleChange: (role: Role) => void;
  onLogout: () => void;
  userPlanId?: number; // Add plan ID prop
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
  Gift: Store, // Using Store icon for Gift
  Cpu
};

export function Sidebar({ currentRole, onRoleChange, onLogout, userPlanId = 1 }: SidebarProps) {
  const [location] = useLocation();
  const [studentLinks, setStudentLinks] = useState<any[]>([]);

  useEffect(() => {
    if (currentRole === "student" && userPlanId) {
      fetchPlanFeatures();
    }
  }, [currentRole, userPlanId]);

  const fetchPlanFeatures = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/plans/${userPlanId}/features`);
      if (res.ok) {
        const planData = await res.json();
        const links = planData.sidebar.map((item: any) => ({
          href: item.path,
          icon: iconMap[item.icon] || Book,
          label: item.label
        }));
        // Manually append Lab for now if backend doesn't send it
        if (!links.find((l: any) => l.href === '/arduino-lab')) {
          links.push({ href: "/arduino-lab", icon: Cpu, label: "Laboratorio" });
        }
        setStudentLinks(links);
      }
    } catch (error) {
      console.error("Error fetching plan features:", error);
      // Fallback to basic plan
      setStudentLinks([
        { href: "/dashboard", icon: Book, label: "Aprende" },
        { href: "/profile", icon: User, label: "Perfil" },
        { href: "/arduino-lab", icon: Cpu, label: "Laboratorio" }
      ]);
    }
  };

  const adminLinks = [
    { href: "/admin", icon: Shield, label: "Panel Admin" },
    { href: "/admin/users", icon: User, label: "Usuarios" },
    { href: "/profile", icon: Settings, label: "Configuración" },
  ];

  // Professor links are now dynamically set into studentLinks state based on the useEffect logic
  // The original professorLinks array is no longer directly used for rendering if the useEffect handles it.
  // Keeping it here for reference or if the dynamic setting is only for student.
  const professorLinks = [
    { href: "/teach", icon: GraduationCap, label: "Mis Módulos" },
    { href: "/files", icon: FileText, label: "Sistema de Archivos" },
    { href: "/profile", icon: Settings, label: "Configuración" },
  ];

  const links = currentRole === "admin" ? adminLinks :
    currentRole === "professor" ? professorLinks :
      studentLinks;

  return (
    <div className="flex h-screen w-[280px] flex-col border-r-2 border-slate-200 bg-white p-4 fixed left-0 top-0 z-10 hidden md:flex">
      <div className="mb-8 px-4 flex items-center gap-2">
        <img src={generatedImage} alt="ARG Academy" className="h-10 w-10 object-contain" />
        <h1 className="text-2xl font-extrabold text-[#0047AB] tracking-tighter">
          ARG
        </h1>
      </div>

      <nav className="flex-1 space-y-2">
        {links.map((link) => {
          const isActive = location === link.href;
          return (
            <Link key={link.href} href={link.href}>
              <div
                className={cn(
                  "flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-wider transition-colors cursor-pointer border-2 border-transparent",
                  isActive
                    ? "bg-[#E5F3FF] text-[#0047AB] border-[#84D8FF]"
                    : "text-slate-500 hover:bg-slate-100"
                )}
              >
                <link.icon className={cn("h-6 w-6", isActive ? "fill-[#0047AB]" : "")} />
                {link.label}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="border-t-2 border-slate-100 pt-4 px-4 space-y-4">
        <button
          onClick={onLogout}
          className="flex items-center gap-4 w-full rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-wider text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut className="h-6 w-6" />
          Cerrar Sesión
        </button>

        <div className="flex items-center gap-3 text-slate-400">
          <div className="bg-slate-100 p-2 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          </div>
          <p className="text-xs font-bold uppercase">Sistema Online</p>
        </div>
      </div>
    </div>
  );
}
