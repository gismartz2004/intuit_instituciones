import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  Trophy,
  Target,
  User,
  Home,
  Menu,
  Shield,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger
} from "@/components/ui/sheet";
import { SidebarContent } from "./SidebarContent";
import { useState } from "react";

type Role = "student" | "admin" | "professor" | "superadmin";

interface MobileNavProps {
  currentRole: Role;
  onLogout: () => void;
  userPlanId?: number;
}

export function MobileNav({ currentRole, onLogout, userPlanId = 1 }: MobileNavProps) {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);

  const studentLinks = [
    { href: "/dashboard", icon: Home, label: "Inicio" },
    { href: "/missions", icon: Trophy, label: "Misiones" },
    { href: "/profile", icon: User, label: "Perfil" },
  ];

  const adminLinks = [
    { href: "/admin", icon: Home, label: "Panel" },
    { href: "/admin/users", icon: User, label: "Usuarios" },
  ];

  const superadminLinks = [
    { href: "/superadmin", icon: Home, label: "Panel" },
    { href: "/admin", icon: Shield, label: "Admin" },
    { href: "/admin/users", icon: User, label: "Usuarios" },
  ];

  const professorLinks = [
    { href: "/teach", icon: Home, label: "Inicio" },
    { href: "/profile", icon: User, label: "Perfil" },
  ];

  const links = currentRole === "admin" ? adminLinks :
    currentRole === "superadmin" ? superadminLinks :
      currentRole === "professor" ? professorLinks :
        studentLinks;

  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-xl border-t border-slate-100 px-4 pb-6 pt-2 z-40 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
      <div className="flex justify-around items-center h-12">
        {links.slice(0, 3).map((link) => {
          const isActive = location === link.href;
          return (
            <Link key={link.href} href={link.href}>
              <div
                className={cn(
                  "flex flex-col items-center gap-1 px-4 py-1 rounded-2xl transition-all",
                  isActive ? "text-violet-600 bg-violet-50" : "text-slate-400"
                )}
              >
                <link.icon className={cn("h-6 w-6", isActive ? "fill-violet-600/10" : "")} />
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  {link.label}
                </span>
              </div>
            </Link>
          );
        })}

        {/* Menu Toggle for Full Sidebar */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <div
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-1 rounded-2xl transition-all text-slate-400 cursor-pointer"
              )}
            >
              <Menu className="h-6 w-6" />
              <span className="text-[10px] font-bold uppercase tracking-wider">
                Menú
              </span>
            </div>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-[280px] border-none">
            <SidebarContent
              currentRole={currentRole as any}
              onLogout={onLogout}
              userPlanId={userPlanId}
              onClose={() => setOpen(false)}
            />
          </SheetContent>
        </Sheet>
      </div>
    </div >
  );
}
