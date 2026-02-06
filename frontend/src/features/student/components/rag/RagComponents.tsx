import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    ArrowRight,
    ArrowLeft,
    Sparkles,
    BookOpen,
    CheckCircle2,
    Lock,
    Play,
    FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import canvasConfetti from "canvas-confetti";

// --- Intro Splash Component ---
export const IntroSplash = ({
    title,
    purpose,
    modality,
    type,
    onStart
}: {
    title: string;
    purpose: string;
    modality: string;
    type?: string;
    onStart: () => void;
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative w-full h-full overflow-y-auto rounded-3xl bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 text-white flex flex-col items-center justify-start p-8 md:p-12 text-center shadow-2xl custom-scrollbar"
        >
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-10 left-10 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            <div className="relative z-10 max-w-2xl space-y-8">
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6">
                        <Sparkles className="w-4 h-4 text-yellow-300" />
                        <span className="text-sm font-medium tracking-wide text-blue-100">GUÍA DE APRENDIZAJE INTERACTIVA</span>
                    </div>
                    <h1 className="text-2xl md:text-4xl lg:text-5xl font-black tracking-tight mb-4 md:mb-8 bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-purple-200 leading-tight">
                        {title}
                    </h1>
                    <p className="text-xl text-blue-100/90 leading-relaxed font-light">
                        {purpose}
                    </p>
                </motion.div>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex gap-3 justify-center"
                >
                    <Badge className="bg-blue-500/30 text-blue-100 border-blue-400/30 px-4 py-1.5 text-md">
                        Modalidad: {modality}
                    </Badge>
                    {type && (
                        <Badge className="bg-purple-500/30 text-purple-100 border-purple-400/30 px-4 py-1.5 text-md">
                            Enfoque: {type}
                        </Badge>
                    )}
                </motion.div>

                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.6, type: "spring" }}
                    className="pt-8"
                >
                    <Button
                        onClick={onStart}
                        size="lg"
                        className="bg-white text-indigo-900 hover:bg-blue-50 hover:scale-105 transition-all text-xl px-12 py-8 rounded-2xl shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] font-black group"
                    >
                        Comenzar Aventura
                        <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </motion.div>
            </div>
        </motion.div>
    );
};

