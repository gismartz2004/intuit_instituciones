import { useState, useEffect, useRef } from "react";
import { useRoute, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { studentApi } from "../services/student.api";
import RagViewer from "./RagViewer";
import HaViewer from "./HaViewer";
import PimViewer from "./PimViewer";
import EnhancedGamificationHud from "./EnhancedGamificationHud";
import { GamificationState } from "@/types/gamification";

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
  const [loading, setLoading] = useState(false); // Set to false initially as we don't fetch contents here anymore
  const [viewMode, setViewMode] = useState<"rag" | "ha" | "pim">("rag");
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Default to collapsed for hover effect on desktop

  // Gamification State
  const [gameState, setGameState] = useState<GamificationState>({
    points: 1250,
    level: 5,
    streak: 3,
    xp: 2100,
    xpToNextLevel: 900,
  });

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

  const handlePrev = () => {
    if (viewMode === 'rag' && ragRef.current) {
      ragRef.current.goPrev();
      return;
    }

    if (viewMode === 'ha' && haRef.current) {
      const result = haRef.current.goPrev();
      if (result?.handled) return;
    }

    if (viewMode === 'pim' && pimRef.current) {
      const result = pimRef.current.goPrev();
      if (result?.handled) return;
    }

    // Logic for other modes
    if (viewMode === 'pim') {
      setViewMode('ha');
    } else if (viewMode === 'ha') {
      setViewMode('rag');
    }
  };

  const handleNext = () => {
    if (viewMode === 'rag' && ragRef.current) {
      ragRef.current.goNext();
      return;
    }

    if (viewMode === 'ha' && haRef.current) {
      const result = haRef.current.goNext();
      if (result?.handled) return;
    }

    if (viewMode === 'pim' && pimRef.current) {
      const result = pimRef.current.goNext();
      if (result?.handled) return;
    }

    // Logic: RAG -> HA -> PIM
    if (viewMode === 'rag') {
      setViewMode('ha');
    } else if (viewMode === 'ha') {
      setViewMode('pim');
    }
  };

  const menuItems = [
    { id: 'rag', label: 'Guía RAG', icon: BookOpen, color: 'text-cyan-400' },
    { id: 'ha', label: 'Hito HA', icon: Target, color: 'text-purple-400' },
    { id: 'pim', label: 'Proyecto PIM', icon: Layers, color: 'text-indigo-400' },
  ];

  const levels = [
    { id: 1, title: 'Conceptos Básicos', completed: true },
    { id: 2, title: 'Condicionales y Push', completed: true },
    { id: 3, title: 'Sensores de Proximidad', completed: false, active: true },
    { id: 4, title: 'Pantallas LCD', completed: false },
    { id: 5, title: 'Motores y PWM', completed: false },
  ];

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-50">Cargando...</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden font-sans">

      {/* SIDEBAR - Ultra Modern Fixed with Hover */}
      <motion.aside
        initial={false}
        onMouseEnter={() => !isMobile && setIsSidebarOpen(true)}
        onMouseLeave={() => !isMobile && setIsSidebarOpen(false)}
        animate={{
          width: isSidebarOpen ? (isMobile ? '100%' : 300) : (isMobile ? 0 : 88),
          x: isMobile && !isSidebarOpen ? -300 : 0
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={cn(
          "bg-slate-950/95 backdrop-blur-2xl text-white flex flex-col z-[999] border-r border-white/5 fixed inset-y-0 left-0 shadow-2xl transition-transform duration-300 overflow-hidden",
          !isSidebarOpen && !isMobile && "items-center"
        )}
      >
        {/* Mobile Close Button - Only visible when open on mobile */}
        {isMobile && isSidebarOpen && (
          <div className="p-4 flex justify-end">
            <Button variant="ghost" size="icon" className="text-white/50 hover:text-white hover:bg-white/10" onClick={() => setIsSidebarOpen(false)}>
              <X className="w-6 h-6" />
            </Button>
          </div>
        )}

        {/* Navigation - Centered & Refined */}
        <nav className="flex-1 flex flex-col justify-center px-4 space-y-4 overflow-y-auto relative [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:none]">
          <div className="space-y-4">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setViewMode(item.id as any);
                  if (isMobile) setIsSidebarOpen(false);
                }}
                className={cn(
                  "w-full flex items-center justify-center gap-4 px-4 py-5 rounded-2xl transition-all duration-500 relative group overflow-hidden",
                  viewMode === item.id
                    ? "text-white"
                    : "text-slate-500 hover:text-slate-200"
                )}
              >
                {viewMode === item.id && (
                  <motion.div
                    layoutId="navHighlight"
                    className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-transparent border-l-2 border-cyan-400 z-0"
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
                      <motion.span
                        key="short"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className={cn(
                          "font-black text-xs tracking-tighter transition-colors duration-500",
                          viewMode === item.id ? "text-cyan-400" : "text-slate-500 group-hover:text-slate-300"
                        )}
                      >
                        {item.id.toUpperCase()}
                      </motion.span>
                    ) : (
                      <motion.div
                        key="full"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="flex items-center gap-4"
                      >
                        <item.icon className={cn(
                          "w-6 h-6 flex-shrink-0 transition-all duration-500",
                          viewMode === item.id ? "text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] scale-110" : "group-hover:text-slate-300"
                        )} />
                        <span className={cn(
                          "font-black text-xs tracking-[0.2em] uppercase whitespace-nowrap transition-all duration-500",
                          viewMode === item.id ? "translate-x-1" : "group-hover:translate-x-1"
                        )}>
                          {item.label}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </button>
            ))}
          </div>
        </nav>

        {/* Exit Button */}
        <div className="p-6 border-t border-white/5 bg-black/20">
          <button
            onClick={() => setLocation('/dashboard')}
            className={cn(
              "w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-all duration-300 group ring-1 ring-transparent hover:ring-red-500/20",
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55]"
          />
        )}
      </AnimatePresence>

      {/* MOBILE TRIGGER */}
      {isMobile && !isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="fixed left-4 top-4 bg-slate-900 text-white w-12 h-12 rounded-xl flex items-center justify-center shadow-xl z-[70] md:hidden"
        >
          <Menu className="w-6 h-6" />
        </button>
      )}

      {/* MAIN CONTENT AREA */}
      <main
        className={cn(
          "flex-1 flex flex-col h-screen overflow-hidden relative bg-slate-50 transition-all duration-500",
          !isMobile && (isSidebarOpen ? "pl-[300px]" : "pl-[88px]")
        )}
      >

        {/* Top Bar for Gamification HUD */}
        <header className="h-24 flex-shrink-0 px-24 flex items-center justify-between bg-white border-b border-slate-200 z-30 shadow-sm relative">
          <div className="flex items-center gap-8">
            <div className="flex flex-col">
              <Badge variant="outline" className="w-fit bg-slate-50 text-slate-500 border-slate-200 px-2 py-0.5 text-[10px] mb-1 font-black uppercase">
                Misión {levelId}
              </Badge>
              <h2 className="font-black text-slate-800 text-xl tracking-tight">
                {menuItems.find(i => i.id === viewMode)?.label || "Módulo"}
              </h2>
            </div>
          </div>
          <EnhancedGamificationHud state={gameState} />
        </header>

        {/* Main Content Fixed Area */}
        <div className="flex-1 overflow-hidden relative text-slate-900 w-full flex bg-slate-50/50 h-[calc(100vh-96px)]">
          {/* Left Navigation Button */}
          <div className="hidden md:flex items-center px-4 z-40">
            <Button
              variant="ghost"
              size="icon"
              disabled={levelId <= 1 && viewMode === 'rag'}
              onClick={handlePrev}
              className={cn(
                "w-12 h-12 rounded-full bg-white/50 backdrop-blur-md shadow-lg border border-slate-200 text-slate-400 hover:text-cyan-500 hover:bg-white transition-all duration-300",
                levelId <= 1 && viewMode === 'rag' && "opacity-20 cursor-not-allowed"
              )}
            >
              <ChevronLeft className="w-8 h-8" />
            </Button>
          </div>

          {/* Main Focused Content Area */}
          <div className="flex-1 w-full max-w-6xl mx-auto px-4 relative py-2 overflow-hidden flex flex-col">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${levelId}-${viewMode}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="w-full h-full will-change-transform"
              >
                {viewMode === 'rag' && <RagViewer ref={ragRef} levelId={levelId} onAddPoints={handleAddPoints} />}
                {viewMode === 'ha' && <HaViewer ref={haRef} levelId={levelId} onAddPoints={handleAddPoints} />}
                {viewMode === 'pim' && <PimViewer ref={pimRef} levelId={levelId} />}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Navigation Button */}
          <div className="hidden md:flex items-center px-4 z-40">
            <Button
              variant="ghost"
              size="icon"
              disabled={levelId >= levels.length && viewMode === 'pim'}
              onClick={handleNext}
              className={cn(
                "w-12 h-12 rounded-full bg-white/50 backdrop-blur-md shadow-lg border border-slate-200 text-slate-400 hover:text-cyan-500 hover:bg-white transition-all duration-300",
                levelId >= levels.length && viewMode === 'pim' && "opacity-20 cursor-not-allowed"
              )}
            >
              <ChevronRight className="w-8 h-8" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>;
}
