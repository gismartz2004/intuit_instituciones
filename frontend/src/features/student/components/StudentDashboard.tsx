import { useState, useEffect, useRef } from "react";
import { Link, useRoute } from "wouter";
import { Star, Zap, Play, Trophy, MapPin, Lock, CheckCircle, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

// Assets
import zoneMalecon from "@/assets/gamification/zone_malecon.png";
import zonePenas from "@/assets/gamification/zone_penas.png";
import zoneSantaAna from "@/assets/gamification/zone_santa_ana.png";
import { OnboardingWizard } from "@/features/auth/components/OnboardingWizard";
import { studentApi } from '../services/student.api';
import { BackgroundMusic } from "./BackgroundMusic";

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

/**
 * PATH SVG DINÁMICO CON EFECTO DE ENERGÍA
 */
function CurvyPath({ points, isActive }: { points: { x: number, y: number }[], isActive: boolean }) {
  if (points.length < 2) return null;

  // Generar el path d-string usando curvas de Bezier suaves
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const midX = (p0.x + p1.x) / 2;
    d += ` C ${midX} ${p0.y}, ${midX} ${p1.y}, ${p1.x} ${p1.y}`;
  }

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible">
      {/* Sombra del camino */}
      <path
        d={d}
        fill="none"
        stroke="black"
        strokeWidth="12"
        strokeLinecap="round"
        strokeOpacity="0.2"
        className="blur-md"
      />
      {/* Camino base */}
      <path
        d={d}
        fill="none"
        stroke={isActive ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.1)"}
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray="12 12"
      />
      {/* Línea de energía fluyendo (solo si está activo) */}
      {isActive && (
        <motion.path
          d={d}
          fill="none"
          stroke="url(#energyGradient)"
          strokeWidth="6"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
      )}
      <defs>
        <linearGradient id="energyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0" />
          <stop offset="50%" stopColor="#22d3ee" stopOpacity="1" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/**
 * COMPONENTE DE DECORACIÓN DE FONDO
 */
function BackgroundDecor() {
  return (
    <div className="absolute inset-0 pointer-events-none opacity-30 select-none">
      <motion.div
        animate={{
          y: [0, -20, 0],
          rotate: [0, 5, 0]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[10%] left-[5%] w-32 h-32 bg-cyan-500/10 blur-3xl rounded-full"
      />
      <motion.div
        animate={{
          y: [0, 30, 0],
          rotate: [0, -10, 0]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[20%] right-[10%] w-64 h-64 bg-blue-500/10 blur-3xl rounded-full"
      />
      {/* Satélite simulado */}
      <motion.div
        animate={{ x: [-100, window.innerWidth + 100], y: [100, 300] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute top-20 w-12 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent blur-[1px]"
      />
    </div>
  );
}

interface StudentDashboardProps {
  user: {
    name: string;
    id: string;
    role: string;
    avatar?: string;
    planId?: number; // Added planId
    onboardingCompleted?: boolean;
  };
}

const ZONES = [
  { id: 'malecon', name: 'Sector 1: Malecón 2000 Tech', bg: zoneMalecon, color: 'from-green-500 to-emerald-600' },
  { id: 'penas', name: 'Sector 2: Barrio Las Peñas Digital', bg: zonePenas, color: 'from-blue-500 to-indigo-600' },
  { id: 'santa_ana', name: 'Sector 3: Puerto Santa Ana Cyber', bg: zoneSantaAna, color: 'from-violet-500 to-purple-600' },
];

export default function StudentDashboard({ user }: StudentDashboardProps) {
  const { toast } = useToast();
  const [match, params] = useRoute("/dashboard/module/:moduleId");
  const moduleIdFromRoute = match && params ? parseInt((params as any).moduleId) : null;

  const [modules, setModules] = useState<any[]>([]);
  const [progress, setProgress] = useState<any>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [currentAvatar, setCurrentAvatar] = useState(avatarBoy);
  const [levelProgress, setLevelProgress] = useState<Record<number, any>>({});
  const [userData, setUserData] = useState<any>(null); // Storing full user data

  useEffect(() => {
    if (user?.id) {
      // Refresh user data to check onboarding status and plan
      studentApi.getUserInfo(user.id)
        .then(data => {
          setUserData(data);
          if (!data.onboardingCompleted) {
            setShowOnboarding(true);
          }
          if (data.avatar && AVATAR_MAP[data.avatar]) {
            setCurrentAvatar(AVATAR_MAP[data.avatar]);
          }
        });

      fetchModules();
      fetchProgress();
    }
  }, [user]);

  // New effect to fetch progress ONLY after modules are loaded
  useEffect(() => {
    if (modules.length > 0) {
      fetchLevelProgress();
    }
  }, [modules, moduleIdFromRoute]); // Re-fetch if modules or route changes

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
      // Fetch progress only for relevant modules
      const progressMap: Record<number, any> = {};
      const modulesToFetch = moduleIdFromRoute
        ? modules.filter(m => m.id === moduleIdFromRoute)
        : modules;

      for (const mod of modulesToFetch) {
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

  // Group modules by zone, filtered by moduleId if present
  const filteredModules = moduleIdFromRoute
    ? modules.filter(m => m.id === moduleIdFromRoute)
    : modules;

  const modulesByZone = ZONES.map((zone, zIdx) => ({
    ...zone,
    modules: filteredModules.filter(m => m.zoneIndex === zIdx)
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

      {/* Back to Mundos button */}
      <Link href="/dashboard">
        <motion.button
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          whileHover={{ x: 5, scale: 1.05 }}
          className="fixed top-24 left-4 md:top-6 md:left-6 z-50 bg-white/10 backdrop-blur-xl px-6 py-3 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-white/20 flex items-center gap-3 hover:bg-white/20 transition-all cursor-pointer group overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-cyan-400/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="bg-white/10 p-2 rounded-xl group-hover:bg-blue-500 transition-colors">
            <ArrowLeft className="w-5 h-5 text-white group-hover:-translate-x-1 transition-transform" />
          </div>
          <span className="font-black text-white text-sm tracking-widest uppercase">Mundos</span>
        </motion.button>
      </Link>

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
                <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />
                <div className="absolute inset-0 bg-gradient-to-b from-[#1a1b26]/50 via-transparent to-[#1a1b26]/80" />
              </div>

              <BackgroundDecor />

              {/* Zone Marker */}
              <div className="sticky top-0 z-40 w-full flex justify-center py-6 pointer-events-none">
                <motion.div
                  initial={{ y: -50, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  className={`bg-slate-900/40 backdrop-blur-xl text-white px-8 py-3 rounded-full font-black text-lg shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-white/10 flex items-center gap-2 uppercase tracking-wide`}
                >
                  <MapPin className="w-5 h-5 text-cyan-400" />
                  {zoneData.name}
                </motion.div>
              </div>

              {/* Levels Path */}
              <div className="relative z-10 w-full max-w-4xl pt-20 pb-32 flex flex-col items-center">
                {zoneData.modules.map((mod: any, mIdx: number) => {
                  // Calcular posiciones de los nodos para el SVG
                  const modLevels = mod.levels || [];
                  const pathPoints = modLevels.map((_: any, lIdx: number) => {
                    const globalIdx = mIdx * 10 + lIdx;
                    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
                    const baseOffset = isMobile ? 60 : 160;
                    const xOffset = globalIdx % 2 === 0 ? 0 : (globalIdx % 4 === 1 ? -baseOffset : baseOffset);
                    // Aproximación del centro del contenedor (ancho_max_4xl = 896px / 2 = 448px)
                    return { x: 448 + xOffset, y: 100 + (lIdx * 180) };
                  });

                  return (
                    <div key={mod.id} className="w-full flex flex-col items-center relative min-h-[800px]">
                      {/* SVG Path Dinámico */}
                      <CurvyPath points={pathPoints} isActive={true} />

                      <div className="flex flex-col gap-32 items-center relative w-full pt-16">
                        {modLevels.map((lvl: any, lIdx: number) => {
                          const globalIdx = mIdx * 10 + lIdx;
                          const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
                          const baseOffset = isMobile ? 60 : 160;
                          const xOffset = globalIdx % 2 === 0 ? 0 : (globalIdx % 4 === 1 ? -baseOffset : baseOffset);

                          const levelsInMod = mod.levels || [];
                          const firstIncompleteIdx = levelsInMod.findIndex((l: any) => !levelProgress[l.id]?.completado);
                          const activeIdx = firstIncompleteIdx === -1 ? levelsInMod.length - 1 : firstIncompleteIdx;

                          const currentLevelProgress = levelProgress[lvl.id];

                          if (!currentLevelProgress) {
                            return <div key={lvl.id} className="h-20 w-20" />;
                          }

                          // Extract flags from progress
                          const isCompleted = !!currentLevelProgress?.completado;
                          const isUnlockedByTime = !!currentLevelProgress?.isUnlockedByTime;
                          const isManuallyBlocked = !!currentLevelProgress?.isManuallyBlocked;

                          // Final availability check: 
                          // 1. Must NOT be manually blocked
                          // 2. Must be unlocked by time
                          // 3. Must be the first level OR the previous level must be completed
                          const isPreviousCompleted = lIdx === 0 || !!levelProgress[mod.levels[lIdx - 1].id]?.completado;
                          const isSequenceLocked = !isPreviousCompleted;

                          const isAvailable = !!currentLevelProgress?.isUnlocked && !isManuallyBlocked && isUnlockedByTime && !isSequenceLocked;

                          const isActive = lIdx === activeIdx && isAvailable;

                          return (
                            <div key={lvl.id} className="relative group" style={{ transform: `translateX(${xOffset}px)` }}>

                              {isActive && (
                                <motion.div
                                  layoutId="avatar-glow"
                                  className="absolute -top-32 left-1/2 -translate-x-1/2 z-30 w-36 h-36 pointer-events-none"
                                >
                                  <motion.div
                                    animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="absolute inset-0 bg-cyan-400 rounded-full blur-3xl"
                                  />
                                  <img src={currentAvatar} alt="You" className="w-full h-full object-contain relative z-10" />
                                </motion.div>
                              )}

                              <Link href={isAvailable ? `/level/${lvl.id}` : "#"}>
                                <motion.button
                                  whileHover={isAvailable ? { scale: 1.15, rotate: 5 } : {}}
                                  whileTap={isAvailable ? { scale: 0.95 } : {}}
                                  className={cn(
                                    "w-24 h-24 rounded-[2rem] flex items-center justify-center border-4 shadow-2xl relative z-20 transition-all",
                                    isActive
                                      ? "bg-slate-900 border-cyan-400 shadow-[0_0_40px_rgba(34,211,238,0.4)]"
                                      : isCompleted
                                        ? "bg-slate-900 border-emerald-400/50 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                                        : isManuallyBlocked || !isUnlockedByTime || isSequenceLocked
                                          ? "bg-slate-800 border-slate-700 opacity-60 grayscale cursor-not-allowed"
                                          : "bg-slate-900 border-slate-700 hover:border-slate-500"
                                  )}
                                  onClick={(e) => {
                                    if (!isAvailable) {
                                      e.preventDefault();
                                      if (isManuallyBlocked) {
                                        toast({ title: "Acceso Restringido", description: "Este nivel ha sido bloqueado por el profesor.", variant: "destructive" });
                                      } else if (!isUnlockedByTime) {
                                        toast({ title: "Nivel No Disponible", description: `Este nivel se desbloqueará el día ${currentLevelProgress?.daysRequired}.`, variant: "default" });
                                      } else if (isSequenceLocked) {
                                        toast({ title: "Secuencia Bloqueada", description: "Debes completar el nivel anterior para poder avanzar.", variant: "destructive" });
                                      }
                                    }
                                  }}
                                >
                                  {(isManuallyBlocked || !isUnlockedByTime || isSequenceLocked) ? (
                                    <Lock className="w-8 h-8 text-slate-500" />
                                  ) : (
                                    <div className="flex flex-col items-center gap-1">
                                      {lvl.type === 'start' && <Play className={cn("w-10 h-10 fill-current", (isActive || isCompleted) ? "text-white" : "text-slate-600")} />}
                                      {lvl.type === 'star' && <Star className={cn("w-10 h-10 fill-current", (isActive || isCompleted) ? "text-white" : "text-slate-600")} />}
                                      {lvl.type === 'trophy' && <Trophy className={cn("w-10 h-10 fill-current", (isActive || isCompleted) ? "text-white" : "text-slate-600")} />}
                                    </div>
                                  )}
                                </motion.button>
                              </Link>

                              {/* Level Number / Status Badge */}
                              <div className={cn(
                                "absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 w-10 h-10 rounded-2xl flex items-center justify-center font-black border-2 shadow-xl transition-all z-30",
                                isCompleted ? "bg-emerald-500 text-white border-white/20" :
                                  (isManuallyBlocked || !isUnlockedByTime || isSequenceLocked) ? "bg-slate-700 text-slate-400 border-slate-600" :
                                    "bg-white text-slate-900 border-slate-200"
                              )}>
                                {isCompleted ? <CheckCircle className="w-6 h-6" /> :
                                  (isManuallyBlocked || !isUnlockedByTime || isSequenceLocked) ? <Lock className="w-5 h-5" /> :
                                    (lIdx + 1)}
                              </div>

                              {/* Unlock Note Tooltip */}
                              <AnimatePresence>
                                {(isSequenceLocked || isManuallyBlocked || !isUnlockedByTime) && !isCompleted && (
                                  <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute -bottom-14 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md text-[9px] font-black px-3 py-1.5 rounded-lg whitespace-nowrap z-30 border border-white/10 uppercase tracking-widest shadow-xl"
                                  >
                                    <span className={isManuallyBlocked || isSequenceLocked ? "text-red-400" : "text-cyan-400"}>
                                      {isManuallyBlocked ? "Restringido" : (isSequenceLocked ? "Bloqueado" : `Día ${currentLevelProgress?.daysRequired}`)}
                                    </span>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
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

      <BackgroundMusic />

      <OnboardingWizard
        isOpen={showOnboarding}
        userId={user.id}
        onComplete={handleOnboardingComplete}
      />
    </div >
  );
}
