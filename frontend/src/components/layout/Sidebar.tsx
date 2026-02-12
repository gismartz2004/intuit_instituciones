import { SidebarContent } from "./SidebarContent";

type Role = "student" | "admin" | "professor" | "superadmin" | "specialist" | "specialist_professor";

interface SidebarProps {
  currentRole: Role;
  onRoleChange: (role: Role) => void;
  onLogout: () => void;
  userPlanId?: number;
}

export function Sidebar({ currentRole, onLogout, userPlanId = 1 }: SidebarProps) {
  return (
    <div className="hidden md:flex flex-col w-[280px] h-screen bg-[#0f172a] fixed left-0 top-0 z-50 border-r border-white/5 shadow-2xl">
      <SidebarContent
        currentRole={currentRole}
        onLogout={onLogout}
        userPlanId={userPlanId}
      />
    </div>
  );
}
