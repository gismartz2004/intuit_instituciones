import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Trophy, Sparkles, ChevronRight } from "lucide-react";
import confetti from "canvas-confetti";
import { useEffect } from "react";

interface LevelCompletionModalProps {
    isOpen: boolean;
    levelTitle: string;
    pointsEarned: number;
    onContinue: () => void;
}

export function LevelCompletionModal({ isOpen, levelTitle, pointsEarned, onContinue }: LevelCompletionModalProps) {

    useEffect(() => {
        if (isOpen) {
            // Trigger confetti
            confetti({
                particleCount: 150,
                spread: 100,
                origin: { y: 0.5 }
            });
        }
    }, [isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={() => { }}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-gradient-to-br from-yellow-400 via-orange-400 to-pink-500 border-none shadow-2xl">
                <div className="relative p-8 text-center text-white">
                    {/* Decorative Elements */}
                    <div className="absolute top-4 left-4 opacity-30">
                        <Sparkles className="w-12 h-12 animate-pulse" />
                    </div>
                    <div className="absolute bottom-4 right-4 opacity-30">
                        <Sparkles className="w-12 h-12 animate-pulse" style={{ animationDelay: '0.5s' }} />
                    </div>

                    {/* Trophy Icon */}
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 } as const}
                        className="mb-6 flex justify-center"
                    >
                        <div className="bg-white/20 backdrop-blur-sm p-6 rounded-full">
                            <Trophy className="w-20 h-20 text-yellow-300" fill="currentColor" />
                        </div>
                    </motion.div>

                    {/* Title */}
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-4xl font-black mb-2"
                    >
                        ¡Nivel Completado!
                    </motion.h2>

                    {/* Level Name */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-xl font-bold mb-4 text-white/90"
                    >
                        {levelTitle}
                    </motion.p>

                    {/* Points */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 mb-6 inline-block"
                    >
                        <p className="text-sm font-medium mb-1">Puntos Ganados</p>
                        <p className="text-5xl font-black text-yellow-300">+{pointsEarned}</p>
                    </motion.div>

                    {/* Continue Button */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <Button
                            size="lg"
                            className="bg-white text-orange-600 hover:bg-white/90 font-black rounded-full px-8 py-6 text-lg shadow-xl"
                            onClick={onContinue}
                        >
                            Siguiente Nivel <ChevronRight className="ml-2 w-5 h-5" />
                        </Button>
                    </motion.div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
