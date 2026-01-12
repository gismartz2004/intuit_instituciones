import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { Star, Lock, Check, Zap, Play, Trophy, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// Assets
import mapBg from "@/assets/gamification/map_bg.png";
import avatarBoy from "@/assets/gamification/avatar_boy.png";

interface StudentDashboardProps {
  user: {
    name: string;
    id: string;
    role: string;
  };
}

export default function StudentDashboard({ user }: StudentDashboardProps) {
  const [modules, setModules] = useState<any[]>([]);
  const [progress, setProgress] = useState<any>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?.id) {
      fetchModules();
      fetchProgress();
    }
  }, [user]);

  // Scroll to active level on load
  useEffect(() => {
    if (modules.length > 0) {
      setTimeout(() => {
        const activeNode = document.querySelector('.active-level-node');
        if (activeNode) {
          activeNode.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 500);
    }
  }, [modules]);

  const fetchModules = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/student/${user.id}/modules`);
      if (res.ok) {
        const data = await res.json();
        const mappedData = data.map((mod: any, idx: number) => ({
          ...mod,
          levels: mod.levels?.map((lvl: any, lIdx: number) => ({
            ...lvl,
            // Map ZigZag Logic: Alternating Left/Right offsets
            // Base center is 0. 
            // 0 -> 0 (Center)
            // 1 -> -100 (Left)
            // 2 -> 100 (Right)
            // Simple Sine wave pattern
            xOffset: Math.sin(lIdx) * 120,
            status: "active", // Logic should come from backend, assuming active for demo if not provided
            type: lIdx === 0 ? "start" : (lIdx === mod.levels.length - 1 ? "trophy" : "star")
          })) || []
        }));
        setModules(mappedData);
      }
    } catch (error) {
      console.error("Error fetching student modules:", error);
    }
  };

  const fetchProgress = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/student/${user.id}/progress`);
      if (res.ok) {
        const data = await res.json();
        setProgress(data);
      }
    } catch (error) {
      console.error("Error fetching progress:", error);
    }
  };

  return (
    <div className="relative h-screen overflow-hidden bg-[#87CEEB]">

      {/* City Map Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none z-0 opacity-100"
        style={{ backgroundImage: `url(${mapBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        {/* Overlay for better text contrast if needed, reducing opacity */}
        {/* <div className="absolute inset-0 bg-white/20" /> */}
      </div>

      {/* Floating HUD - Points & Avatar */}
      {progress && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute top-4 right-4 z-50 flex gap-3"
        >
          <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-xl border-b-4 border-slate-200 flex items-center gap-2">
            <div className="bg-orange-500 rounded-full p-1">
              <Zap className="w-4 h-4 text-white" fill="currentColor" />
            </div>
            <span className="font-black text-orange-600 text-lg">{progress.totalPoints || 0}</span>
          </div>

          <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-xl border-b-4 border-slate-200 flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform">
            <div className="w-8 h-8 rounded-full bg-blue-100 border-2 border-blue-400 overflow-hidden">
              <img src={avatarBoy} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <span className="font-bold text-slate-700">{user.name}</span>
          </div>
        </motion.div>
      )}

      {/* Scrollable Map Path */}
      <div ref={scrollContainerRef} className="absolute inset-0 overflow-y-auto overflow-x-hidden z-10 pb-32 custom-scrollbar">
        <div className="min-h-screen w-full flex flex-col items-center pt-32 pb-64 relative">

          {/* SVG Path Connector (Simplified visual connector) */}
          <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 overflow-visible">
            {/* We would render path lines here if we calculated exact coordinates. 
                    For now, we use a CSS-based approach for the "Road" look or simple dashed lines between nodes 
                */}
          </svg>

          {modules.map((mod) => (
            <div key={mod.id} className="w-full max-w-md flex flex-col items-center mb-24 relative">

              {/* Module Start Banner */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                className="mb-12 bg-white/95 backdrop-blur shadow-2xl rounded-3xl p-6 border-b-8 border-slate-200 text-center relative max-w-sm"
              >
                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">{mod.nombreModulo}</h2>
                <p className="text-slate-500 font-bold text-sm">Mundo {mod.id}</p>
              </motion.div>

              {/* Levels Path */}
              <div className="flex flex-col items-center gap-16 w-full relative">
                {mod.levels?.map((level: any, idx: number) => {
                  // Calculate Zig Zag
                  const xOffset = idx % 2 === 0 ? 0 : (idx % 4 === 1 ? -80 : 80);
                  const isLocked = false; // logic placeholder
                  const isActive = idx === 0; // Simulate first level active for demo if no proper status

                  return (
                    <div
                      key={level.id}
                      className={`relative flex justify-center transition-all duration-500 ${isActive ? 'active-level-node' : ''}`}
                      style={{ transform: `translateX(${xOffset}px)` }}
                    >
                      {/* Road Segment behind */}
                      {idx < mod.levels.length - 1 && (
                        <div
                          className="absolute top-1/2 left-1/2 w-32 h-24 border-dashed border-4 border-white/60 -z-10 rounded-full"
                          style={{
                            transform: `translate(-50%, 0) rotate(${idx % 2 === 0 ? '-30deg' : '30deg'})`,
                            width: '140px',
                            height: '100px'
                          }}
                        />
                      )}

                      {/* Avatar Standing on Active Level */}
                      {isActive && (
                        <motion.div
                          initial={{ y: -50, opacity: 0, scale: 0 }}
                          animate={{ y: -85, opacity: 1, scale: 1 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                          className="absolute left-1/2 -translate-x-1/2 z-30 w-24 h-24 pointer-events-none drop-shadow-2xl"
                        >
                          <img src={avatarBoy} alt="You" className="w-full h-full object-contain" />
                          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-black/40 blur-md w-12 h-4 rounded-full" />
                        </motion.div>
                      )}

                      <Link href={`/level/${level.id}`}>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className={cn(
                            "w-20 h-20 rounded-full flex items-center justify-center border-b-8 shadow-[0_10px_20px_rgba(0,0,0,0.2)] relative z-20 transition-all",
                            isActive
                              ? "bg-yellow-400 border-yellow-600"
                              : "bg-slate-200 border-slate-300"
                          )}
                        >
                          <div className="absolute -top-1 -left-1 w-full h-full rounded-full border-4 border-white/30" />

                          {level.type === 'start' && <Play className="w-8 h-8 text-white fill-current" />}
                          {level.type === 'star' && <Star className="w-8 h-8 text-white fill-current" />}
                          {level.type === 'trophy' && <Trophy className="w-8 h-8 text-white fill-current" />}

                          {/* Star Rating below level */}
                          <div className="absolute -bottom-8 flex gap-0.5">
                            {[1, 2, 3].map(s => (
                              <Star key={s} className="w-3 h-3 text-yellow-400 fill-current" />
                            ))}
                          </div>
                        </motion.button>
                      </Link>

                      {/* Level Number */}
                      <div className="absolute top-0 -right-2 bg-white text-slate-800 text-xs font-black w-6 h-6 flex items-center justify-center rounded-full border-2 border-slate-100 shadow-md z-30">
                        {idx + 1}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
