import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, ChevronRight, Sparkles, MousePointer2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SpecialistGuideProps {
    viewMode: 'bd' | 'it' | 'pic';
    onClose?: () => void;
}

export default function SpecialistGuide({ viewMode, onClose }: SpecialistGuideProps) {
    const [isVisible, setIsVisible] = useState(true);

    const handleGotIt = () => {
        setIsVisible(false);
        onClose?.();
    };

    const getMessage = () => {
        return "Aquí podrás aprender lo que necesitas para navegar en el contenido y completar tu formación.";
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
                >
                    {/* Dark Blurred Backdrop */}
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" />

                    {/* Highlight Area (Right Sidebar) */}
                    <motion.div
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className="absolute right-0 top-0 bottom-0 w-[64px] bg-white/20 border-l border-white/30 backdrop-blur-2xl flex items-center justify-center"
                    >
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.5, 1, 0.5]
                            }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="w-12 h-12 rounded-full bg-violet-500/50 flex items-center justify-center"
                        >
                            <MousePointer2 className="w-6 h-6 text-white" />
                        </motion.div>
                    </motion.div>

                    {/* Main Dialog */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, type: "spring", stiffness: 300, damping: 25 }}
                        className="relative z-10 max-w-md w-full mx-4"
                    >
                        <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 overflow-hidden relative">
                            {/* Decorative background */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-violet-50 to-transparent -mr-10 -mt-10 rounded-full opacity-50" />

                            <div className="relative z-10 space-y-6 text-center">
                                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-violet-600 to-indigo-700 rounded-3xl flex items-center justify-center shadow-lg shadow-violet-200 rotate-3">
                                    <Bot className="w-10 h-10 text-white -rotate-3" />
                                </div>

                                <div className="space-y-2">
                                    <h2 className="text-2xl font-black italic text-slate-800 tracking-tight">
                                        ¿Listo para empezar?
                                    </h2>
                                    <p className="text-slate-500 leading-relaxed font-medium">
                                        {getMessage()}
                                    </p>
                                </div>

                                <div className="p-4 bg-slate-50 rounded-2xl flex items-start gap-4 text-left border border-slate-100">
                                    <div className="mt-1 p-1 bg-white rounded shadow-sm flex-shrink-0">
                                        <Sparkles className="w-4 h-4 text-violet-600" />
                                    </div>
                                    <p className="text-xs text-slate-600 leading-normal">
                                        Pasa el ratón por el borde derecho para desplegar la <b>Ruta de Aprendizaje</b> y navegar entre los pasos.
                                    </p>
                                </div>

                                <Button
                                    onClick={handleGotIt}
                                    className="w-full bg-slate-800 hover:bg-slate-900 text-white h-14 rounded-2xl font-black uppercase tracking-widest text-xs transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-slate-200"
                                >
                                    ¡Entendido!
                                    <ChevronRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
