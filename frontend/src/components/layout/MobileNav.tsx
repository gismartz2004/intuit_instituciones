import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Book, 
  Trophy, 
  Target, 
  Store, 
  User, 
  Shield, 
  GraduationCap 
} from "lucide-react";

type Role = "student" | "admin" | "professor";

interface MobileNavProps {
  currentRole: Role;
}

export function MobileNav({ currentRole }: MobileNavProps) {
  const [location] = useLocation();

  const studentLinks = [
    { href: "/dashboard", icon: Book, label: "Aprender" },
    { href: "/leaderboard", icon: Trophy, label: "Ranking" },
    { href: "/quests", icon: Target, label: "Misiones" },
    { href: "/profile", icon: User, label: "Perfil" },
  ];

  const adminLinks = [
    { href: "/admin", icon: Shield, label: "Admin" },
    { href: "/admin/users", icon: User, label: "Usuarios" },
  ];

  const professorLinks = [
    { href: "/teach", icon: GraduationCap, label: "Clases" },
    { href: "/teach/create", icon: Book, label: "Crear" },
  ];

  const links = currentRole === "admin" ? adminLinks : 
                currentRole === "professor" ? professorLinks : 
                studentLinks;

  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 z-50 px-4 pb-4 pt-2">
      <div className="flex justify-around items-center">
        {links.map((link) => {
          const isActive = location === link.href;
          return (
            <Link key={link.href} href={link.href}>
              <div className="flex flex-col items-center gap-1 cursor-pointer">
                <link.icon 
                  className={cn(
                    "h-6 w-6 transition-colors", 
                    isActive ? "fill-[#0047AB] text-[#0047AB]" : "text-slate-400"
                  )} 
                />
                <span 
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-wide",
                    isActive ? "text-[#0047AB]" : "text-slate-400"
                  )}
                >
                  {link.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
