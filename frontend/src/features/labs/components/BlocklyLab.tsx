import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Play,
    RotateCcw,
    Trophy,
    Target,
    Layout,
    Sparkles,
    Info,
    ArrowUp,
    ArrowDown,
    ArrowLeft,
    ArrowRight,
    Trash2,
    CheckCircle,
    AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import canvasConfetti from "canvas-confetti";

type Command = "MOVE_UP" | "MOVE_DOWN" | "MOVE_LEFT" | "MOVE_RIGHT";

interface BlocklyLabProps {
    objective: string;
    onComplete?: () => void;
    title?: string;
    gridSize?: number;
    initialPos?: { x: number; y: number };
    goalPos?: { x: number; y: number };
    toolboxType?: "standard" | "arduino" | "minecraft" | "python";
}

const COMMAND_ICONS: Record<Command, any> = {
    MOVE_UP: ArrowUp,
    MOVE_DOWN: ArrowDown,
    MOVE_LEFT: ArrowLeft,
    MOVE_RIGHT: ArrowRight
};

const COMMAND_LABELS: Record<Command, string> = {
    MOVE_UP: "Mover Arriba",
    MOVE_DOWN: "Mover Abajo",
    MOVE_LEFT: "Mover Izquierda",
    MOVE_RIGHT: "Mover Derecha"
};

const COMMAND_COLORS: Record<Command, string> = {
    MOVE_UP: "bg-emerald-500 border-emerald-700",
    MOVE_DOWN: "bg-blue-500 border-blue-700",
    MOVE_LEFT: "bg-amber-500 border-amber-700",
    MOVE_RIGHT: "bg-indigo-500 border-indigo-700"
};

