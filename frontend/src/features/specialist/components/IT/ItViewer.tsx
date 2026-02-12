import { useState, useImperativeHandle, forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Target,
    CheckCircle2,
    ArrowRight,
    ArrowLeft,
    Lightbulb,
    AlertCircle,
    FileText,
    Zap,
    Settings
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link, useLocation, useRoute } from "wouter";

interface ItStep {
    id: number;
    title: string;
    description?: string;
}

const ItViewer = forwardRef(({ levelId: propLevelId, id }: { levelId?: number, id?: string }, ref) => {
    const [match, params] = useRoute("/specialist/it/:id");
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
        variablePrincipal: "",
        condicionRegla: "",
        decisionSistema: "",
        escenarioPrueba: ""
    });

    const steps: ItStep[] = [
        { id: 1, title: "Propósito", description: "Objetivo de Integración" },
        { id: 2, title: "Insumos", description: "Verificación Previa" },
        { id: 3, title: "Concepto", description: "Idea Clave" },
        { id: 4, title: "Ejemplo", description: "Caso Modelo" },
        { id: 5, title: "Reto", description: "Actividad Principal" },
        { id: 6, title: "Prueba", description: "Escenario de Test" },
        { id: 7, title: "Evidencia", description: "Carga de Datos" },
        { id: 8, title: "Validación", description: "Checklist" },
        { id: 9, title: "Competencias", description: "Skills Desarrolladas" },
        { id: 10, title: "Finish", description: "Completado" }
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
                        <div className="relative p-12 bg-slate-900/50 border border-violet-500/20 rounded-[3rem] overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8">
                                <Target className="w-16 h-16 text-violet-500/20 group-hover:text-violet-500 transition-colors duration-700" />
                            </div>
                            <h2 className="text-4xl font-black italic tracking-tighter text-white mb-6 uppercase">
                                Propósito de la <span className="text-violet-500">Iteración</span>
                            </h2>
                            <p className="text-xl text-slate-300 leading-relaxed font-medium max-w-2xl border-l-4 border-violet-500 pl-8">
                                Integrar conocimientos previos para que tu sistema tome decisiones basadas en datos, demostrando comprensión real del comportamiento sistémico.
                            </p>
                            <div className="mt-12 flex items-center gap-4">
                                <div className="p-3 bg-violet-500/20 rounded-2xl">
                                    <Zap className="w-6 h-6 text-violet-400" />
                                </div>
                                <span className="text-sm font-black uppercase tracking-widest text-violet-400/80">Esta IT integra todo lo aprendido en los BDs anteriores.</span>
                            </div>
                        </div>
                    </div>
                );
            case 5:
                return (
                    <div className="max-w-3xl mx-auto space-y-8">
                        <div className="text-center space-y-4 mb-12">
                            <Badge className="bg-violet-500/10 text-violet-500 border-violet-500/20 uppercase tracking-widest font-black">Reto de Integración</Badge>
                            <h2 className="text-5xl font-black tracking-tighter text-white">EL <span className="text-violet-500">DESAFÍO</span></h2>
                            <p className="text-slate-400 font-medium">Ajusta tu sistema para que tome decisiones basadas en datos.</p>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            {[
                                { id: 'variablePrincipal', label: '1️⃣ Variable Principal', placeholder: 'Variable que influye en la decisión' },
                                { id: 'condicionRegla', label: '2️⃣ Condición o Regla', placeholder: 'Ej: Si ___ es mayor que ___' },
                                { id: 'decisionSistema', label: '3️⃣ Decisión del Sistema', placeholder: 'Ej: Generar alerta, Cambiar estado' }
                            ].map((field) => (
                                <div key={field.id} className="group flex flex-col gap-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-focus-within:text-violet-500 transition-colors">{field.label}</label>
                                    <input
                                        type="text"
                                        value={(formData as any)[field.id]}
                                        onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                                        placeholder={field.placeholder}
                                        className="bg-slate-900 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/5 transition-all w-full"
                                    />
                                </div>
                            ))}
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
                                className="absolute inset-0 bg-violet-500 blur-3xl opacity-20"
                            />
                            <div className="relative w-32 h-32 bg-slate-900 border-2 border-violet-500 rounded-[2.5rem] flex items-center justify-center mx-auto">
                                <CheckCircle2 className="w-16 h-16 text-violet-400" />
                            </div>
                        </div>
                        <h2 className="text-6xl font-black italic tracking-tighter text-white">ITERACIÓN <span className="text-violet-500">LOGRADA</span></h2>
                        <p className="text-slate-400 max-w-md mx-auto font-medium">Has completado la Iteración de Integración. Tu sistema ahora toma decisiones inteligentes.</p>
                        <div className="pt-8">
                            <Button
                                onClick={() => setLocation('/dashboard')}
                                className="h-16 px-12 bg-violet-600 hover:bg-violet-500 text-white rounded-[2rem] font-black italic tracking-tighter text-xl gap-4 shadow-2xl shadow-violet-500/20 transition-all hover:scale-105"
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

export default ItViewer;
