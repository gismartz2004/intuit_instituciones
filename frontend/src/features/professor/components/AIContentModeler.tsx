import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, BrainCircuit, LayoutGrid, Save, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLocation } from "wouter";
import professorApi from "@/features/professor/services/professor.api";
import { toast } from "@/hooks/use-toast";
import { ACADEMIC_MODEL_JSON, AIModelPattern } from "../data/aiModelData";
import { cn } from "@/lib/utils";

interface AIContentModelerProps {
    professorId?: string;
}

export default function AIContentModeler({ professorId = "1" }: AIContentModelerProps) {
    const [prompt, setPrompt] = useState("");
    const [isModeling, setIsModeling] = useState(false);
    const [result, setResult] = useState<AIModelPattern | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [, setLocation] = useLocation();

    const runModel = () => {
        if (!prompt.trim()) return;
        setIsModeling(true);
        setResult(null);

        // Simulate local "neural" processing
        setTimeout(() => {
            const lowerPrompt = prompt.toLowerCase();
            const matchedPattern = ACADEMIC_MODEL_JSON.find(p =>
                p.keywords.some(k => lowerPrompt.includes(k))
            );

            // Clone to allow editing
            setResult(matchedPattern ? JSON.parse(JSON.stringify(matchedPattern)) : null);
            setIsModeling(false);
        }, 1500);
    };

    const updateModuleTitle = (idx: number, title: string) => {
        if (!result) return;
        const newResult = { ...result };
        newResult.modules[idx].title = title;
        setResult(newResult);
    };

    const updateLevelTitle = (mIdx: number, lIdx: number, title: string) => {
        if (!result) return;
        const newResult = { ...result };
        newResult.modules[mIdx].levels[lIdx].title = title;
        setResult(newResult);
    };

    const updateLevelObjective = (mIdx: number, lIdx: number, objective: string) => {
        if (!result) return;
        const newResult = { ...result };
        newResult.modules[mIdx].levels[lIdx].objective = objective;
        setResult(newResult);
    };

    const handleSave = async () => {
        if (!result) return;
        setIsSaving(true);

        try {
            // 1. Create the Course first
            const newCourse = await professorApi.createCourse({
                nombre: `Curso IA: ${result.grade}`,
                descripcion: `Personalizado para ${prompt.substring(0, 50)}...`,
                imagenUrl: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1965&auto=format&fit=crop",
                profesorId: professorId
            });

            for (const mod of result.modules) {
                // 2. Create the module linked to the course
                const newModule = await professorApi.createModule({
                    title: mod.title,
                    description: mod.description,
                    professorId: professorId,
                    cursoId: Number(newCourse.id)
                } as any);

                // 3. Create the levels for this module
                for (let i = 0; i < mod.levels.length; i++) {
                    const lvl = mod.levels[i];
                    await professorApi.createLevel(newModule.id.toString(), {
                        tituloNivel: lvl.title,
                        descripcion: lvl.objective,
                        orden: i + 1,
                        bloqueadoManual: false,
                        diasParaDesbloquear: 7
                    });
                }
            }

            toast({
                title: "¡Currículo Activado!",
                description: "El curso y sus módulos han sido creados."
            });

            setResult(null);
            setPrompt("");
            window.location.reload();
        } catch (error) {
            console.error("Error saving AI curriculum:", error);
            toast({
                title: "Error",
                description: "No se pudo guardar. Revisa la consola.",
                variant: "destructive"
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col gap-2">
                <h2 className="text-2xl font-black text-slate-800 uppercase italic tracking-tight">Intuit Modeler (IA)</h2>
                <p className="text-slate-500 font-medium">Modelado de currículo dinámico por grados y objetivos.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* Input Panel */}
                <Card className="border-2 border-slate-100 shadow-xl rounded-[2rem] overflow-hidden">
                    <CardHeader className="bg-slate-50 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="bg-purple-600 p-2 rounded-xl">
                                <BrainCircuit className="w-5 h-5 text-white" />
                            </div>
                            <CardTitle className="text-lg">Red Neuronal Local</CardTitle>
                        </div>
                        <CardDescription>Dime el grado y los temas que quieres modelar.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        <div className="relative">
                            <Textarea
                                placeholder="Ej: Necesito 3 módulos de Arduino para Septimo de Básica durante 9 meses..."
                                className="min-h-[150px] rounded-2xl border-slate-200 focus:ring-purple-500/20 focus:border-purple-500 p-6 text-lg font-medium leading-relaxed"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                            />
                            <div className="absolute bottom-4 right-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                INTUIT AI CORE
                            </div>
                        </div>

                        <Button
                            onClick={runModel}
                            disabled={isModeling || !prompt.trim()}
                            className="w-full h-14 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-purple-200 group"
                        >
                            {isModeling ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Modelando...
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 group-hover:scale-125 transition-transform" />
                                    Generar Módulo
                                </div>
                            )}
                        </Button>
                    </CardContent>
                </Card>

                {/* Preview Panel */}
                <div className="relative min-h-[500px]">
                    <AnimatePresence mode="wait">
                        {isModeling ? (
                            <motion.div
                                key="modeling"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 flex flex-col items-center justify-center gap-6"
                            >
                                <div className="relative">
                                    <motion.div
                                        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="absolute inset-0 bg-purple-500 rounded-full blur-3xl"
                                    />
                                    <BrainCircuit className="w-24 h-24 text-purple-600 relative z-10" />
                                </div>
                                <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Analizando Patrones Académicos</p>
                            </motion.div>
                        ) : result ? (
                            <motion.div
                                key="result"
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="space-y-6"
                            >
                                <div className="flex items-center justify-between bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-emerald-500 p-2 rounded-lg text-white">
                                            <Sparkles className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-slate-800 text-sm uppercase italic leading-none">Modelo Generado</h3>
                                            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{result.grade}</p>
                                        </div>
                                    </div>
                                    <Button size="sm" variant="ghost" className="text-slate-400" onClick={() => setResult(null)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>

                                <div className="space-y-4">
                                    {result.modules.map((mod, i) => (
                                        <Card key={i} className="border-2 border-slate-100 overflow-hidden rounded-[2rem] shadow-lg hover:border-purple-100 transition-all">
                                            <div className="bg-slate-900 p-6 text-white relative">
                                                <div className="flex justify-between items-start gap-4">
                                                    <input
                                                        className="bg-transparent border-b border-white/20 text-xl font-black italic tracking-tighter uppercase focus:outline-none focus:border-purple-500 w-full"
                                                        value={mod.title}
                                                        onChange={(e) => updateModuleTitle(i, e.target.value)}
                                                    />
                                                    <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 font-black shrink-0">{mod.durationMonths} Meses</Badge>
                                                </div>
                                            </div>
                                            <CardContent className="p-0">
                                                <div className="p-4 bg-slate-50 border-b border-slate-100">
                                                    <p className="text-slate-500 text-sm font-medium italic">"{mod.description}"</p>
                                                </div>
                                                {mod.levels.map((lvl, li) => (
                                                    <div key={li} className="flex flex-col gap-2 p-5 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-all group">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 font-black shrink-0">
                                                                {li + 1}
                                                            </div>
                                                            <div className="flex-1">
                                                                <input
                                                                    className="bg-transparent border-b border-transparent hover:border-slate-200 focus:border-purple-500 font-bold text-slate-800 focus:outline-none w-full"
                                                                    value={lvl.title}
                                                                    onChange={(e) => updateLevelTitle(i, li, e.target.value)}
                                                                />
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <Badge variant="outline" className="text-[9px] uppercase font-black px-1.5 py-0 border-slate-200 text-slate-400">{lvl.type}</Badge>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <textarea
                                                            className="ml-14 bg-transparent border-0 text-[11px] text-slate-500 font-medium focus:outline-none focus:ring-1 focus:ring-purple-100 rounded p-1 resize-none h-12 italic"
                                                            value={lvl.objective}
                                                            onChange={(e) => updateLevelObjective(i, li, e.target.value)}
                                                        />
                                                    </div>
                                                ))}
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>

                                <div className="fixed bottom-12 right-12 z-50 flex flex-col items-center gap-2">
                                    <p className="text-slate-400 font-black text-[9px] uppercase tracking-widest bg-white/80 backdrop-blur-md px-4 py-1 rounded-full shadow-sm border border-slate-100">¿Todo listo? Actívalo ahora</p>
                                    <Button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="bg-slate-900 hover:bg-slate-800 text-white h-16 px-12 rounded-2xl font-black uppercase tracking-widest shadow-2xl scale-110"
                                    >
                                        {isSaving ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Activando...
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                                Crear Curso Personalizado
                                            </div>
                                        )}
                                    </Button>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="h-[500px] flex flex-col items-center justify-center text-slate-300 gap-4 border-2 border-dashed border-slate-100 rounded-[3rem] bg-slate-50/50">
                                <LayoutGrid className="w-16 h-16 opacity-30" />
                                <div className="text-center px-8">
                                    <p className="font-black uppercase tracking-widest text-sm opacity-50 mb-1">Esperando tu Visión</p>
                                    <p className="text-xs opacity-40">Dime qué tienes en mente y yo dibujaré el currículo por ti.</p>
                                </div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
