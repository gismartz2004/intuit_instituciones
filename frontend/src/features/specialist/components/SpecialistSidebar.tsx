import { SpecialistSidebarContent } from "./SpecialistSidebarContent";

type Role = "specialist" | "specialist_professor";

interface SpecialistSidebarProps {
    currentRole: Role;
    onLogout: () => void;
}

export function SpecialistSidebar({ currentRole, onLogout }: SpecialistSidebarProps) {
    return (
        <div className="hidden md:flex flex-col w-[280px] h-screen bg-[#0a0f1d] fixed left-0 top-0 z-50 border-r border-cyan-500/10 shadow-2xl">
            <SpecialistSidebarContent
                currentRole={currentRole}
                onLogout={onLogout}
            />
        </div>
    );
}
