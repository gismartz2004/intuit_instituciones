import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

interface GamificationHudProps {
    points: number;
    level?: number;
    lastAward?: {
        amount: number;
        reason: string;
    };
}

export default function GamificationHud({ points, level = 1, lastAward }: GamificationHudProps) {
    const [showAward, setShowAward] = useState(false);

    useEffect(() => {
        if (lastAward) {
            setShowAward(true);
            const timer = setTimeout(() => setShowAward(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [lastAward]);

    return (
        <div className="fixed top-28 right-4 z-40 flex flex-col gap-2 items-end pointer-events-none">
            {/* Main Stats */}
            <motion.div
                className="bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-slate-200 p-2 pl-4 pr-4 flex items-center gap-4 pointer-events-auto"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
            >
                <div className="flex items-center gap-2">
                    <div className="bg-yellow-100 p-1.5 rounded-full">
                        <Star className="w-4 h-4 text-yellow-600 fill-yellow-600" />
                    </div>
                    <span className="font-bold text-slate-800">{points} pts</span>
                </div>
                <div className="w-px h-6 bg-slate-200" />
                <div className="flex items-center gap-2">
                    <div className="bg-purple-100 p-1.5 rounded-full">
                        <Trophy className="w-4 h-4 text-purple-600" />
                    </div>
                    <span className="font-bold text-slate-800">Nivel {level}</span>
                </div>
            </motion.div>

            {/* Award Popup */}
            <AnimatePresence>
                {showAward && lastAward && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.8 }}
                        className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-2xl p-3 shadow-xl flex items-center gap-3 pr-6"
                    >
                        <div className="bg-white/20 p-2 rounded-full">
                            <Zap className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="font-black text-lg leading-none">+{lastAward.amount}</p>
                            <p className="text-xs font-medium opacity-90">{lastAward.reason}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
