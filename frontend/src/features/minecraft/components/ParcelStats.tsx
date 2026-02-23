import { motion } from "framer-motion";
import { Trophy, Zap, Target, Clock } from "lucide-react";

interface ParcelStatsProps {
  xp: number;
  level: number;
  missionsCompleted: number;
  totalMissions: number;
  bestTime?: number;
  currentStreak: number;
}

export function ParcelStats({
  xp,
  level,
  missionsCompleted,
  totalMissions,
  bestTime,
  currentStreak,
}: ParcelStatsProps) {
  const xpToNextLevel = Math.ceil((level + 1) * 100);
  const xpProgress = (xp % xpToNextLevel) / xpToNextLevel;
  const missionProgress = totalMissions > 0 ? missionsCompleted / totalMissions : 0;

  return (
    <div className="space-y-4">
      {/* Level & XP Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black">⭐ Nivel {level}</span>
              <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-lg font-bold">
                {xp.toLocaleString()} XP
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {Math.ceil(xpToNextLevel - (xp % xpToNextLevel))} XP para siguiente nivel
            </p>
          </div>
        </div>
        <motion.div className="w-full h-2 rounded-full bg-white/10 overflow-hidden border border-white/20">
          <motion.div
            className="h-full bg-gradient-to-r from-yellow-400 to-orange-400"
            initial={{ width: 0 }}
            animate={{ width: `${xpProgress * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </motion.div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Missions Completed */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-emerald-600/20 to-green-600/10 rounded-xl p-3 border border-emerald-500/30"
        >
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Misiones
            </span>
          </div>
          <div className="text-2xl font-black text-emerald-300">
            {missionsCompleted}/{totalMissions}
          </div>
          <motion.div className="mt-2 w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              className="h-full bg-emerald-400"
              initial={{ width: 0 }}
              animate={{ width: `${missionProgress * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </motion.div>
        </motion.div>

        {/* Streak */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-amber-600/20 to-orange-600/10 rounded-xl p-3 border border-amber-500/30"
        >
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Racha
            </span>
          </div>
          <div className="text-2xl font-black text-amber-300">{currentStreak}🔥</div>
          <p className="text-[9px] text-amber-300/70 mt-1">
            {currentStreak > 0 ? "¡Sigue así!" : "Comienza una racha hoy"}
          </p>
        </motion.div>

        {/* Best Time */}
        {bestTime && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-blue-600/20 to-cyan-600/10 rounded-xl p-3 border border-blue-500/30"
          >
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Mejor Tiempo
              </span>
            </div>
            <div className="text-2xl font-black text-blue-300">
              {(bestTime / 1000).toFixed(1)}s
            </div>
          </motion.div>
        )}

        {/* Target */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-purple-600/20 to-pink-600/10 rounded-xl p-3 border border-purple-500/30"
        >
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-purple-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Desafío Actual
            </span>
          </div>
          <div className="text-2xl font-black text-purple-300">💎</div>
        </motion.div>
      </div>
    </div>
  );
}
