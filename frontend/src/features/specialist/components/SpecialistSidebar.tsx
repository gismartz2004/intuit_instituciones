import { SpecialistSidebarContent } from "./SpecialistSidebarContent";

type Role = "specialist" | "specialist_professor";

interface SpecialistSidebarProps {
    currentRole: Role;
    onLogout: () => void;
}

export function SpecialistSidebar({ currentRole, onLogout }: SpecialistSidebarProps) {
    return (
        <div className="hidden md:flex flex-col w-[280px] h-screen bg-white fixed left-0 top-0 z-50 border-r border-slate-100 shadow-xl">
            <SpecialistSidebarContent
                currentRole={currentRole}
                onLogout={onLogout}
            />
        </div>
    );
}
