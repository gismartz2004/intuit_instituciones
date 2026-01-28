import { motion, AnimatePresence } from 'framer-motion';
import { AvatarEmotion, ResponseOption } from '@/types/gamification';
import { Bot, Smile, Trophy, Lightbulb, Clock, X, Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface AvatarGuideProps {
    emotion: AvatarEmotion;
    message: string;
    className?: string;
    actionLabel?: string;
    onAction?: () => void;
    responseOptions?: ResponseOption[];
}

export default function AvatarGuide({ emotion, message, className, actionLabel, onAction, responseOptions }: AvatarGuideProps) {
    const [isMinimized, setIsMinimized] = useState(false);

    const getIcon = () => {
        switch (emotion) {
            case 'happy': return <Smile className="w-6 h-6 text-green-400" />;
            case 'celebrating': return <Trophy className="w-6 h-6 text-yellow-400" />;
            case 'thinking': return <Lightbulb className="w-6 h-6 text-cyan-400" />;
            case 'waiting': return <Clock className="w-6 h-6 text-blue-400" />;
            case 'sad': return <Bot className="w-6 h-6 text-slate-400" />; // Or a specific sad icon if available
            case 'alert': return <Bot className="w-6 h-6 text-red-500" />;
            default: return <Bot className="w-6 h-6 text-purple-400" />;
        }
    };

    const getThemeStyles = () => {
        switch (emotion) {
            case 'happy': return {
                border: 'border-green-500/50',
                bg: 'bg-green-950/90',
                glow: 'shadow-[0_0_20px_rgba(34,197,94,0.3)]',
                text: 'text-green-100',
                accent: 'bg-green-500'
            };
            case 'celebrating': return {
                border: 'border-yellow-500/50',
                bg: 'bg-yellow-950/90',
                glow: 'shadow-[0_0_20px_rgba(234,179,8,0.3)]',
                text: 'text-yellow-100',
                accent: 'bg-yellow-500'
            };
            case 'thinking': return {
                border: 'border-cyan-500/50',
                bg: 'bg-slate-950/90',
                glow: 'shadow-[0_0_20px_rgba(6,182,212,0.3)]',
                text: 'text-cyan-100',
                accent: 'bg-cyan-500'
            };
            case 'waiting': return {
                border: 'border-blue-500/50',
                bg: 'bg-slate-950/90',
                glow: 'shadow-[0_0_20px_rgba(59,130,246,0.3)]',
                text: 'text-blue-100',
                accent: 'bg-blue-500'
            };
            case 'sad': return {
                border: 'border-slate-500/50',
                bg: 'bg-slate-900/95',
                glow: 'shadow-[0_0_15px_rgba(148,163,184,0.2)]',
                text: 'text-slate-300',
                accent: 'bg-slate-500'
            };
            case 'alert': return {
                border: 'border-red-500/50',
                bg: 'bg-red-950/90',
                glow: 'shadow-[0_0_20px_rgba(239,68,68,0.4)]',
                text: 'text-red-100',
                accent: 'bg-red-500'
            };
            default: return {
                border: 'border-purple-500/50',
                bg: 'bg-slate-950/90',
                glow: 'shadow-[0_0_20px_rgba(168,85,247,0.3)]',
                text: 'text-purple-100',
                accent: 'bg-purple-500'
            };
        }
    };

    const theme = getThemeStyles();

    if (isMinimized) {
        return (
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="relative z-50 pointer-events-auto"
            >
                <motion.button
                    onClick={() => setIsMinimized(false)}
                    className={cn(
                        "w-14 h-14 rounded-full flex items-center justify-center cursor-pointer border-2 backdrop-blur-md",
                        theme.bg, theme.border, theme.glow
                    )}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                >
                    {getIcon()}
                </motion.button>
                {/* Notification indicator */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse ring-2 ring-black"
                />
            </motion.div>
        );
    }

    return (
        <AnimatePresence mode='wait'>
            <motion.div
                key={message}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 } as const}
                className={cn("relative z-50 max-w-sm pointer-events-auto", className)}
            >
                {/* Main Card */}
                <div className={cn(
                    "backdrop-blur-xl rounded-2xl p-0.5 shadow-2xl overflow-hidden",
                    "bg-gradient-to-br from-white/10 to-transparent", // Glass edge effect
                    theme.glow
                )}>
                    <div className={cn(
                        "rounded-2xl p-5 border relative overflow-hidden",
                        theme.bg, theme.border
                    )}>

                        {/* Minimize Button */}
                        <div className="absolute top-3 right-3 flex gap-2">
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6 text-slate-400 hover:text-white hover:bg-white/10 rounded-full"
                                onClick={() => setIsMinimized(true)}
                            >
                                <Minimize2 className="w-3 h-3" />
                            </Button>
                        </div>

                        <div className="flex gap-4">
                            {/* Avatar Visual */}
                            <div className="flex-shrink-0 pt-1">
                                <div className={cn(
                                    "w-12 h-12 rounded-xl flex items-center justify-center border shadow-lg relative",
                                    "bg-gradient-to-br from-slate-800 to-black border-slate-700"
                                )}>
                                    {getIcon()}
                                    {/* Tech lines decoration */}
                                    <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-slate-500/20 rounded-full" />
                                    <div className="absolute -top-1 -left-1 w-2 h-2 bg-slate-500/20 rounded-full" />
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 space-y-3 pt-1">
                                {/* Thinking/Status Indicator */}
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={cn("text-[10px] font-black uppercase tracking-widest opacity-70", theme.text)}>
                                        IA {emotion}
                                    </span>
                                    <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", theme.accent)} />
                                </div>

                                {/* Message */}
                                <p className={cn("text-sm leading-relaxed font-medium", theme.text)}>
                                    {message}
                                </p>

                                {/* Response Options */}
                                {responseOptions && responseOptions.length > 0 && (
                                    <div className="flex flex-wrap gap-2 pt-1">
                                        {responseOptions.map((option, idx) => (
                                            <Button
                                                key={idx}
                                                size="sm"
                                                onClick={option.onSelect}
                                                className={cn(
                                                    "h-7 text-xs border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/30 text-slate-200 transition-all",
                                                    option.variant === 'success' && "border-green-500/30 hover:border-green-400/50 hover:bg-green-500/10 text-green-200",
                                                    option.variant === 'danger' && "border-red-500/30 hover:border-red-400/50 hover:bg-red-500/10 text-red-200"
                                                )}
                                            >
                                                {option.label}
                                            </Button>
                                        ))}
                                    </div>
                                )}

                                {/* Legacy Action Button */}
                                {actionLabel && !responseOptions && (
                                    <div className="pt-1">
                                        <Button
                                            size="sm"
                                            onClick={onAction}
                                            variant="outline"
                                            className={cn(
                                                "h-8 text-xs font-bold w-full border-white/20 hover:bg-white/10 hover:text-white bg-transparent",
                                                theme.text
                                            )}
                                        >
                                            {actionLabel}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Decorational Background Elements */}
                        <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-white/5 to-transparent pointer-events-none" />
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
