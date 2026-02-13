import { useState, useEffect, useRef } from "react";
import { useRoute, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  FileText,
  Video,
  Link as LinkIcon,
  Code,
  Play,
  ExternalLink,
  BookOpen,
  Layers,
  Menu,
  X,
  Target,
  LayoutDashboard,
  LogOut,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Clock,
  Maximize2,
  Minimize2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { studentApi } from "../services/student.api";
import RagViewer from "./RagViewer";
import HaViewer from "./HaViewer";
import PimViewer from "./PimViewer";
import EnhancedGamificationHud from "./EnhancedGamificationHud";
import { GamificationState } from "@/types/gamification";
import BdViewer from "@/features/specialist/components/BD/BdViewer";
import ItViewer from "@/features/specialist/components/IT/ItViewer";
import PicViewer from "@/features/specialist/components/PIC/PicViewer";

interface Content {
  id: number;
  tipo: string;
  urlRecurso: string;
  tituloEjercicio?: string;
  descripcionEjercicio?: string;
  codigoInicial?: string;
  lenguaje?: string;
}

export default function LevelViewer() {
  const [match, params] = useRoute("/level/:levelId");
  const [, setLocation] = useLocation();

  // Role-based redirection logic
  useEffect(() => {
    const userStr = localStorage.getItem('edu_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.role === "specialist" || user.role === "specialist_professor") {
          // If specialists land here, they should be redirected to their technical content
          // Specialists are now unified in LevelViewer, no redirection needed
          // setLocation(`/specialist/bd/${levelId}`);
        }
      } catch (e) {
        console.error("Error parsing user for redirection:", e);
      }
    }
  }, [setLocation, match, params]);
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Get user role for conditional logic
  const user = (() => {
    const userStr = localStorage.getItem('edu_user');
    try { return userStr ? JSON.parse(userStr) : null; } catch { return null; }
  })();
  const isSpecialist = user?.role === "specialist" || user?.role === "specialist_professor";

  const [viewMode, setViewMode] = useState<string>(isSpecialist ? "bd" : "rag");
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Default to collapsed for hover effect on desktop
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Gamification State
  const [gameState, setGameState] = useState<GamificationState>({
    points: 1250,
    level: 5,
    streak: 3,
    xp: 2100,
    xpToNextLevel: 900,
  });

  // Attendance Status
  const [attendance, setAttendance] = useState<{ asistio: boolean; recuperada?: boolean; fecha: string | null } | null>(null);

  // Detailed Level Progress Status
  const [detailedStatus, setDetailedStatus] = useState<any | null>(null);

  const handleAddPoints = (amount: number, reason: string) => {
    setGameState(prev => ({
      ...prev,
      points: prev.points + amount,
      lastAward: { amount, reason }
    }));
  };

  const levelId = match && params ? parseInt((params as any).levelId) : 1;

  const getStudentId = () => {
    const userStr = localStorage.getItem('edu_user');
    if (userStr) {
      try { return JSON.parse(userStr).id || 1; } catch { return 1; }
    }
    return 1;
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const stats = await studentApi.getGamificationStats(getStudentId());
        if (stats) {
          setGameState({
            points: stats.totalPoints || 0,
            level: stats.level || 1,
            streak: stats.streak || 0,
            xp: stats.xpTotal || 0,
            xpToNextLevel: stats.xpToNextLevel || 1000,
          });
        }
      } catch (error) {
        console.error("Error fetching gamification stats:", error);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const fetchAttendanceAndStatus = async () => {
      try {
        const studentId = getStudentId();
        const [attendanceData, statusData] = await Promise.all([
          studentApi.getAttendanceStatus(studentId, levelId),
          studentApi.getDetailedLevelStatus(studentId, levelId)
        ]);
        setAttendance(attendanceData);
        setDetailedStatus(statusData);

        // Auto-select first available mode if current one is not in statusData
        if (statusData) {
          const availableModes = Object.entries(statusData)
            .filter(([key, val]) => key !== 'attendance' && val !== null)
            .map(([key]) => key);

          if (availableModes.length > 0 && !statusData[viewMode]) {
            setViewMode(availableModes[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching attendance or status:", error);
      }
    };
    if (levelId) fetchAttendanceAndStatus();
  }, [levelId, viewMode]); // Re-fetch on viewMode change to update after submission

  useEffect(() => {
    // Check mobile screen size
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Only force close if it wasn't manually opened or on resize
      if (mobile) setIsSidebarOpen(false);
      else setIsSidebarOpen(false); // Defaulting to collapsed for hover effect
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const ragRef = useRef<any>(null);
  const haRef = useRef<any>(null);
  const pimRef = useRef<any>(null);
  const bdRef = useRef<any>(null);
  const itRef = useRef<any>(null);
  const picRef = useRef<any>(null);

  const [moduleLevels, setModuleLevels] = useState<any[]>([]);
  const [currentLevelData, setCurrentLevelData] = useState<any>(null);

  useEffect(() => {
    const fetchModuleData = async () => {
      try {
        const studentId = getStudentId();
        // 1. Get all modules to find which one this level belongs to
        const studentModules = await studentApi.getModules(studentId);

        let foundModuleId = null;
        for (const mod of studentModules) {
          // Check if mod has levels or fetch them
          // getStudentLevelProgress in backend takes (studentId, moduleId)
          const levels = await studentApi.getModuleProgress(studentId, mod.id);
          if (levels.find((l: any) => l.id === levelId)) {
            foundModuleId = mod.id;
            setModuleLevels(levels);
            setCurrentLevelData(levels.find((l: any) => l.id === levelId));
            break;
          }
        }
      } catch (error) {
        console.error("Error fetching module levels:", error);
      }
    };
    if (levelId) fetchModuleData();
  }, [levelId]);

  const handlePrev = () => {
    const modeRefs: Record<string, React.RefObject<any>> = {
      rag: ragRef,
      ha: haRef,
      pim: pimRef,
      bd: bdRef,
      it: itRef,
      pic: picRef
    };

    if (modeRefs[viewMode]?.current) {
      const result = modeRefs[viewMode].current.goPrev();
      if (result?.handled) return;
    }

    // Navigating between available modes in reverse
    const currentIndexInMenu = menuItems.findIndex(m => m.id === viewMode);
    if (currentIndexInMenu > 0) {
      setViewMode(menuItems[currentIndexInMenu - 1].id);
    } else {
      // Option: Go to previous level if available
      const currentIndex = moduleLevels.findIndex(l => l.id === levelId);
      if (currentIndex > 0) {
        setLocation(`/level/${moduleLevels[currentIndex - 1].id}`);
      }
    }
  };

  const handleNext = () => {
    const modeRefs: Record<string, React.RefObject<any>> = {
      rag: ragRef,
      ha: haRef,
      pim: pimRef,
      bd: bdRef,
      it: itRef,
      pic: picRef
    };

    if (modeRefs[viewMode]?.current) {
      const result = modeRefs[viewMode].current.goNext();
      if (result?.handled) return;
    }

    // Navigating between available modes
    const currentIndexInMenu = menuItems.findIndex(m => m.id === viewMode);
    if (currentIndexInMenu < menuItems.length - 1) {
      setViewMode(menuItems[currentIndexInMenu + 1].id);
    } else {
      // Option: Go to next level if available and unlocked
      const currentIndex = moduleLevels.findIndex(l => l.id === levelId);
      if (currentIndex < moduleLevels.length - 1) {
        const nextLevel = moduleLevels[currentIndex + 1];
        if (nextLevel.isUnlocked) {
          setLocation(`/level/${nextLevel.id}`);
        } else {
          toast({ title: "Nivel Bloqueado", description: "Debes completar el nivel actual para avanzar.", variant: "destructive" });
        }
      }
    }
  };

  const menuItems = [
    { id: 'rag', label: 'Guía RAG', shortLabel: 'RAG', color: 'text-cyan-400' },
    { id: 'ha', label: 'Hito HA', shortLabel: 'HA', color: 'text-purple-400' },
    { id: 'pim', label: 'Proyecto PIM', shortLabel: 'PIM', color: 'text-indigo-400' },
    { id: 'bd', label: 'Bloque Desarrollo', shortLabel: 'BD', color: 'text-violet-500' },
    { id: 'it', label: 'Iteración', shortLabel: 'IT', color: 'text-violet-500' },
    { id: 'pic', label: 'Innovación', shortLabel: 'PIC', color: 'text-violet-500' },
  ].filter(item => {
    if (isSpecialist) {
      // Specialists see their specific technical options
      return ['bd', 'it', 'pic'].includes(item.id);
    }
    return detailedStatus && detailedStatus[item.id] !== null;
  });

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-50">Cargando...</div>;

  return (
    <div className={cn(
      "min-h-screen flex overflow-hidden font-sans transition-colors duration-500 bg-slate-50"
    )}>

      {/* SIDEBAR - Ultra Modern Fixed with Hover */}
      <motion.aside
        initial={false}
        onMouseEnter={() => !isMobile && setIsSidebarOpen(true)}
        onMouseLeave={() => !isMobile && setIsSidebarOpen(false)}
        animate={{
          width: isFullscreen ? 0 : (isSidebarOpen ? (isMobile ? '100%' : 300) : (isMobile ? 0 : 88)),
          x: (isFullscreen || (isMobile && !isSidebarOpen)) ? -300 : 0,
          opacity: isFullscreen ? 0 : 1
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={cn(
          "bg-white text-slate-600 flex flex-col z-[999] border-r border-slate-200 fixed inset-y-0 left-0 shadow-2xl transition-transform duration-300 overflow-hidden",
          !isSidebarOpen && !isMobile && "items-center"
        )}
      >
        {/* Mobile Close Button - Only visible when open on mobile */}
        {isMobile && isSidebarOpen && (
          <div className="p-4 flex justify-end">
            <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-800 hover:bg-slate-100" onClick={() => setIsSidebarOpen(false)}>
              <X className="w-6 h-6" />
            </Button>
          </div>
        )}

        {/* Navigation - Centered & Refined */}
        <nav className="flex-1 flex flex-col justify-center px-4 space-y-4 overflow-y-auto relative [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:none]">
          <div className="space-y-4">
            {menuItems.map((item) => {
              const status = detailedStatus?.[item.id as keyof typeof detailedStatus]?.status || 'pending';
              const isSelected = viewMode === item.id;

              // Color Mapping
              const statusColors = {
                completed: 'text-emerald-600',
                pending: 'text-amber-500',
                missing: 'text-red-500'
              };

              const statusGlows = {
                completed: 'drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]',
                pending: 'drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]',
                missing: 'drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]'
              };

              const StatusIcon = status === 'completed' ? CheckCircle : (status === 'missing' ? X : Clock);

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setViewMode(item.id as any);
                    if (isMobile) setIsSidebarOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-center gap-4 px-4 py-5 rounded-2xl transition-all duration-500 relative group overflow-hidden",
                    isSelected
                      ? "text-violet-700 bg-violet-50 shadow-sm border border-violet-100"
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                  )}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="navHighlight"
                      className="absolute inset-0 bg-violet-50 border-l-4 border-violet-600 z-0"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <div className={cn(
                    "relative z-10 flex items-center w-full transition-all duration-500",
                    (isSidebarOpen || isMobile) ? "gap-4 justify-start" : "justify-center"
                  )}>
                    <AnimatePresence mode="wait">
                      {!(isSidebarOpen || isMobile) ? (
                        <motion.div
                          key="short"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="relative flex flex-col items-center"
                        >
                          <span className={cn(
                            "text-[10px] font-black tracking-tighter transition-all duration-300",
                            isSelected ? "text-violet-700" : "text-slate-500"
                          )}>
                            {item.shortLabel}
                          </span>
                          {status === 'completed' && !isSelected && (
                            <div className="absolute -top-1 -right-2 w-2 h-2 bg-emerald-500 rounded-full border border-white" />
                          )}
                        </motion.div>
                      ) : (
                        <motion.div
                          key="full"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="flex items-center gap-4 w-full"
                        >
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black border transition-all duration-500",
                            isSelected
                              ? "text-violet-600 border-violet-200 bg-white shadow-sm"
                              : "text-slate-400 border-slate-200 bg-slate-50 group-hover:border-slate-300"
                          )}>
                            {item.shortLabel}
                          </div>
                          <span className={cn(
                            "font-black text-xs tracking-[0.2em] uppercase whitespace-nowrap transition-all duration-500 flex-1",
                            isSelected ? "translate-x-1" : "group-hover:translate-x-1"
                          )}>
                            {item.label}
                          </span>
                          <StatusIcon className={cn(
                            "w-4 h-4 ml-auto",
                            status === 'completed' ? "text-emerald-500" : (status === 'missing' ? "text-red-400" : "text-amber-400")
                          )} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Exit Button */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/50">
          <button
            onClick={() => setLocation('/dashboard')}
            className={cn(
              "w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-slate-500 hover:bg-red-50 hover:text-red-600 hover:border-red-100 border border-transparent transition-all duration-300 group",
              (!isSidebarOpen && !isMobile) && "justify-center"
            )}
          >
            <LogOut className="w-5 h-5 flex-shrink-0 group-hover:-translate-x-1 transition-transform" />
            {(isSidebarOpen || isMobile) && <span className="font-black text-[10px] tracking-[0.2em] uppercase">Salir</span>}
          </button>
        </div>
      </motion.aside>

      {/* OVERLAY FOR MOBILE SIDEBAR */}
      <AnimatePresence>
        {isMobile && isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[55]"
          />
        )}
      </AnimatePresence>

      {/* MOBILE TRIGGER */}
      {
        isMobile && !isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="fixed left-4 top-4 bg-white text-slate-800 w-12 h-12 rounded-xl flex items-center justify-center shadow-lg border border-slate-100 z-[70] md:hidden"
          >
            <Menu className="w-6 h-6" />
          </button>
        )
      }

      {/* MAIN CONTENT AREA */}
      <main
        className={cn(
          "flex-1 flex flex-col h-screen overflow-hidden relative transition-all duration-500 bg-slate-50",
          !isMobile && !isFullscreen && (isSidebarOpen ? "pl-[300px]" : "pl-[88px]"),
          isFullscreen && "pl-0"
        )}
      >

        {!isFullscreen && (
          <header className={cn(
            "h-24 flex-shrink-0 px-24 flex items-center justify-between border-b z-30 shadow-sm relative transition-colors duration-500 bg-white border-slate-200"
          )}>
            <div className="flex items-center gap-8">
              <h2 className={cn(
                "font-black text-xl tracking-tight uppercase italic text-slate-800"
              )}>
                {menuItems.find(i => i.id === viewMode)?.label || "Módulo"}
              </h2>

              {isSpecialist && (
                <div className="flex items-center gap-6 ml-6 pl-6 border-l border-slate-200">
                  <div className="text-right">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Paso Actual</p>
                    <p className="text-lg font-black text-slate-800 italic">
                      {viewMode === 'bd' ? (bdRef.current?.getCurrentStep?.() || 1) :
                        viewMode === 'it' ? (itRef.current?.getCurrentStep?.() || 1) :
                          (picRef.current?.getCurrentStep?.() || 1)} / {viewMode === 'bd' ? 12 : 10}
                    </p>
                  </div>
                </div>
              )}

              {attendance?.asistio && (
                <Badge className="bg-green-500 text-white border-0 shadow-lg shadow-green-200 ml-4 px-3 py-1">
                  <Target className="w-3 h-3 mr-1" /> ASISTENCIA REGISTRADA
                </Badge>
              )}
              {attendance?.recuperada && (
                <Badge className="bg-blue-500 text-white border-0 shadow-lg shadow-blue-200 ml-4 px-3 py-1 animate-pulse">
                  <Target className="w-3 h-3 mr-1" /> ASISTENCIA RECUPERADA
                </Badge>
              )}
              {!attendance?.asistio && !attendance?.recuperada && attendance && (
                <Badge variant="destructive" className="ml-4 animate-bounce px-3 py-1">
                  <X className="w-3 h-3 mr-1" /> CLASE NO ASISTIDA
                </Badge>
              )}
            </div>
            <EnhancedGamificationHud state={gameState} className="self-start mt-4" />
          </header>
        )}

        <div className={cn(
          "flex-1 overflow-hidden relative w-full flex transition-colors duration-500 bg-slate-50/50",
          isFullscreen ? "h-screen" : "h-[calc(100vh-96px)]"
        )}>
          {/* Left Navigation Button */}
          <div className="hidden md:flex items-center px-4 z-40">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrev}
              className="w-12 h-12 rounded-full bg-white/50 backdrop-blur-md shadow-lg border border-slate-200 text-slate-400 hover:text-cyan-500 hover:bg-white transition-all duration-300"
            >
              <ChevronLeft className="w-8 h-8" />
            </Button>
          </div>

          {/* Main Focused Content Area */}
          <div className={cn(
            "flex-1 w-full mx-auto relative overflow-hidden flex flex-col",
            isFullscreen ? "max-w-none px-0 py-0" : "max-w-7xl px-4 py-2"
          )}>
            <AnimatePresence mode="wait">
              <motion.div
                key={`${levelId}-${viewMode}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="w-full h-full will-change-transform"
              >
                {viewMode === 'rag' && <RagViewer ref={ragRef} levelId={levelId} onAddPoints={handleAddPoints} hasAttended={attendance?.asistio || attendance?.recuperada} />}
                {viewMode === 'ha' && <HaViewer ref={haRef} levelId={levelId} onAddPoints={handleAddPoints} hasAttended={attendance?.asistio || attendance?.recuperada} />}
                {viewMode === 'pim' && <PimViewer ref={pimRef} levelId={levelId} />}
                {viewMode === 'bd' && <BdViewer ref={bdRef} levelId={levelId} isFullscreen={isFullscreen} />}
                {viewMode === 'it' && <ItViewer ref={itRef} levelId={levelId} isFullscreen={isFullscreen} />}
                {viewMode === 'pic' && <PicViewer ref={picRef} levelId={levelId} isFullscreen={isFullscreen} />}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Navigation Button */}
          <div className="hidden md:flex items-center px-4 z-40">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNext}
              className="w-12 h-12 rounded-full bg-white/50 backdrop-blur-md shadow-lg border border-slate-200 text-slate-400 hover:text-cyan-500 hover:bg-white transition-all duration-300"
            >
              <ChevronRight className="w-8 h-8" />
            </Button>
          </div>
        </div>

        {/* Floating Fullscreen Toggle Button - Only for Specialist Viewers */}
        {['bd', 'it', 'pic'].includes(viewMode) && (
          <motion.div
            initial={{ scale: 0, y: 20 }}
            animate={{
              scale: 1,
              y: [0, -10, 0],
            }}
            transition={{
              scale: { duration: 0.3 },
              y: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
            className="fixed bottom-8 right-8 z-[1000]"
          >
            <Button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className={cn(
                "w-16 h-16 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center p-0",
                isFullscreen
                  ? "bg-slate-800 hover:bg-slate-900 text-white"
                  : "bg-violet-600 hover:bg-violet-700 text-white ring-4 ring-violet-200"
              )}
            >
              {isFullscreen ? (
                <Minimize2 className="w-8 h-8" />
              ) : (
                <Maximize2 className="w-8 h-8" />
              )}
            </Button>
          </motion.div>
        )}
      </main>
    </div>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>;
}
