import { SidebarContent } from "./SidebarContent";

type Role = "student" | "admin" | "professor" | "superadmin";

interface SidebarProps {
  currentRole: Role;
  onRoleChange: (role: Role) => void;
  onLogout: () => void;
  userPlanId?: number;
}

export function Sidebar({ currentRole, onLogout, userPlanId = 1 }: SidebarProps) {
  return (
    <div className="hidden md:flex flex-col w-[280px] h-screen bg-white fixed left-0 top-0 z-50 shadow-2xl border-r border-slate-100">
      <SidebarContent
        currentRole={currentRole}
        onLogout={onLogout}
        userPlanId={userPlanId}
      />
    </div>
  );
}
