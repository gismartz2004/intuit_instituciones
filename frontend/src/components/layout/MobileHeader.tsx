import {
    Sheet,
    SheetContent,
    SheetTrigger
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { SidebarContent } from "./SidebarContent";
import { SpecialistSidebarContent } from "@/features/specialist/components/SpecialistSidebarContent";
import generatedImage from '@/assets/generated_images/arg_academy_logo.png';
import { useState } from "react";

type Role = "student" | "admin" | "professor" | "superadmin" | "specialist" | "specialist_professor";

interface MobileHeaderProps {
    currentRole: Role;
    onLogout: () => void;
    userPlanId?: number;
}

export function MobileHeader({ currentRole, onLogout, userPlanId = 1 }: MobileHeaderProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="md:hidden flex items-center justify-between px-6 py-2 bg-white border-b border-slate-100 fixed top-0 left-0 w-full z-40 h-14">
            <div className="flex items-center gap-2">
                <img src={generatedImage} alt="Logo" className="h-8 w-8 object-contain p-1 rounded-lg bg-slate-50 border border-slate-100" />
                <div>
                    <h1 className="text-lg font-black text-slate-800 leading-none tracking-tight italic">ARG</h1>
                    <span className="text-[10px] font-bold text-violet-600 tracking-widest uppercase">Academy</span>
                </div>
            </div>

            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Menu className="h-6 w-6" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-72">
                    {currentRole === "specialist" || currentRole === "specialist_professor" ? (
                        <SpecialistSidebarContent
                            currentRole={currentRole as any}
                            onLogout={() => {
                                onLogout();
                                setIsOpen(false);
                            }}
                            onClose={() => setIsOpen(false)}
                        />
                    ) : (
                        <SidebarContent
                            currentRole={currentRole}
                            onLogout={() => {
                                onLogout();
                                setIsOpen(false);
                            }}
                            userPlanId={userPlanId}
                            onClose={() => setIsOpen(false)}
                        />
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}
