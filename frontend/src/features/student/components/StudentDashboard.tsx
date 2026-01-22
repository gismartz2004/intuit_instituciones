import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { Star, Zap, Play, Trophy, MapPin, Lock, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

// Assets
import zoneMalecon from "@/assets/gamification/zone_malecon.png";
import zonePenas from "@/assets/gamification/zone_penas.png";
import zoneSantaAna from "@/assets/gamification/zone_santa_ana.png";
import { OnboardingWizard } from "@/features/auth/components/OnboardingWizard";
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

const ZONES = [
  { id: 'malecon', name: 'Sector 1: Malecón 2000 Tech', bg: zoneMalecon, color: 'from-green-500 to-emerald-600' },
  { id: 'penas', name: 'Sector 2: Barrio Las Peñas Digital', bg: zonePenas, color: 'from-blue-500 to-indigo-600' },
  { id: 'santa_ana', name: 'Sector 3: Puerto Santa Ana Cyber', bg: zoneSantaAna, color: 'from-violet-500 to-purple-600' },
];

export default function StudentDashboard({ user }: StudentDashboardProps) {
  const [modules, setModules] = useState<any[]>([]);
  const [progress, setProgress] = useState<any>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [currentAvatar, setCurrentAvatar] = useState(avatarBoy);
  const [levelProgress, setLevelProgress] = useState<Record<number, any>>({});

  useEffect(() => {
    if (user?.id) {
      // Refresh user data to check onboarding status
      studentApi.getUserInfo(user.id)
        .then(userData => {
          if (!userData.onboardingCompleted) {
            setShowOnboarding(true);
          }
          if (userData.avatar && AVATAR_MAP[userData.avatar]) {
            setCurrentAvatar(AVATAR_MAP[userData.avatar]);
          }
        });

      fetchModules();
      fetchProgress();
      fetchLevelProgress();
    }
  }, [user]);

  const handleOnboardingComplete = (avatarId: string) => {
    setShowOnboarding(false);
    if (AVATAR_MAP[avatarId]) {
      setCurrentAvatar(AVATAR_MAP[avatarId]);
    }
    // Optimistically update local storage if needed, or just state
  };

  const fetchModules = async () => {
    try {
      const data = await studentApi.getModules(user.id);
      const mappedData = data.map((mod: any, idx: number) => ({
        ...mod,
        // Assign zone based on index mock mock
        zoneIndex: Math.min(Math.floor(idx / 2), 2),
        levels: mod.levels?.map((lvl: any, lIdx: number) => ({
          ...lvl,
          type: lIdx === 0 ? "start" : (lIdx === mod.levels.length - 1 ? "trophy" : "star")
        })) || []
      }));
      setModules(mappedData);
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

  const fetchLevelProgress = async () => {
    try {
      // Fetch progress for all modules
      const progressMap: Record<number, any> = {};
      for (const mod of modules) {
        const data = await studentApi.getModuleProgress(user.id, mod.id);
        data.forEach((level: any) => {
          progressMap[level.id] = level;
        });
      }
      setLevelProgress(progressMap);
    } catch (error) {
      console.error("Error fetching level progress:", error);
    }
  };

  // Group modules by zone
  const modulesByZone = ZONES.map((zone, zIdx) => ({
    ...zone,
    modules: modules.filter(m => m.zoneIndex === zIdx)
  }));

  return (
    <div className="relative h-screen bg-[#1a1b26] overflow-hidden flex flex-col">

      {/* Floating HUD */}
      {progress && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed top-24 right-4 md:top-4 md:right-4 z-50 flex gap-3 pointer-events-none"
        >
          <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-2xl border-2 border-slate-200 flex items-center gap-2 pointer-events-auto">
            <div className="bg-orange-500 rounded-full p-1">
              <Zap className="w-4 h-4 text-white" fill="currentColor" />
            </div>
            <span className="font-black text-orange-600 text-lg">{progress.totalPoints || 0}</span>
          </div>

          <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 md:px-4 md:py-2 rounded-full shadow-2xl border-2 border-slate-200 flex items-center gap-2 pointer-events-auto cursor-pointer hover:scale-105 transition-transform">
            <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-blue-100 border-2 border-blue-400 overflow-hidden">
              <img src={currentAvatar} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <span className="font-bold text-slate-700 text-sm hidden md:block">{user.name}</span>
          </div>
        </motion.div>
      )}

      {/* Main Scrollable Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar scroll-smooth">
        {modulesByZone.map((zoneData, zIdx) => (
          zoneData.modules.length > 0 && (
            <div key={zoneData.id} className="relative w-full min-h-screen flex flex-col items-center">

              {/* Zone Background */}
              <div
                className="absolute inset-0 bg-cover bg-center pointer-events-none z-0"
                style={{ backgroundImage: `url(${zoneData.bg})` }}
              >
                <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#1a1b26]/80" />
              </div>

              {/* Zone Marker */}
              <div className="sticky top-0 z-40 w-full flex justify-center py-6 pointer-events-none">
                <motion.div
                  initial={{ y: -50, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  className={`bg-gradient-to-r ${zoneData.color} text-white px-8 py-3 rounded-full font-black text-lg shadow-[0_10px_40px_rgba(0,0,0,0.5)] border-4 border-white/20 backdrop-blur-md flex items-center gap-2 uppercase tracking-wide`}
                >
                  <MapPin className="w-5 h-5" />
                  {zoneData.name}
                </motion.div>
              </div>

              {/* Modules in this Zone */}
              <div className="relative z-10 w-full max-w-2xl pt-20 pb-32 flex flex-col items-center gap-32">
                {zoneData.modules.map((mod: any, mIdx: number) => (
                  <div key={mod.id} className="w-full flex flex-col items-center">

                    {/* Module Signpost */}
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="bg-white/90 backdrop-blur-xl p-6 rounded-3xl shadow-2xl text-center mb-16 border-b-8 border-slate-200 max-w-sm relative group cursor-pointer"
                    >
                      <div className={`absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r ${zoneData.color} text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider`}>
                        Módulo {mod.id}
                      </div>
                      <h3 className="text-2xl font-black text-slate-800 uppercase leading-none mt-2">{mod.nombreModulo}</h3>
                    </motion.div>

                    {/* Levels Path */}
                    <div className="flex flex-col gap-12 items-center relative w-full">
                      {mod.levels?.map((lvl: any, lIdx: number) => {
                        // ZigZag Calculation (Global index feel)
                        const globalIdx = mIdx * 10 + lIdx;
                        // Reduced offset for mobile
                        const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
                        const baseOffset = isMobile ? 60 : 120;
                        const xOffset = globalIdx % 2 === 0 ? 0 : (globalIdx % 4 === 1 ? -baseOffset : baseOffset);
                        const isActive = zIdx === 0 && mIdx === 0 && lIdx === 0;

                        return (
                          <div key={lvl.id} className="relative group" style={{ transform: `translateX(${xOffset}px)` }}>
                            {/* Path Connector Line (Dotted) */}
                            {lIdx < mod.levels.length - 1 && (
                              <div
                                className="absolute top-1/2 left-1/2 w-1 h-32 border-l-4 border-dashed border-white/80 -z-10 origin-top"
                                style={{
                                  height: '140px',
                                  transform: `rotate(${globalIdx % 2 === 0 ? '-25deg' : '25deg'}) translateX(-50%)`
                                }}
                              />
                            )}

                            {isActive && (
                              <div className="absolute -top-24 left-1/2 -translate-x-1/2 z-30 w-28 h-28 pointer-events-none drop-shadow-2xl animate-bounce-slow">
                                <img src={currentAvatar} alt="You" className="w-full h-full object-contain" />
                              </div>
                            )}

                            <Link href={`/level/${lvl.id}`}>
                              <motion.button
                                whileHover={{ scale: 1.2, rotate: [0, -5, 5, 0] }}
                                whileTap={{ scale: 0.9 }}
                                className={cn(
                                  "w-20 h-20 rounded-full flex items-center justify-center border-4 shadow-[0_10px_20px_rgba(0,0,0,0.4)] relative z-20 transition-all",
                                  isActive
                                    ? "bg-gradient-to-b from-yellow-300 to-yellow-500 border-white shadow-[0_0_30px_rgba(234,179,8,0.6)]"
                                    : "bg-slate-100 border-slate-300 hover:border-white"
                                )}
                              >
                                {lvl.type === 'start' && <Play className={cn("w-8 h-8 fill-current", isActive ? "text-white" : "text-slate-400")} />}
                                {lvl.type === 'star' && <Star className={cn("w-8 h-8 fill-current", isActive ? "text-white" : "text-slate-400")} />}
                                {lvl.type === 'trophy' && <Trophy className={cn("w-8 h-8 fill-current", isActive ? "text-white" : "text-slate-400")} />}
                              </motion.button>
                            </Link>

                            {/* Level Number */}
                            <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 bg-white text-slate-900 w-8 h-8 rounded-full flex items-center justify-center font-black border-2 border-slate-200 shadow-md">
                              {lIdx + 1}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        ))}

        {/* Coming Soon Section */}
        <div className="w-full py-32 bg-[#0f172a] text-center text-slate-500">
          <MapPin className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="uppercase font-bold tracking-widest text-sm">Próximamente más sectores</p>
        </div>
      </div>


      <OnboardingWizard
        isOpen={showOnboarding}
        userId={user.id}
        onComplete={handleOnboardingComplete}
      />
    </div >
  );
}
