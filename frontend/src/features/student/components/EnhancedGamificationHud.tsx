import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GamificationState, calculateLevel, getXPToNextLevel } from '@/types/gamification';
import { Trophy, Star, Zap, TrendingUp, ChevronUp, ChevronDown, Minimize2, GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface EnhancedGamificationHudProps {
    state: GamificationState;
    className?: string;
}

export default function EnhancedGamificationHud({ state, className }: EnhancedGamificationHudProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const currentLevel = calculateLevel(state.xp);
    const xpToNext = getXPToNextLevel(state.xp);
    const xpProgress = state.xpToNextLevel > 0
        ? ((state.xpToNextLevel - xpToNext) / state.xpToNextLevel) * 100
        : 100;

    return (
        <div
            className={cn("transition-all duration-300 relative h-12 w-48", className)}
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
        >
            <div className="absolute top-0 right-0 z-50">
                <motion.div
                    initial={false}
                    animate={{ width: isExpanded ? '300px' : '200px' }}
                    className="relative"
                >
                    <Card
                        className={cn(
                            "bg-white/95 backdrop-blur-md shadow-2xl border-2 border-purple-200 overflow-hidden transition-all",
                            !isExpanded && "cursor-pointer hover:scale-105"
                        )}
                    >
                        <CardContent className="p-0">
                            {/* Header / Minimized State */}
                            <div className={cn(
                                "flex items-center gap-3 p-3 bg-gradient-to-r transition-colors",
                                isExpanded ? "from-purple-50 to-white" : "from-white to-white"
                            )}>
                                <div className={cn(
                                    "w-12 h-12 rounded-full flex items-center justify-center text-white shadow-[0_0_20px_rgba(0,0,0,0.15)] flex-shrink-0 relative transition-transform duration-500",
                                    `bg-gradient-to-br from-${currentLevel.color}-400 via-${currentLevel.color}-500 to-${currentLevel.color}-600`,
                                    isExpanded && "scale-110"
                                )}>
                                    <GraduationCap className="w-7 h-7 drop-shadow-md" />
                                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-white text-slate-800 rounded-full flex items-center justify-center text-[11px] font-black shadow-lg border-2 border-slate-50">
                                        {currentLevel.level}
                                    </div>
                                </div>

                                {!isExpanded ? (
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-slate-800">{currentLevel.title}</span>
                                        <span className="text-xs text-slate-500 font-medium">{state.points}</span>
                                    </div>
                                ) : (
                                    <div className="flex-1">
                                        <p className="text-xs text-slate-500 font-medium">Nivel Actual</p>
                                        <p className="text-lg font-black text-slate-800 leading-tight">{currentLevel.title}</p>
                                    </div>
                                )}

                            </div>

                            {/* Expanded Content */}
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="px-4 pb-4 space-y-4"
                                    >
                                        {/* XP Progress Bar */}
                                        <div>
                                            <div className="flex justify-between items-center mb-1">
                                                <p className="text-xs text-slate-600 font-medium flex items-center gap-1">
                                                    <Star className="w-3 h-3 text-yellow-500" /> XP
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    {xpToNext > 0 ? `${xpToNext} para siguiente` : "¡Max!"}
                                                </p>
                                            </div>
                                            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                                <motion.div
                                                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${xpProgress}%` }}
                                                    transition={{ duration: 0.5, ease: "easeOut" }}
                                                />
                                            </div>
                                            <p className="text-xs text-slate-500 mt-1 text-right">{state.xp} XP total</p>
                                        </div>

                                        {/* Points & Streak Grid */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="bg-slate-50 rounded-lg p-2 flex flex-col items-center justify-center border border-slate-100">
                                                <Trophy className="w-5 h-5 text-yellow-500 mb-1" />
                                                <span className="text-lg font-black text-slate-700">{state.points}</span>
                                                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Puntos</span>
                                            </div>
                                            <div className="bg-slate-50 rounded-lg p-2 flex flex-col items-center justify-center border border-slate-100">
                                                <Zap className="w-5 h-5 text-orange-500 mb-1" />
                                                <span className="text-lg font-black text-orange-600">{state.streak}</span>
                                                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Racha días</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Recent Award Popup (Always shows) */}
                            <AnimatePresence>
                                {state.lastAward && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8, x: 20 }}
                                        animate={{ opacity: 1, scale: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.8, x: 20 }}
                                        className="absolute top-2 -left-[140%] z-50 pointer-events-none"
                                    >
                                        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full shadow-xl flex items-center gap-3 whitespace-nowrap">
                                            <div className="bg-white/20 p-1 rounded-full">
                                                <TrendingUp className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold">+{state.lastAward.amount} XP</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Navigation Links (Expanded Only) */}
                            {isExpanded && (
                                <div className="px-4 pb-4 grid grid-cols-2 gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="w-full text-xs"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            window.location.href = '/leaderboard';
                                        }}
                                    >
                                        <Trophy className="w-3 h-3 mr-1 text-yellow-500" /> Clasificación
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="w-full text-xs"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            window.location.href = '/missions';
                                        }}
                                    >
                                        <Zap className="w-3 h-3 mr-1 text-red-500" /> Misiones
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
