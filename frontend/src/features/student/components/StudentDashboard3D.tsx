
import { useState, useEffect } from "react";
import { Zap } from "lucide-react";
import { motion } from "framer-motion";
import { WorldMap3D } from "@/components/student/WorldMap3D";

import { studentApi } from '../services/student.api';

// Avatar Assets
import avatarBoy from "@/assets/avatars/avatar_boy.png";
import avatarGirl from "@/assets/avatars/avatar_girl.png";
import avatarRobot from "@/assets/avatars/avatar_robot.png";
import avatarPet from "@/assets/avatars/avatar_pet.png";

const AVATAR_MAP: Record<string, string> = {
    'avatar_boy': avatarBoy,
    'avatar_girl': avatarGirl,
    'avatar_robot': avatarRobot,
    'avatar_pet': avatarPet,
};

interface StudentDashboardProps {
    user: {
        name: string;
        id: string;
        role: string;
        avatar?: string;
        onboardingCompleted?: boolean;
    };
}

export default function StudentDashboard3D({ user }: StudentDashboardProps) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [modules, setModules] = useState<any[]>([]);
    const [progress, setProgress] = useState<any>(null);
    const [currentAvatar, setCurrentAvatar] = useState(avatarBoy);

    useEffect(() => {
        if (user?.id) {
            // Refresh user data to check onboarding status
            studentApi.getUserInfo(user.id)
                .then(userData => {
                    if (userData.avatar && AVATAR_MAP[userData.avatar]) {
                        setCurrentAvatar(AVATAR_MAP[userData.avatar]);
                    }
                });

            fetchModules();
            fetchProgress();
        }
    }, [user]);

    const fetchModules = async () => {
        try {
            const data = await studentApi.getModules(user.id);
            setModules(data);
        } catch (error) {
            console.error("Error fetching student modules:", error);
        }
    };

    const fetchProgress = async () => {
        try {
            const data = await studentApi.getProgress(user.id);
            setProgress(data);
        } catch (error) {
            console.error("Error fetching progress:", error);
        }
    };

    return (
        <div className="relative h-screen bg-[#020617] overflow-hidden flex flex-col">

            {/* Floating HUD */}
            {progress && (
                <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="fixed top-4 right-4 z-50 flex gap-3 pointer-events-none"
                >
                    <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full shadow-2xl border border-white/10 flex items-center gap-2 pointer-events-auto">
                        <div className="bg-violet-600 rounded-full p-1">
                            <Zap className="w-4 h-4 text-white" fill="currentColor" />
                        </div>
                        <span className="font-black text-white text-lg">{progress.totalPoints || 0}</span>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full shadow-2xl border border-white/10 flex items-center gap-2 pointer-events-auto cursor-pointer hover:scale-105 transition-transform">
                        <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-400 overflow-hidden">
                            <img src={currentAvatar} alt="Avatar" className="w-full h-full object-cover" />
                        </div>
                        <span className="font-bold text-slate-200">{user.name}</span>
                    </div>
                </motion.div>
            )}

            {/* 3D World Map Area */}
            <div className="flex-1 w-full h-full relative cursor-move">
                <WorldMap3D />
            </div>

        </div >
    );
}
