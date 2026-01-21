import { motion } from 'framer-motion';
import { Achievement } from '@/types/gamification';
import { Trophy, Lock, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AchievementCardProps {
    achievement: Achievement;
    className?: string;
}

export function AchievementCard({ achievement, className }: AchievementCardProps) {
    const isUnlocked = !!achievement.unlockedAt;
    const progress = achievement.progress || 0;
    const maxProgress = achievement.maxProgress || 1;
    const progressPercent = (progress / maxProgress) * 100;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: isUnlocked ? 1.05 : 1 }}
            className={className}
        >
            <Card className={cn(
                "transition-all",
                isUnlocked
                    ? "bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300 shadow-lg"
                    : "bg-slate-50 border-slate-200 opacity-60"
            )}>
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "w-12 h-12 rounded-full flex items-center justify-center text-2xl",
                                isUnlocked ? "bg-yellow-400" : "bg-slate-300"
                            )}>
                                {isUnlocked ? achievement.icon : <Lock className="w-6 h-6 text-slate-500" />}
                            </div>
                            <div>
                                <CardTitle className="text-base">{achievement.title}</CardTitle>
                                <p className="text-xs text-slate-600 mt-1">{achievement.description}</p>
                            </div>
                        </div>
                        {isUnlocked && (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {!isUnlocked && achievement.maxProgress && achievement.maxProgress > 1 && (
                        <div>
                            <div className="flex justify-between text-xs text-slate-600 mb-1">
                                <span>Progreso</span>
                                <span>{progress}/{maxProgress}</span>
                            </div>
                            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                        </div>
                    )}
                    {isUnlocked && achievement.unlockedAt && (
                        <Badge variant="outline" className="text-xs">
                            Desbloqueado {new Date(achievement.unlockedAt).toLocaleDateString()}
                        </Badge>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}

interface AchievementsGridProps {
    achievements: Achievement[];
    className?: string;
}

export default function AchievementsGrid({ achievements, className }: AchievementsGridProps) {
    const unlockedCount = achievements.filter(a => a.unlockedAt).length;

    return (
        <div className={className}>
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <Trophy className="w-7 h-7 text-yellow-500" />
                    Logros
                </h2>
                <Badge className="bg-purple-100 text-purple-700 border-purple-300">
                    {unlockedCount}/{achievements.length} desbloqueados
                </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map((achievement) => (
                    <AchievementCard key={achievement.id} achievement={achievement} />
                ))}
            </div>
        </div>
    );
}
