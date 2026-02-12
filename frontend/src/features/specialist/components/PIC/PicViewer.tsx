import { useState, useImperativeHandle, forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Rocket,
    CheckCircle2,
    ArrowRight,
    ArrowLeft,
    Target,
    FileText,
    Users,
    Calendar,
    Settings,
    Sparkles
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link, useLocation, useRoute } from "wouter";

interface PicStep {
    id: number;
    title: string;
    description?: string;
}

const PicViewer = forwardRef(({ levelId: propLevelId, id }: { levelId?: number, id?: string }, ref) => {
    const [match, params] = useRoute("/specialist/pic/:id");
    const [location, setLocation] = useLocation();
    const routeLevelId = match && params ? (params as any).id : null;
    const levelId = propLevelId || routeLevelId;
    const [currentStep, setCurrentStep] = useState(1);

    useImperativeHandle(ref, () => ({
        goNext: () => {
            if (currentStep < 10) {
                setCurrentStep(prev => prev + 1);
                return { handled: true };
            }
            return { handled: false };
        },
        goPrev: () => {
            if (currentStep > 1) {
                setCurrentStep(prev => prev - 1);
                return { handled: true };
            }
            return { handled: false };
        }
    }));
    const [formData, setFormData] = useState({
        alcanceProyecto: "",
        objetivoPrincipal: "",
        entregables: "",
        cronograma: ""
    });

    const steps: PicStep[] = [
        { id: 1, title: "Propósito", description: "Visión del Proyecto" },
        { id: 2, title: "Alcance", description: "Definición del Proyecto" },
        { id: 3, title: "Objetivos", description: "Metas a Lograr" },
        { id: 4, title: "Entregables", description: "Productos Finales" },
        { id: 5, title: "Cronograma", description: "Plan de Trabajo" },
        { id: 6, title: "Recursos", description: "Herramientas Necesarias" },
        { id: 7, title: "Desarrollo", description: "Ejecución del Proyecto" },
        { id: 8, title: "Evidencia", description: "Documentación" },
        { id: 9, title: "Presentación", description: "Demo Final" },
        { id: 10, title: "Finish", description: "Proyecto Completado" }
    ];

    const handleNext = () => {
        if (currentStep < 10) setCurrentStep(prev => prev + 1);
    };

    const handlePrev = () => {
        if (currentStep > 1) setCurrentStep(prev => prev - 1);
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-8">
                        <div className="relative p-12 bg-slate-900/50 border border-emerald-500/20 rounded-[3rem] overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8">
                                <Rocket className="w-16 h-16 text-emerald-500/20 group-hover:text-emerald-500 transition-colors duration-700" />
                            </div>
                            <h2 className="text-4xl font-black italic tracking-tighter text-white mb-6 uppercase">
                                Proyecto de <span className="text-emerald-500">Innovación</span>
                            </h2>
                            <p className="text-xl text-slate-300 leading-relaxed font-medium max-w-2xl border-l-4 border-emerald-500 pl-8">
                                Desarrollar un proyecto integral que demuestre tu capacidad para aplicar todos los conocimientos técnicos adquiridos en una solución innovadora y funcional.
                            </p>
                            <div className="mt-12 flex items-center gap-4">
                                <div className="p-3 bg-emerald-500/20 rounded-2xl">
                                    <Sparkles className="w-6 h-6 text-emerald-400" />
                                </div>
                                <span className="text-sm font-black uppercase tracking-widest text-emerald-400/80">Este PIC es el producto culminante del ciclo.</span>
                            </div>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="max-w-3xl mx-auto space-y-8">
                        <div className="text-center space-y-4 mb-12">
                            <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 uppercase tracking-widest font-black">Definición del Proyecto</Badge>
                            <h2 className="text-5xl font-black tracking-tighter text-white">ALCANCE DEL <span className="text-emerald-500">PROYECTO</span></h2>
                            <p className="text-slate-400 font-medium">Define claramente qué abarcará tu proyecto de innovación.</p>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            <div className="group flex flex-col gap-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-focus-within:text-emerald-500 transition-colors">Alcance del Proyecto</label>
                                <textarea
                                    value={formData.alcanceProyecto}
                                    onChange={(e) => setFormData({ ...formData, alcanceProyecto: e.target.value })}
                                    placeholder="Describe qué incluirá y qué no incluirá tu proyecto..."
                                    className="bg-slate-900 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 transition-all w-full min-h-[120px]"
                                />
                            </div>
                        </div>
                    </div>
                );
            case 10:
                return (
                    <div className="text-center space-y-8 py-12">
                        <div className="relative inline-block">
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 4, repeat: Infinity }}
                                className="absolute inset-0 bg-emerald-500 blur-3xl opacity-20"
                            />
                            <div className="relative w-32 h-32 bg-slate-900 border-2 border-emerald-500 rounded-[2.5rem] flex items-center justify-center mx-auto">
                                <CheckCircle2 className="w-16 h-16 text-emerald-400" />
                            </div>
                        </div>
                        <h2 className="text-6xl font-black italic tracking-tighter text-white">PROYECTO <span className="text-emerald-500">COMPLETADO</span></h2>
                        <p className="text-slate-400 max-w-md mx-auto font-medium">Has finalizado tu Proyecto de Innovación. ¡Felicitaciones por tu trabajo!</p>
                        <div className="pt-8">
                            <Button
                                onClick={() => setLocation('/dashboard')}
                                className="h-16 px-12 bg-emerald-600 hover:bg-emerald-500 text-white rounded-[2rem] font-black italic tracking-tighter text-xl gap-4 shadow-2xl shadow-emerald-500/20 transition-all hover:scale-105"
                            >
                                VOLVER AL HUB <ArrowRight className="w-6 h-6" />
                            </Button>
                        </div>
                    </div>
                );
            default:
                return (
                    <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-white/5 rounded-[3rem]">
                        <p className="text-slate-600 font-black uppercase tracking-widest text-[10px]">Módulo en Construcción - Fase {currentStep}</p>
                        <Settings className="w-8 h-8 text-slate-800 animate-spin mt-4" />
                    </div>
                );
        }
    };

    return (
        <div className="w-full h-full text-white">
            <div className="max-w-6xl mx-auto py-8">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.98 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                    >
                        {renderStepContent()}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
});

export default PicViewer;
