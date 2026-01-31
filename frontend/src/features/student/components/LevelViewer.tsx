import { useState, useEffect } from "react";
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
  LogOut
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
        {/* Header Area with Subtle Glow */}
        <div className="h-24 flex items-center px-6 shrink-0 relative overflow-hidden group/header">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent opacity-0 group-hover/header:opacity-100 transition-opacity" />

          <div className="flex items-center gap-4 overflow-hidden relative z-10">
            <motion.div
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.6 }}
              className="w-12 h-12 bg-gradient-to-br from-cyan-400 via-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-[0_0_20px_rgba(34,211,238,0.3)] ring-1 ring-white/20"
            >
              <LayoutDashboard className="w-6 h-6 text-white" />
            </motion.div>
            {(isSidebarOpen || isMobile) && (
              <div className="flex flex-col">
                <span className="font-black text-xs tracking-[0.3em] text-cyan-400 uppercase leading-none mb-1">Academy</span>
                <span className="font-black text-xl tracking-tighter whitespace-nowrap bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-slate-500">
                  ARG ELITE
                </span>
              </div>
            )}
          </div>

          {isMobile && isSidebarOpen && (
            <Button variant="ghost" size="icon" className="ml-auto text-white/50 hover:text-white hover:bg-white/10" onClick={() => setIsSidebarOpen(false)}>
              <X className="w-6 h-6" />
            </Button>
          )}
        </div>

        {/* Navigation - Ultra Modern */}
        <nav className="flex-1 py-10 px-4 space-y-4 overflow-y-auto relative [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:none]">
          <div className={cn(
            "text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-6 px-4 flex items-center gap-2",
            !isSidebarOpen && "justify-center"
          )}>
            <div className="h-px bg-slate-800 flex-1 hidden md:block" />
            <span>MENU</span>
            <div className="h-px bg-slate-800 flex-1 hidden md:block" />
          </div>

          <div className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setViewMode(item.id as any);
                  if (isMobile) setIsSidebarOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-500 relative group overflow-hidden",
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
                <div className="relative z-10 flex items-center gap-4 w-full">
                  <item.icon className={cn(
                    "w-6 h-6 flex-shrink-0 transition-all duration-500",
                    viewMode === item.id ? "text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] scale-110" : "group-hover:text-slate-300"
                  )} />
                  {(isSidebarOpen || isMobile) && (
                    <span className={cn(
                      "font-black text-xs tracking-[0.15em] uppercase whitespace-nowrap transition-all duration-500",
                      viewMode === item.id ? "translate-x-1" : "group-hover:translate-x-1"
                    )}>
                      {item.label}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Levels Section */}
          <div className="mt-10 space-y-4">
            <div className={cn(
              "text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-4 px-4 flex items-center gap-2",
              !isSidebarOpen && "justify-center"
            )}>
              <div className="h-px bg-slate-800 flex-1 hidden md:block" />
              <span>NIVELES</span>
              <div className="h-px bg-slate-800 flex-1 hidden md:block" />
            </div>

            <div className="space-y-1.5 px-2">
              {levels.map((lvl) => (
                <button
                  key={lvl.id}
                  onClick={() => setLocation(`/level/${lvl.id}`)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-300 group relative",
                    String(levelId) === String(lvl.id) ? "bg-white/5 border border-white/10" : "hover:bg-white/5"
                  )}
                >
                  <div className={cn(
                    "w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 transition-all duration-500",
                    lvl.completed ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
                      String(levelId) === String(lvl.id) ? "bg-cyan-500 text-white shadow-[0_0_10px_rgba(6,182,212,0.5)]" : "bg-slate-800 text-slate-500"
                  )}>
                    {lvl.completed ? "✓" : lvl.id}
                  </div>
                  {(isSidebarOpen || isMobile) && (
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-wider truncate transition-colors duration-300",
                      String(levelId) === String(lvl.id) ? "text-cyan-400" : "text-slate-400 group-hover:text-slate-200"
                    )}>
                      {lvl.title}
                    </span>
                  )}

                  {/* Tooltip for levels when collapsed */}
                  {!isSidebarOpen && !isMobile && (
                    <div className="absolute left-[70px] bg-[#020617] text-white px-3 py-1.5 rounded-lg text-[9px] font-black tracking-widest uppercase opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all pointer-events-none shadow-2xl border border-white/10 whitespace-nowrap z-[110]">
                      Misión {lvl.id}: {lvl.title}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* User Stats / Footer Section */}
        <div className="p-6 border-t border-white/5 space-y-6 bg-black/20">
          <div className={cn(
            "flex items-center gap-4",
            !isSidebarOpen && !isMobile && "justify-center"
          )}>
            <div className="w-10 h-10 rounded-full border-2 border-cyan-500/30 p-0.5 overflow-hidden flex-shrink-0 ring-4 ring-cyan-500/10">
              <img src="https://ui-avatars.com/api/?name=Gabo+Toala&background=06b6d4&color=fff&bold=true" alt="Avatar" className="w-full h-full object-cover rounded-full" />
            </div>
            {(isSidebarOpen || isMobile) && (
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-black text-cyan-400 tracking-tighter uppercase leading-none">Agente Elite</span>
                <span className="text-sm font-black text-white truncate">Gabo Toala</span>
              </div>
            )}
          </div>

          <button
            onClick={() => setLocation('/dashboard')}
            className={cn(
              "w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-all duration-300 group ring-1 ring-transparent hover:ring-red-500/20",
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

        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-hidden relative text-slate-900 w-full h-full">
          <div className="w-full h-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={viewMode}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="w-full h-full"
              >
                {viewMode === 'rag' && <RagViewer levelId={levelId} onAddPoints={handleAddPoints} />}
                {viewMode === 'ha' && <HaViewer levelId={levelId} onAddPoints={handleAddPoints} />}
                {viewMode === 'pim' && <PimViewer levelId={levelId} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>;
}