// --- Concept Deck Component ---
export const ConceptDeck = ({
    concepts,
    onComplete,
    currentIndex,
    setCurrentIndex
}: {
    concepts: any[];
    onComplete: () => void;
    currentIndex: number;
    setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
}) => {
    const [direction, setDirection] = useState(0);

    const nextCard = () => {
        if (currentIndex < concepts.length - 1) {
            setDirection(1);
            setCurrentIndex(prev => prev + 1);
        } else {
            // End of deck
            triggerConfetti();
            onComplete();
        }
    };

    const previousCard = () => {
        if (currentIndex > 0) {
            setDirection(-1);
            setCurrentIndex(prev => prev - 1);
        }
    };

    const triggerConfetti = () => {
        canvasConfetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    };

    return (
        <div className="max-w-3xl mx-auto py-4">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-indigo-600" />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                        Conceptos Clave
                    </span>
                </h3>
                <p className="text-sm text-slate-500 mb-8 max-w-lg mt-1">
                    Estos son los fundamentos teóricos que necesitarás dominar para aplicar en la parte práctica. Revísalos con atención.
                </p>
                <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                    <span>{currentIndex + 1} de {concepts.length}</span>
                    <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${((currentIndex + 1) / concepts.length) * 100}%` }}
                        />
                    </div>
                </div>
            </div>

            <div className="relative h-[400px] w-full perspective-1000">
                <AnimatePresence initial={false} mode="wait" custom={direction}>
                    <motion.div
                        key={currentIndex}
                        custom={direction}
                        variants={{
                            enter: (direction: number) => ({
                                x: direction > 0 ? 1000 : -1000,
                                opacity: 0,
                                rotateY: direction > 0 ? 45 : -45,
                                scale: 0.8
                            }),
                            center: {
                                zIndex: 1,
                                x: 0,
                                opacity: 1,
                                rotateY: 0,
                                scale: 1
                            },
                            exit: (direction: number) => ({
                                zIndex: 0,
                                x: direction < 0 ? 1000 : -1000,
                                opacity: 0,
                                rotateY: direction < 0 ? 45 : -45,
                                scale: 0.8
                            })
                        }}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: "spring", stiffness: 300, damping: 30 },
                            opacity: { duration: 0.2 }
                        }}
                        className="absolute w-full h-full"
                    >
                        <Card className="h-full border-0 shadow-2xl bg-white rounded-3xl overflow-hidden flex flex-col md:flex-row">
                            <div className={cn(
                                "w-full md:w-5/12 h-48 md:h-full bg-slate-100 relative group overflow-hidden shrink-0",
                                !concepts[currentIndex].imagenUrl && "bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center"
                            )}>
                                {concepts[currentIndex].imagenUrl ? (
                                    <img
                                        src={concepts[currentIndex].imagenUrl}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        alt={concepts[currentIndex].titulo}
                                    />
                                ) : (
                                    <BookOpen className="w-24 h-24 text-indigo-100" />
                                )}
                                <div className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur shadow-md flex items-center justify-center font-bold text-indigo-800 text-lg">
                                    {currentIndex + 1}
                                </div>
                            </div>

                            <div className="flex-1 p-8 flex flex-col h-full bg-white relative overflow-hidden min-w-0">
                                <div className="absolute top-0 right-0 p-3 opacity-5">
                                    <BookOpen className="w-40 h-40" />
                                </div>
                                <h2 className="text-2xl md:text-3xl font-black text-slate-800 mb-6 leading-tight">
                                    {concepts[currentIndex].titulo}
                                </h2>

                                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                                    <div className="prose prose-slate text-slate-600 leading-relaxed text-lg">
                                        {concepts[currentIndex].descripcion}
                                    </div>
                                </div>

                                <div className="mt-6 flex justify-between items-center pt-6 border-t border-slate-100 shrink-0">
                                    <Button
                                        variant="ghost"
                                        onClick={previousCard}
                                        disabled={currentIndex === 0}
                                        className="text-slate-400 hover:text-indigo-600"
                                    >
                                        Anterior
                                    </Button>
                                    <Button
                                        onClick={nextCard}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-8 shadow-lg shadow-indigo-200"
                                    >
                                        {currentIndex === concepts.length - 1 ? "Completar" : "Siguiente"}
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

// --- Mission Timeline Component ---
export const MissionTimeline = ({
    steps,
    currentStepIndex,
    completedSteps,
    onStepSelect,
    onStepComplete,
    stepDeliverable,
    isUploading,
    onFileUpload,
    onPrevStep
}: {
    steps: any[];
    currentStepIndex: number;
    completedSteps: number[];
    onStepSelect: (idx: number) => void;
    onStepComplete: () => void;
    stepDeliverable: File | null;
    isUploading: boolean;
    onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onPrevStep: () => void;
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="flex gap-4 max-w-7xl mx-auto py-2 h-full min-h-0">
            {/* Sidebar Timeline */}
            <div className="w-1/4 shrink-0 bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden flex flex-col">
                <div className="p-4 bg-slate-50 border-b border-slate-100">
                    <h3 className="font-bold text-slate-800 text-md flex items-center gap-2">
                        📍 Ruta de Misión
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                        Sigue estos pasos secuenciales para completar el desafío.
                    </p>
                    <div className="mt-2 text-sm text-slate-500">
                        {completedSteps.length} de {steps.length} completados
                    </div>
                    {/* Overall progress */}
                    <div className="h-1.5 w-full bg-slate-200 mt-2 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-green-500 transition-all duration-500"
                            style={{ width: `${(completedSteps.length / steps.length) * 100}%` }}
                        />
                    </div>
                </div>

                <div className="overflow-y-auto flex-1 p-4 space-y-3 custom-scrollbar">
                    {steps.map((step, idx) => {
                        const isCompleted = completedSteps.includes(idx);
                        const isCurrent = idx === currentStepIndex;
                        const isLocked = !isCompleted && !isCurrent && idx > Math.max(0, ...completedSteps, -1) + 1;

                        return (
                            <button
                                key={idx}
                                disabled={isLocked}
                                onClick={() => onStepSelect(idx)}
                                className={cn(
                                    "w-full text-left p-3 rounded-xl border transition-all relative overflow-hidden group",
                                    isCurrent ? "border-indigo-500 bg-indigo-50 shadow-md ring-1 ring-indigo-200" :
                                        isCompleted ? "border-green-200 bg-green-50/50 hover:bg-green-100 opacity-60" :
                                            "border-slate-100 bg-white hover:bg-slate-50 hover:border-slate-300"
                                )}
                            >
                                <div className="flex items-start gap-3 relative z-10">
                                    <div className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors",
                                        isCurrent ? "bg-indigo-600 text-white" :
                                            isCompleted ? "bg-green-500 text-white" :
                                                "bg-slate-200 text-slate-500"
                                    )}>
                                        {isCompleted ? <CheckCircle2 className="w-5 h-5" /> :
                                            isLocked ? <Lock className="w-4 h-4" /> : idx + 1}
                                    </div>
                                    <div className="min-w-0">
                                        <p className={cn(
                                            "text-sm font-semibold truncate",
                                            isCurrent ? "text-indigo-900" :
                                                isCompleted ? "text-green-800" : "text-slate-600"
                                        )}>
                                            Paso {idx + 1}
                                        </p>
                                        <p className="text-xs text-slate-500 truncate mt-0.5">
                                            {step.paso}
                                        </p>
                                    </div>
                                </div>
                                {isCurrent && (
                                    <motion.div
                                        layoutId="active-highlight"
                                        className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600 rounded-l"
                                    />
                                )}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Main Stage */}
            <div className="flex-1 bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden relative flex flex-col">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStepIndex}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="flex flex-col h-full bg-slate-50/50"
                    >
                        {/* Header */}
                        <div className="p-6 pb-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-wider mb-2">
                                Paso {currentStepIndex + 1}
                            </div>
                            <h2 className="text-2xl font-black text-slate-800 leading-tight">
                                {steps[currentStepIndex]?.paso}
                            </h2>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto px-6 pb-6 custom-scrollbar">
                            {steps[currentStepIndex]?.imagenUrl && (
                                <div className="w-full max-h-[400px] min-h-[200px] bg-slate-100 rounded-2xl overflow-hidden mb-6 shadow-sm border border-slate-200 relative group">
                                    <img
                                        src={steps[currentStepIndex].imagenUrl}
                                        className="w-full h-full object-contain mix-blend-multiply"
                                        alt="Ilustración del paso"
                                    />
                                </div>
                            )}

                            {/* Description or Details could go here if the API provided them separate from the title */}

                            {/* Action Area */}
                            {steps[currentStepIndex]?.requiereEntregable ? (
                                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                                    <h4 className="font-bold text-slate-700 text-sm flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-indigo-500" />
                                        Evidencia Requerida
                                    </h4>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        onChange={onFileUpload}
                                    />
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className={cn(
                                            "border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99]",
                                            stepDeliverable
                                                ? "bg-green-50 border-green-400"
                                                : "bg-slate-50 border-slate-300 hover:border-indigo-400 hover:bg-slate-100"
                                        )}
                                    >
                                        {stepDeliverable ? (
                                            <div className="space-y-2">
                                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
                                                    <CheckCircle2 className="w-6 h-6" />
                                                </div>
                                                <p className="font-semibold text-green-800">{stepDeliverable.name}</p>
                                                <p className="text-xs text-green-600">Click para cambiar archivo</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mx-auto text-indigo-500">
                                                    <Sparkles className="w-6 h-6" />
                                                </div>
                                                <p className="font-semibold text-slate-700">Sube tu evidencia</p>
                                                <p className="text-xs text-slate-500">Imagen o archivo del resultado</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-3">
                                        <Button
                                            variant="outline"
                                            onClick={onPrevStep}
                                            disabled={currentStepIndex === 0}
                                            className="flex-1 h-10 text-sm"
                                        >
                                            Anterior
                                        </Button>
                                        <Button
                                            onClick={onStepComplete}
                                            disabled={!stepDeliverable || isUploading}
                                            className="flex-[2] h-10 text-sm bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20"
                                        >
                                            {isUploading ? "Subiendo..." : "Completar y Continuar"}
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex gap-3">
                                    <Button
                                        variant="outline"
                                        onClick={onPrevStep}
                                        disabled={currentStepIndex === 0}
                                        className="flex-1 h-12 text-md rounded-xl"
                                    >
                                        Anterior
                                    </Button>
                                    <Button
                                        onClick={onStepComplete}
                                        className="flex-[2] h-12 text-md font-bold bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-lg shadow-green-500/20 transform hover:-translate-y-0.5 transition-all"
                                    >
                                        ✅ Siguiente Paso
                                    </Button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