export default function BlocklyLab({
    objective,
    onComplete,
    title = "Laboratorio de Algoritmos",
    gridSize = 5,
    initialPos = { x: 0, y: 4 },
    goalPos = { x: 4, y: 0 },
    toolboxType = "standard"
}: BlocklyLabProps) {
    const [isRunning, setIsRunning] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [agentPos, setAgentPos] = useState(initialPos);
    const [program, setProgram] = useState<Command[]>([]);
    const [currentStep, setCurrentStep] = useState<number | null>(null);

    const resetLab = useCallback(() => {
        setIsRunning(false);
        setIsCompleted(false);
        setErrorMessage(null);
        setAgentPos(initialPos);
        setCurrentStep(null);
    }, [initialPos]);

    const addCommand = (cmd: Command) => {
        if (isRunning || isCompleted) return;
        setProgram([...program, cmd]);
    };

    const removeCommand = (index: number) => {
        if (isRunning || isCompleted) return;
        const newProgram = [...program];
        newProgram.splice(index, 1);
        setProgram(newProgram);
    };

    const executeProgram = async () => {
        if (program.length === 0) {
            setErrorMessage("¡El programa está vacío! Añade bloques para empezar.");
            return;
        }

        setIsRunning(true);
        setErrorMessage(null);
        let currentPos = { ...initialPos };

        for (let i = 0; i < program.length; i++) {
            setCurrentStep(i);
            const cmd = program[i];

            // Wait for animation
            await new Promise(resolve => setTimeout(resolve, 600));

            let nextPos = { ...currentPos };
            if (cmd === "MOVE_UP") nextPos.y--;
            if (cmd === "MOVE_DOWN") nextPos.y++;
            if (cmd === "MOVE_LEFT") nextPos.x--;
            if (cmd === "MOVE_RIGHT") nextPos.x++;

            // Boundary Check
            if (nextPos.x < 0 || nextPos.x >= gridSize || nextPos.y < 0 || nextPos.y >= gridSize) {
                setErrorMessage("¡Oh no! El robot se salió de la rejilla.");
                setIsRunning(false);
                setCurrentStep(null);
                return;
            }

            currentPos = nextPos;
            setAgentPos(currentPos);
        }

        // Final Validation
        if (currentPos.x === goalPos.x && currentPos.y === goalPos.y) {
            setIsCompleted(true);
            canvasConfetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#8B5CF6', '#F59E0B', '#10B981']
            });
            if (onComplete) onComplete();
        } else {
            setErrorMessage("El robot no llegó a la estrella. ¡Inténtalo de nuevo!");
        }

        setIsRunning(false);
        setCurrentStep(null);
    };

    return (
        <div className="flex flex-col h-full bg-[#020617] overflow-hidden font-sans">
            {/* Header */}
            <div className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-slate-900/50 backdrop-blur-xl z-50">
                <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-indigo-500/20 rounded-2xl text-indigo-400 border border-indigo-500/30">
                        <Layout className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="font-black text-white uppercase italic tracking-tighter tabular-nums">{title}</h2>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">{toolboxType} MODE</span>
                            {isCompleted && (
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-1 text-emerald-400 text-[10px] font-bold">
                                    <CheckCircle className="w-3 h-3" /> COMPLETADO
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        onClick={resetLab}
                        className="text-slate-400 hover:text-white hover:bg-white/5 rounded-2xl"
                    >
                        <RotateCcw className="w-5 h-5 mr-2" /> Reiniciar
                    </Button>
                    <Button
                        onClick={executeProgram}
                        disabled={isRunning || isCompleted}
                        className={cn(
                            "rounded-2xl px-8 font-black uppercase italic tracking-widest transition-all",
                            isCompleted ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                        )}
                    >
                        {isRunning ? <Sparkles className="w-5 h-5 animate-spin mr-2" /> : <Play className="w-5 h-5 mr-2" />}
                        {isRunning ? "Simulando..." : isCompleted ? "Superado" : "Ejecutar"}
                    </Button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Visual Simulation Area (Left) */}
                <div className="flex-[1.2] border-r border-white/5 bg-[#020617] p-8 relative flex flex-col items-center justify-center">
                    <div className="absolute top-8 left-8 max-w-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="bg-amber-500 w-1.5 h-6 rounded-full" />
                            <h3 className="font-black text-xs text-slate-500 uppercase tracking-[0.3em]">Objetivo del Módulo</h3>
                        </div>
                        <p className="text-white font-bold text-lg leading-tight uppercase italic">{objective}</p>
                    </div>

                    {/* Grid Container */}
                    <div className="relative p-6 bg-slate-900/40 rounded-[3rem] border border-white/5 shadow-2xl backdrop-blur-sm">
                        <div
                            className="grid gap-2"
                            style={{
                                gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                                width: 'min(70vh, 500px)',
                                height: 'min(70vh, 500px)'
                            }}
                        >
                            {Array.from({ length: gridSize * gridSize }).map((_, i) => {
                                const x = i % gridSize;
                                const y = Math.floor(i / gridSize);
                                const isGoal = x === goalPos.x && y === goalPos.y;
                                const isAgent = x === agentPos.x && y === agentPos.y;

                                return (
                                    <div
                                        key={i}
                                        className={cn(
                                            "relative rounded-2xl border transition-all duration-300 flex items-center justify-center overflow-hidden",
                                            "bg-slate-800/30 border-white/5",
                                            isAgent && "bg-indigo-500/10 border-indigo-500/30 shadow-[inset_0_0_20px_rgba(99,102,241,0.2)]"
                                        )}
                                    >
                                        {/* Coordinate Label */}
                                        <span className="absolute top-1 right-2 text-[8px] font-bold text-slate-600 tabular-nums">
                                            {x}, {y}
                                        </span>

                                        {/* Goal (Star) */}
                                        {isGoal && (
                                            <motion.div
                                                animate={{
                                                    scale: [1, 1.2, 1],
                                                    rotate: [0, 10, -10, 0]
                                                }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                                className="z-10"
                                            >
                                                <Trophy className="w-10 h-10 text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)] fill-current" />
                                            </motion.div>
                                        )}

                                        {/* Agent (Robot/Char) */}
                                        {isAgent && (
                                            <motion.div
                                                layoutId="agent"
                                                className="z-20 relative"
                                                initial={false}
                                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                            >
                                                <div className="w-12 h-12 bg-indigo-500 rounded-2xl shadow-xl border-4 border-indigo-400 flex items-center justify-center">
                                                    <Target className="w-6 h-6 text-white" />
                                                </div>
                                                <motion.div
                                                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                                                    transition={{ repeat: Infinity, duration: 2 }}
                                                    className="absolute -inset-4 bg-indigo-500/20 rounded-full blur-xl -z-10"
                                                />
                                            </motion.div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Error Message Overlay */}
                    <AnimatePresence>
                        {errorMessage && (
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: 20, opacity: 0 }}
                                className="absolute bottom-12 px-6 py-3 bg-red-500/10 border border-red-500/30 backdrop-blur-xl rounded-2xl flex items-center gap-3"
                            >
                                <AlertCircle className="w-5 h-5 text-red-500" />
                                <span className="text-red-400 font-bold uppercase text-xs tracking-widest">{errorMessage}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Algorithmic Blocks Area (Right) */}
                <div className="flex-1 bg-slate-900/30 backdrop-blur-sm flex flex-col h-full border-l border-white/5">
                    {/* Toolbar */}
                    <div className="p-6 border-b border-white/5">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="bg-indigo-500 w-1.5 h-6 rounded-full" />
                            <h3 className="font-black text-xs text-slate-500 uppercase tracking-[0.3em]">Comandos Disponibles</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {(["MOVE_UP", "MOVE_DOWN", "MOVE_LEFT", "MOVE_RIGHT"] as Command[]).map((cmd) => {
                                const Icon = COMMAND_ICONS[cmd];
                                return (
                                    <button
                                        key={cmd}
                                        disabled={isRunning || isCompleted}
                                        onClick={() => addCommand(cmd)}
                                        className={cn(
                                            "p-4 rounded-3xl border-2 border-white/5 bg-slate-800/50 flex items-center gap-4 transition-all group",
                                            "hover:bg-slate-700/50 hover:border-white/10 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                        )}
                                    >
                                        <div className={cn("p-2.5 rounded-2xl text-white shadow-lg", COMMAND_COLORS[cmd])}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <span className="font-bold text-slate-300 text-sm">{COMMAND_LABELS[cmd]}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Workspace / Algorithm Chain */}
                    <div className="flex-1 p-6 flex flex-col overflow-hidden">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="bg-indigo-500 w-1.5 h-6 rounded-full" />
                                <h3 className="font-black text-xs text-slate-500 uppercase tracking-[0.3em]">Mi Algoritmo</h3>
                            </div>
                            {program.length > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setProgram([])}
                                    className="text-[10px] font-black uppercase text-slate-500 hover:text-red-400"
                                >
                                    Limpiar Todo
                                </Button>
                            )}
                        </div>

                        <ScrollArea className="flex-1 pr-4">
                            <div className="flex flex-col gap-2">
                                {program.length === 0 ? (
                                    <div className="h-40 border-2 border-dashed border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center text-center px-8">
                                        <Sparkles className="w-8 h-8 text-slate-700 mb-2" />
                                        <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.2em]">Arrastra bloques o haz clic para empezar tu secuencia</p>
                                    </div>
                                ) : (
                                    <AnimatePresence initial={false}>
                                        {program.map((cmd, idx) => {
                                            const Icon = COMMAND_ICONS[cmd];
                                            const isActive = currentStep === idx;
                                            return (
                                                <motion.div
                                                    key={`${idx}-${cmd}`}
                                                    initial={{ x: -20, opacity: 0 }}
                                                    animate={{ x: 0, opacity: 1 }}
                                                    exit={{ x: 20, opacity: 0 }}
                                                    className={cn(
                                                        "group relative flex items-center gap-4 p-4 rounded-3xl border-2 transition-all",
                                                        isActive ? "bg-indigo-500/20 border-indigo-500/40 shadow-xl" : "bg-slate-800/40 border-white/5"
                                                    )}
                                                >
                                                    <div className="text-[10px] font-black text-slate-600 tabular-nums w-4 italic">{idx + 1}</div>
                                                    <div className={cn("p-2 rounded-xl text-white", COMMAND_COLORS[cmd])}>
                                                        <Icon className="w-4 h-4" />
                                                    </div>
                                                    <span className="font-bold text-slate-200 text-sm flex-1">{COMMAND_LABELS[cmd]}</span>

                                                    {!isRunning && !isCompleted && (
                                                        <button
                                                            onClick={() => removeCommand(idx)}
                                                            className="opacity-0 group-hover:opacity-100 p-2 text-slate-500 hover:text-red-400 transition-opacity"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}

                                                    {isActive && (
                                                        <motion.div
                                                            layoutId="active-indicator"
                                                            className="absolute -left-1 w-2 h-8 bg-indigo-500 rounded-full"
                                                        />
                                                    )}
                                                </motion.div>
                                            );
                                        })}
                                    </AnimatePresence>
                                )}
                            </div>
                        </ScrollArea>

                        {/* Footer Info */}
                        <div className="mt-4 p-4 bg-slate-900/50 rounded-[2rem] border border-white/5">
                            <div className="flex items-center gap-3 text-slate-500">
                                <Info className="w-4 h-4 shrink-0" />
                                <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                                    Asegúrate de que la secuencia sea exacta. El robot se detendrá si choca con el borde de la rejilla.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ScrollArea({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <div className={cn("overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent", className)}>
            {children}
        </div>
    );
}
