import { Link, useLocation } from "wouter";
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
  Settings
} from "lucide-react";
import generatedImage from '@assets/generated_images/arg_academy_logo.png'

type Role = "student" | "admin" | "professor";

interface SidebarProps {
  currentRole: Role;
  onRoleChange: (role: Role) => void;
}

export function Sidebar({ currentRole, onRoleChange }: SidebarProps) {
  const [location] = useLocation();

  const studentLinks = [
    { href: "/dashboard", icon: Book, label: "Aprender" },
    { href: "/leaderboard", icon: Trophy, label: "Clasificación" },
    { href: "/quests", icon: Target, label: "Misiones" },
    { href: "/profile", icon: User, label: "Perfil" },
  ];

  const adminLinks = [
    { href: "/admin", icon: Shield, label: "Panel Admin" },
    { href: "/admin/users", icon: User, label: "Usuarios" },
    { href: "/profile", icon: Settings, label: "Configuración" },
  ];

  const professorLinks = [
    { href: "/teach", icon: GraduationCap, label: "Mis Clases" },
    { href: "/teach/create", icon: Code, label: "Crear Contenido" },
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

      <div className="border-t-2 border-slate-100 pt-4">
        {/* Role Switcher for Demo */}
        <div className="px-4 py-2">
          <p className="text-xs font-bold text-slate-400 mb-2 uppercase">Modo de Vista (Demo)</p>
          <div className="flex flex-col gap-2">
             <button 
               onClick={() => onRoleChange("student")}
               className={cn("text-xs font-bold py-1 px-2 rounded", currentRole === "student" ? "bg-primary text-white" : "bg-slate-100")}
             >
               Estudiante
             </button>
             <button 
               onClick={() => onRoleChange("professor")}
               className={cn("text-xs font-bold py-1 px-2 rounded", currentRole === "professor" ? "bg-primary text-white" : "bg-slate-100")}
             >
               Profesor
             </button>
             <button 
               onClick={() => onRoleChange("admin")}
               className={cn("text-xs font-bold py-1 px-2 rounded", currentRole === "admin" ? "bg-primary text-white" : "bg-slate-100")}
             >
               Admin
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
