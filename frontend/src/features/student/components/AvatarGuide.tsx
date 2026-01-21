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
            case 'happy': return <Smile className="w-8 h-8 text-green-500" />;
            case 'celebrating': return <Trophy className="w-8 h-8 text-yellow-500" />;
            case 'thinking': return <Lightbulb className="w-8 h-8 text-amber-500" />;
            case 'waiting': return <Clock className="w-8 h-8 text-blue-500" />;
            default: return <Bot className="w-8 h-8 text-indigo-500" />;
        }
    };

    const getBgColor = () => {
        switch (emotion) {
            case 'happy': return 'from-green-400 to-emerald-500';
            case 'celebrating': return 'from-yellow-400 to-orange-500';
            case 'thinking': return 'from-amber-400 to-orange-500';
            case 'waiting': return 'from-blue-400 to-indigo-500';
            default: return 'from-indigo-400 to-purple-500';
        }
    };

    const getTextColor = () => {
        switch (emotion) {
            case 'happy': return 'text-green-800';
            case 'celebrating': return 'text-yellow-900';
            case 'thinking': return 'text-amber-800';
            case 'waiting': return 'text-blue-800';
            default: return 'text-indigo-800';
        }
    };

    const getButtonVariant = (variant?: string) => {
        switch (variant) {
            case 'success': return 'bg-green-500 hover:bg-green-600 text-white';
            case 'danger': return 'bg-red-500 hover:bg-red-600 text-white';
            case 'secondary': return 'bg-slate-500 hover:bg-slate-600 text-white';
            default: return cn('bg-gradient-to-r', getBgColor(), 'text-white border-0');
        }
    };

    if (isMinimized) {
        return (
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="relative"
            >
                <motion.button
                    onClick={() => setIsMinimized(false)}
                    className={cn(
                        "w-16 h-16 rounded-full shadow-2xl flex items-center justify-center cursor-pointer",
                        "bg-gradient-to-br hover:scale-110 transition-transform",
                        getBgColor()
                    )}
                    animate={{
                        scale: [1, 1.1, 1],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    {getIcon()}
                </motion.button>
                {/* Notification badge for new message */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold"
                >
                    !
                </motion.div>
            </motion.div>
        );
    }

    return (
        <AnimatePresence mode='wait'>
            <motion.div
                key={message}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20
                }}
                className={cn("relative", className)}
            >
                {/* Main card with gradient border */}
                <div className={cn(
                    "bg-white rounded-2xl p-1 shadow-2xl",
                    "bg-gradient-to-br",
                    getBgColor()
                )}>
                    <div className="bg-white rounded-xl p-4 relative">
                        {/* Close/Minimize button */}
                        <button
                            onClick={() => setIsMinimized(true)}
                            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                        >
                            <Minimize2 className="w-3 h-3 text-slate-600" />
                        </button>

                        <div className="flex items-start gap-4 pr-6">
                            {/* Animated Avatar Icon */}
                            <motion.div
                                className={cn(
                                    "flex-shrink-0 p-3 rounded-full shadow-md",
                                    "bg-gradient-to-br",
                                    getBgColor()
                                )}
                                animate={{
                                    rotate: emotion === 'celebrating' ? [0, -10, 10, -10, 0] : 0,
                                    scale: emotion === 'happy' ? [1, 1.1, 1] : 1,
                                }}
                                transition={{
                                    duration: emotion === 'celebrating' ? 0.5 : 2,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            >
                                <div className="relative">
                                    {getIcon()}
                                    {/* Breathing circle effect */}
                                    <motion.div
                                        className={cn(
                                            "absolute inset-0 rounded-full opacity-30",
                                            "bg-gradient-to-br",
                                            getBgColor()
                                        )}
                                        animate={{
                                            scale: [1, 1.3, 1],
                                            opacity: [0.3, 0, 0.3],
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                    />
                                </div>
                            </motion.div>

                            <div className="flex-1 space-y-3">
                                {/* Message with typing effect */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <p className={cn(
                                        "text-sm md:text-base font-medium leading-relaxed",
                                        getTextColor()
                                    )}>
                                        {message}
                                    </p>
                                </motion.div>

                                {/* Response Options (Yes/No type questions) */}
                                {responseOptions && responseOptions.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 }}
                                        className="flex flex-wrap gap-2"
                                    >
                                        {responseOptions.map((option, idx) => (
                                            <Button
                                                key={idx}
                                                size="sm"
                                                onClick={option.onSelect}
                                                className={cn(
                                                    "shadow-md transition-all hover:scale-105",
                                                    getButtonVariant(option.variant)
                                                )}
                                            >
                                                {option.label}
                                            </Button>
                                        ))}
                                    </motion.div>
                                )}

                                {/* Single Action Button (legacy support) */}
                                {actionLabel && !responseOptions && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 }}
                                    >
                                        <Button
                                            size="sm"
                                            onClick={onAction}
                                            className={cn(
                                                "shadow-md transition-all hover:scale-105",
                                                "bg-gradient-to-r",
                                                getBgColor(),
                                                "text-white border-0"
                                            )}
                                        >
                                            {actionLabel}
                                        </Button>
                                    </motion.div>
                                )}
                            </div>
                        </div>

                        {/* Animated dots indicator */}
                        <motion.div
                            className="flex gap-1 justify-center mt-3"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                        >
                            {[0, 1, 2].map((i) => (
                                <motion.div
                                    key={i}
                                    className={cn("w-1.5 h-1.5 rounded-full", getTextColor())}
                                    animate={{
                                        scale: [1, 1.5, 1],
                                        opacity: [0.3, 1, 0.3],
                                    }}
                                    transition={{
                                        duration: 1.5,
                                        repeat: Infinity,
                                        delay: i * 0.2,
                                    }}
                                />
                            ))}
                        </motion.div>
                    </div>
                </div>

                {/* Speech bubble tail */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={cn(
                        "absolute -bottom-3 right-8 w-6 h-6 transform rotate-45",
                        "bg-gradient-to-br",
                        getBgColor()
                    )}
                />
            </motion.div>
        </AnimatePresence>
    );
}
