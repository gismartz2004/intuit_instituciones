import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Star, Lock, Check, Zap, Play, Trophy, Flame, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

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

  useEffect(() => {
    if (user?.id) {
      fetchModules();
      fetchProgress();
    }
  }, [user]);

  const fetchModules = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/student/${user.id}/modules`);
      if (res.ok) {
        const data = await res.json();
        const mappedData = data.map((mod: any, idx: number) => ({
          ...mod,
          color: idx % 2 === 0 ? "from-emerald-400 to-green-500" : "from-purple-400 to-violet-500",
          levels: mod.levels?.map((lvl: any, lIdx: number) => ({
            ...lvl,
            type: lIdx === 0 ? "star" : (lIdx === mod.levels.length - 1 ? "trophy" : "book"),
            status: "active",
            x: (lIdx % 2 === 0) ? 0 : (lIdx % 4 === 1 ? -40 : 40)
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
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Enhanced User Profile Header - Bottom Right */}
      {progress && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="fixed bottom-4 right-4 z-50 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/50 p-3 w-[220px]"
        >
          <div className="flex items-center gap-2 mb-2">
            {/* Compact Avatar */}
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                {user.name[0].toUpperCase()}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            </div>

            {/* Compact Name */}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-800 text-sm truncate">{user.name}</p>
              <p className="text-[10px] text-slate-500 font-medium">Estudiante</p>
            </div>
          </div>

          {/* Compact Stats Grid */}
          <div className="grid grid-cols-2 gap-2">
            {/* Points Card */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-xl p-2 border border-orange-200/50"
            >
              <div className="flex items-center gap-1 mb-1">
                <div className="w-5 h-5 bg-gradient-to-br from-orange-400 to-amber-500 rounded-lg flex items-center justify-center">
                  <Zap className="w-3 h-3 text-white" />
                </div>
                <span className="text-[9px] font-bold text-orange-700 uppercase">Pts</span>
              </div>
              <p className="text-xl font-black bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                {progress.totalPoints || 0}
              </p>
            </motion.div>

            {/* Streak Card */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-br from-red-50 to-pink-100 rounded-xl p-2 border border-red-200/50"
            >
              <div className="flex items-center gap-1 mb-1">
                <div className="w-5 h-5 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Flame className="w-3 h-3 text-white" />
                </div>
                <span className="text-[9px] font-bold text-red-700 uppercase">Racha</span>
              </div>
              <p className="text-xl font-black bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                0
              </p>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <div className="flex justify-center pb-24 pt-12 px-4">
        <div className="w-full max-w-[700px]">
          {modules.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-slate-500 mt-20 bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-lg"
            >
              <Target className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <p className="text-lg font-semibold">No tienes módulos asignados aún</p>
              <p className="text-sm text-slate-400 mt-2">Contacta a tu profesor para comenzar</p>
            </motion.div>
          ) : (
            <AnimatePresence>
              {modules.map((mod, modIdx) => {
                const moduleProgress = progress?.moduleProgress?.find((p: any) => p.moduloId === mod.id);

                return (
                  <motion.div
                    key={mod.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: modIdx * 0.1 }}
                    className="mb-16"
                  >
                    {/* Enhanced Module Header */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className={cn(
                        "rounded-3xl p-8 mb-6 text-white shadow-2xl relative overflow-hidden bg-gradient-to-br",
                        mod.color
                      )}
                    >
                      {/* Decorative Elements */}
                      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-32 translate-x-32"></div>
                      <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl translate-y-24 -translate-x-24"></div>

                      <div className="relative z-10">
                        <div className="flex justify-between items-start mb-6">
                          <div className="flex-1">
                            <div className="inline-block bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold mb-3">
                              MÓDULO ACTIVO
                            </div>
                            <h2 className="text-3xl font-black mb-2">{mod.nombreModulo}</h2>
                            <p className="opacity-90 font-medium text-sm">
                              {mod.duracionDias ? `${mod.duracionDias} Días de duración` : "Módulo de aprendizaje"}
                            </p>
                          </div>
                          <Link href={`/unit/${mod.id}`}>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-bold py-3 px-8 rounded-2xl transition-all border-2 border-white/30 shadow-lg"
                            >
                              EMPEZAR
                            </motion.button>
                          </Link>
                        </div>

                        {/* Enhanced Progress Bar */}
                        {moduleProgress && (
                          <div className="mt-6">
                            <div className="flex justify-between text-sm mb-3 font-semibold">
                              <span>Progreso: Día {moduleProgress.daysElapsed} de {moduleProgress.totalDays}</span>
                              <span className="bg-white/20 px-3 py-1 rounded-full">{moduleProgress.progressPercentage}%</span>
                            </div>
                            <div className="w-full bg-black/20 backdrop-blur-sm rounded-full h-4 overflow-hidden shadow-inner">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${moduleProgress.progressPercentage}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="bg-white rounded-full h-4 shadow-lg relative"
                              >
                                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/40 to-white/0 animate-pulse"></div>
                              </motion.div>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>

                    {/* Enhanced Lesson Path */}
                    <div className="flex flex-col items-center gap-8 relative">
                      {/* Connecting Line */}
                      <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-slate-200 via-slate-300 to-slate-200 -translate-x-1/2 -z-10"></div>

                      {mod.levels && mod.levels.length > 0 ? (
                        mod.levels.map((level: any, idx: number) => (
                          <LessonNode key={level.id} lesson={level} index={idx} />
                        ))
                      ) : (
                        <p className="text-slate-400 italic bg-white/80 px-6 py-4 rounded-2xl">
                          No hay niveles disponibles
                        </p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}

function LessonNode({ lesson, index }: { lesson: any; index: number }) {
  const isLocked = lesson.status === "locked";
  const isActive = lesson.status === "active";

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
      className="relative z-10"
      style={{ transform: `translateX(${lesson.x}px)` }}
    >
      <Link href={isLocked ? "#" : `/level/${lesson.id}`}>
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          className="group relative cursor-pointer"
        >
          {/* Glow Effect */}
          {isActive && (
            <div className="absolute inset-0 bg-blue-400 rounded-full blur-xl opacity-50 animate-pulse"></div>
          )}

          {/* Shadow/Depth */}
          <div
            className={cn(
              "absolute top-3 left-0 w-full h-full rounded-2xl transition-all",
              isLocked ? "bg-slate-300" : "bg-blue-800"
            )}
          />

          {/* Main Button */}
          <div
            className={cn(
              "w-24 h-24 rounded-2xl flex items-center justify-center relative transition-all border-4 z-10 shadow-xl",
              isLocked
                ? "bg-slate-200 border-slate-300 text-slate-400"
                : isActive
                  ? "bg-gradient-to-br from-blue-500 to-blue-600 border-blue-300 text-white shadow-[0_0_30px_rgba(59,130,246,0.5)]"
                  : "bg-gradient-to-br from-blue-400 to-blue-500 border-blue-400 text-white"
            )}
          >
            {lesson.type === "star" && <Star className="w-10 h-10 fill-current drop-shadow-lg" />}
            {lesson.type === "book" && <Check className="w-10 h-10 stroke-[4] drop-shadow-lg" />}
            {lesson.type === "trophy" && <Trophy className="w-10 h-10 fill-current drop-shadow-lg" />}

            {isActive && (
              <motion.div
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ repeat: Infinity, duration: 1, repeatType: "reverse" }}
                className="absolute -top-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-xl font-bold text-xs uppercase shadow-lg border-2 border-white"
              >
                ¡Empezar!
              </motion.div>
            )}

            {/* Level Number Badge */}
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center font-black text-xs text-slate-700 shadow-lg border-2 border-slate-100">
              {index + 1}
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}
