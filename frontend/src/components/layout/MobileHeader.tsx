import {
    Sheet,
    SheetContent,
    SheetTrigger
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { SidebarContent } from "./SidebarContent";
import generatedImage from '@/assets/generated_images/arg_academy_logo.png';
import { useState } from "react";

type Role = "student" | "admin" | "professor";

interface MobileHeaderProps {
    currentRole: Role;
    onLogout: () => void;
    userPlanId?: number;
}

export function MobileHeader({ currentRole, onLogout, userPlanId = 1 }: MobileHeaderProps) {
    const [open, setOpen] = useState(false);

    return (
        <div className="md:hidden flex items-center justify-between px-6 py-4 bg-white border-b border-slate-100 fixed top-0 left-0 w-full z-40 h-20">
            <div className="flex items-center gap-2">
                <img src={generatedImage} alt="Logo" className="h-10 w-10 object-contain p-1 rounded-lg bg-slate-50 border border-slate-100" />
                <div>
                    <h1 className="text-xl font-black text-slate-800 leading-none tracking-tight italic">ARG</h1>
                    <span className="text-[10px] font-bold text-blue-600 tracking-widest uppercase">Academy</span>
                </div>
            </div>

            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-slate-500 hover:bg-slate-50 rounded-xl">
                        <Menu className="h-6 w-6" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-[280px] border-none">
                    <SidebarContent
                        currentRole={currentRole}
                        onLogout={onLogout}
                        userPlanId={userPlanId}
                        onClose={() => setOpen(false)}
                    />
                </SheetContent>
            </Sheet>
        </div>
    );
}
