import { createPortal } from "react-dom";
import { useEffect, useState, useRef, forwardRef, useImperativeHandle } from "react";
import { studentApi } from "@/features/student/services/student.api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, CheckCircle2, Target, Lightbulb, Trophy, FileText, MessageSquare, ListTodo, Circle, ArrowRight, Sparkles, ChevronLeft, ChevronRight, BookOpen, Play } from "lucide-react";
import AvatarGuide from "./AvatarGuide";
import { AvatarState } from "@/types/gamification";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface HaViewerProps {
    levelId: number;
    onAddPoints?: (amount: number, reason: string) => void;
    hasAttended?: boolean;
}

type HaSection = 'intro' | 'context' | 'evidence' | 'reflection' | 'completion';

export const HaViewer = forwardRef(({ levelId, onAddPoints, hasAttended }: HaViewerProps, ref) => {
    const [haData, setHaData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [currentSection, setCurrentSection] = useState<HaSection>('intro');
    const [evidenceFiles, setEvidenceFiles] = useState<{ type: string, file: File | null, url?: string }[]>([]);
    const [reflection, setReflection] = useState("");
    const [expandedStepIndex, setExpandedStepIndex] = useState<number | null>(0); // Default first step open

    const getStudentId = () => {
        const userStr = localStorage.getItem('edu_user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                // Check for different user object structures
                const id = user.id || user.user?.id || (user.userData && user.userData.id);
                return id ? id.toString() : "1";
            } catch (e) {
                console.warn("Failed to parse edu_user for HA:", e);
                return "1";
            }
        }
        return "1";
    };

    const [avatarState, setAvatarState] = useState<AvatarState>({
        isVisible: true,
        emotion: 'thinking',
        message: "¡Bienvenido al Hito de Aprendizaje! Soy tu tutor IA y aquí consolidaremos todo lo que has progresado."
    });

    // Proactive hints on idle
    useEffect(() => {
        if (currentSection === 'intro' || currentSection === 'completion') return;

        const idleTimer = setTimeout(() => {
            if (currentSection === 'evidence' && evidenceFiles.length === 0) {
                setAvatarState({
                    emotion: 'waiting',
                    message: "No olvides subir tu evidencia. Haz clic en el área para simular la carga.",
                    isVisible: true
                });
            } else if (currentSection === 'reflection' && reflection.length < 10) {
                setAvatarState({
                    emotion: 'thinking',
                    message: "Escribe al menos unas palabras sobre lo que aprendiste. ¡Me interesa saber!",
                    isVisible: true
                });
            }
        }, 20000); // Show hint after 20 seconds of inactivity

        return () => clearTimeout(idleTimer);
    }, [currentSection, evidenceFiles, reflection]);

    useEffect(() => {
        const fetchHa = async () => {
            if (!levelId) return;
            try {
                const data = await studentApi.getHaTemplate(levelId);

                // Validate if data exists and has ID (to avoid 400 on submissions fetch)
                if (data && data.id) {
                    setHaData(data);

                    // Restore progress
                    const studentId = parseInt(getStudentId());
                    if (studentId && !isNaN(studentId)) {
                        try {
                            const submissions = await studentApi.getHaSubmissions(studentId, data.id);
                            if (submissions && submissions.length > 0) {
                                setCurrentSection('completion');

                                // Hydrate evidence for "Review" mode if they go back
                                const files = submissions.flatMap((s: any) =>
                                    (s.archivosUrls || []).map((url: string) => ({
                                        type: 'Archivo Previo',
                                        file: new File(["previo"], "evidencia_guardada", { type: "application/octet-stream" }),
                                        url: url
                                    }))
                                );
                                setEvidenceFiles(files);
                            }
                        } catch (subErr) {
                            console.warn("Failed to fetch HA submissions:", subErr);
                        }
                    }
                } else {
                    setHaData(null);
                }
            } catch (err) {
                console.error("Error in fetchHa:", err);
                setHaData(null);
            } finally {
                setLoading(false);
            }
        };
        fetchHa();
    }, [levelId]);

    const handlePrevSection = () => {
        const sections: HaSection[] = ['intro', 'context', 'evidence', 'reflection', 'completion'];
        const currentIndex = sections.indexOf(currentSection);
        if (currentIndex > 0) {
            setCurrentSection(sections[currentIndex - 1]);
        }
    };

    const handleNextSection = async () => {
        const sections: HaSection[] = ['intro', 'context', 'evidence', 'reflection', 'completion'];
        const currentIndex = sections.indexOf(currentSection);

        if (currentIndex < sections.length - 1) {
            const nextSection = sections[currentIndex + 1];

            // Handle submission before moving to completion
            if (nextSection === 'completion') {
                try {
                    await studentApi.submitHaEvidence({
                        studentId: getStudentId(),
                        plantillaHaId: haData.id,
                        archivosUrls: evidenceFiles.map(e => e.url).filter((u): u is string => !!u),
                        comentarioEstudiante: reflection
                    });
                } catch (error) {
                    console.error("Error submitting HA", error);
                }
            }

            setCurrentSection(nextSection);

            switch (nextSection) {
                case 'context':
                    setAvatarState({
                        emotion: 'happy',
                        message: "Antes de empezar, veamos las metas de aprendizaje y las competencias que vas a adquirir hoy.",
                        isVisible: true
                    });
                    break;
                case 'evidence':
                    setAvatarState({
                        emotion: 'happy',
                        message: "¡Fundamentos claros! Es hora de pasar a la acción y subir tu evidencia maestra.",
                        isVisible: true
                    });
                    break;
                case 'reflection':
                    setAvatarState({
                        emotion: 'thinking',
                        message: "Gran trabajo. Ahora, reflexionemos sobre lo que este hito significa para tu camino de aprendizaje.",
                        isVisible: true
                    });
                    break;
                case 'completion':
                    setAvatarState({
                        emotion: 'celebrating',
                        message: "¡Misión cumplida! Has demostrado un gran dominio. ¡Sigue así!",
                        isVisible: true
                    });
                    break;
            }
        }
    };

    useImperativeHandle(ref, () => ({
        goNext: () => {
            if (currentSection === 'evidence' && evidenceFiles.length === 0) {
                setAvatarState({
                    emotion: 'alert',
                    message: "¡Espera! Debes subir tu evidencia antes de avanzar.",
                    isVisible: true
                });
                return { handled: true, blocked: true };
            }
            if (currentSection === 'completion') return { handled: false, finished: true };
            handleNextSection();
            return { handled: true, blocked: false };
        },
        goPrev: () => {
            if (currentSection === 'intro') return { handled: false };
            handlePrevSection();
            return { handled: true };
        }
    }));

    const fileInputRef = useRef<HTMLInputElement>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollAreaRef.current) {
            const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (viewport) {
                viewport.scrollTop = 0;
            }
        }
    }, [currentSection]);

    const handleEvidenceUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const type = file.type.startsWith('image/') ? 'Imagen' : file.type.startsWith('video/') ? 'Video' : 'Documento';

            // Optimistic update
            setEvidenceFiles(prev => {
                const existing = prev.findIndex(e => e.type === type);
                if (existing >= 0) {
                    const updated = [...prev];
                    updated[existing] = { type, file }; // URL pending
                    return updated;
                }
                return [...prev, { type, file }];
            });

            // Upload
            try {
                setAvatarState({ emotion: 'thinking', message: 'Subiendo archivo...', isVisible: true });
                const res = await studentApi.uploadEvidence(file);

                // Update with URL
                setEvidenceFiles(prev => prev.map(item =>
                    item.file === file ? { ...item, url: res.url } : item
                ));

                onAddPoints?.(100, "Evidencia subida");
                setAvatarState({
                    emotion: 'happy',
                    message: `¡Genial! Has subido "${file.name}". Continúa cuando estés listo.`,
                    isVisible: true
                });
            } catch (error: any) {
                console.error("HA Upload error:", error);
                setAvatarState({
                    emotion: 'alert',
                    message: `Error al subir la evidencia: ${error.message || 'Verifica tu conexión y el tamaño del archivo.'}`,
                    isVisible: true
                });
            }
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    // Handle Avatar Message for Attendance
    useEffect(() => {
        if (haData && !hasAttended) {
            setAvatarState({
                isVisible: true,
                emotion: 'thinking',
                message: "A pesar de que no estuviste en la clase, ¡puedes completar este Hito para demostrar tu compromiso y recuperar tu asistencia!"
            });
        }
    }, [hasAttended, !!haData]);

    if (loading) return <div className="p-8 text-center text-slate-500">Cargando Hito de Aprendizaje...</div>;

    if (!haData) return (
        <div className="flex flex-col items-center justify-center p-12 text-slate-400">
            <Trophy className="w-16 h-16 mb-4 opacity-20" />
            <p>No hay un Hito de Aprendizaje definido para este nivel.</p>
        </div>
    );

    // Parse JSON fields
    let pasosGuiados = [];
    try { pasosGuiados = JSON.parse(haData.pasosGuiados || "[]"); } catch { }

    let evidenciaTipos = [];
    try { evidenciaTipos = JSON.parse(haData.evidenciaTipos || "[]"); } catch { }

    let seccionesDinamicas: any[] = [];
    try {
        seccionesDinamicas = typeof haData.seccionesDinamicas === 'string'
            ? JSON.parse(haData.seccionesDinamicas || "[]")
            : (haData.seccionesDinamicas || []);
    } catch (e) {
        console.error("Error parsing seccionesDinamicas", e);
    }



    return (
        <div className="w-full h-full max-w-5xl mx-auto flex flex-col relative px-4 overflow-hidden">
            {/* Global Phase Navigator */}
            <AnimatePresence>
                {currentSection !== 'intro' && currentSection !== 'completion' && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="w-full bg-white border-b border-slate-100 py-4 shrink-0 z-50 mb-4"
                    >
                        <div className="flex items-center justify-between max-w-3xl mx-auto">
                            {[
                                { label: 'Preparación', sections: ['context'], icon: Target },
                                { label: 'Acción', sections: ['evidence'], icon: Play },
                                { label: 'Reflexión', sections: ['reflection'], icon: MessageSquare },
                                { label: 'Finalización', sections: ['completion'], icon: CheckCircle2 }
                            ].map((phase, idx, arr) => {
                                const isActive = phase.sections.includes(currentSection);
                                const isPast = arr.slice(0, idx).some(p => p.sections.includes(currentSection)) ||
                                    (!isActive && arr.slice(idx + 1).some(p => p.sections.includes(currentSection)));
                                const PhaseIcon = phase.icon;

                                return (
                                    <div key={idx} className="flex items-center flex-1 last:flex-none">
                                        <div className="flex flex-col items-center gap-1.5 relative group">
                                            <div className={cn(
                                                "w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-500 border-2",
                                                isActive ? "bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-200 scale-110" :
                                                    isPast ? "bg-green-500 border-green-500 text-white" : "bg-white border-slate-200 text-slate-400"
                                            )}>
                                                {isPast ? <CheckCircle2 className="w-4 h-4" /> : <PhaseIcon className="w-4 h-4" />}
                                            </div>
                                            <span className={cn(
                                                "text-[9px] font-black uppercase tracking-widest transition-colors duration-500",
                                                isActive ? "text-purple-600" : isPast ? "text-green-600" : "text-slate-400"
                                            )}>
                                                {phase.label}
                                            </span>
                                        </div>
                                        {idx < arr.length - 1 && (
                                            <div className="flex-1 mx-2 h-0.5 bg-slate-100 relative">
                                                <motion.div
                                                    className="absolute inset-0 bg-green-500 origin-left"
                                                    initial={{ scaleX: 0 }}
                                                    animate={{ scaleX: isPast || isActive ? 1 : 0 }}
                                                    transition={{ duration: 0.5 }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <ScrollArea ref={scrollAreaRef} className="flex-1 w-full h-full">
                <div className="pb-8 py-2">


                    {/* Avatar Guide Fixed Position - Removed duplicate from top, kept bottom one but ensuring only one renders */}


                    <div className="flex-1 min-h-0 relative">
                        <AnimatePresence mode="wait">
                            {/* INTRO SECTION */}
                            {currentSection === 'intro' && (
                                <motion.div
                                    key="intro"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div className="bg-gradient-to-r from-cyan-600 to-blue-700 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10" />
                                        <div className="relative z-10 text-center space-y-4">
                                            <div className="inline-flex items-center justify-center p-4 bg-white/10 rounded-full mb-2 backdrop-blur-sm">
                                                <Trophy className="w-16 h-16 text-yellow-300 drop-shadow-md" />
                                            </div>
                                            <div>
                                                <Badge variant="outline" className="mb-3 border-white/40 text-white bg-white/10 text-sm px-4 py-1 uppercase font-black tracking-widest">
                                                    🚀 El Hito: Tu Consolidación Final
                                                </Badge>
                                                <h1 className="text-4xl font-black mb-4 tracking-tight">
                                                    {haData.fase || "Fase de Aprendizaje"}
                                                </h1>
                                                <div className="bg-white/10 rounded-xl p-4 max-w-2xl mx-auto border border-white/10">
                                                    <p className="text-sm font-bold text-cyan-200 uppercase tracking-wider mb-1">Metas de Aprendizaje</p>
                                                    <p className="text-lg text-white leading-relaxed">
                                                        "{haData.objetivoSemana}"
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-center">
                                        <Button
                                            onClick={handleNextSection}
                                            size="lg"
                                            className="bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg"
                                        >
                                            Comenzar <ArrowRight className="w-5 h-5 ml-2" />
                                        </Button>
                                    </div>

                                </motion.div>
                            )}

                            {/* CONTEXT SECTION */}
                            {currentSection === 'context' && (
                                <motion.div
                                    key="context"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div className="text-center mb-2">
                                        <h2 className="text-3xl font-black text-slate-800">🎯 Fase 1: Fundamentos</h2>
                                        <p className="text-slate-500">Asegúrate de dominar estos pilares antes de demostrar tu talento.</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Concepto Clave */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1 }}
                                        >
                                            <Card className="border-none shadow-xl bg-gradient-to-br from-amber-50 to-orange-50 hover:shadow-2xl transition-all group h-full overflow-hidden">
                                                <CardHeader className="p-6 pb-2 relative z-10">
                                                    <CardTitle className="text-amber-700 flex items-center gap-3 text-xl">
                                                        <div className="p-3 bg-white/80 rounded-xl shadow-sm group-hover:scale-110 transition-transform text-amber-500">
                                                            <Lightbulb className="w-6 h-6" />
                                                        </div>
                                                        Concepto Clave
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="p-6 pt-4 relative z-10 space-y-4">
                                                    <p className="text-slate-700 text-lg leading-relaxed whitespace-pre-line font-medium">
                                                        {haData.conceptoClave || "Sin concepto definido."}
                                                    </p>
                                                    {haData.conceptoClaveImagen && (
                                                        <div className="relative rounded-xl overflow-hidden border border-amber-100 bg-white/50 flex justify-center items-center max-h-[250px]">
                                                            <img
                                                                src={haData.conceptoClaveImagen}
                                                                alt="Concepto Clave"
                                                                className="max-w-full max-h-[250px] object-contain"
                                                            />
                                                        </div>
                                                    )}
                                                </CardContent>
                                                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-amber-200/20 rounded-full blur-3xl pointer-events-none" />
                                            </Card>
                                        </motion.div>

                                        {/* Resultado Esperado */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 }}
                                        >
                                            <Card className="border-none shadow-xl bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-2xl transition-all group h-full overflow-hidden">
                                                <CardHeader className="p-6 pb-2 relative z-10">
                                                    <CardTitle className="text-emerald-700 flex items-center gap-3 text-xl">
                                                        <div className="p-3 bg-white/80 rounded-xl shadow-sm group-hover:scale-110 transition-transform text-emerald-500">
                                                            <Target className="w-6 h-6" />
                                                        </div>
                                                        Competencias que vas a adquirir
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="p-6 pt-4 relative z-10">
                                                    <p className="text-slate-700 text-lg leading-relaxed whitespace-pre-line font-medium">
                                                        {haData.resultadoEsperado || "Sin resultado definido."}
                                                    </p>
                                                </CardContent>
                                                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-200/20 rounded-full blur-3xl pointer-events-none" />
                                            </Card>
                                        </motion.div>
                                    </div>

                                    {/* Pasos Guiados dynamic */}
                                    {pasosGuiados.length > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.3 }}
                                        >
                                            <Card className="border-none shadow-lg overflow-hidden bg-white ring-1 ring-slate-100">
                                                <div className="bg-slate-50/80 p-5 px-6 border-b border-slate-100 flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                                            <ListTodo className="w-6 h-6" />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-black text-slate-800 text-lg">🛠 Tu Camino Resolutivo</h3>
                                                            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Pasos Críticos</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <CardContent className="p-6 bg-slate-50/30">
                                                    <div className="grid grid-cols-1 gap-3">
                                                        {pasosGuiados.map((item: any, i: number) => {
                                                            const isExpanded = expandedStepIndex === i;
                                                            return (
                                                                <motion.div
                                                                    key={i}
                                                                    initial={{ opacity: 0, x: -10 }}
                                                                    animate={{ opacity: 1, x: 0 }}
                                                                    transition={{ delay: 0.4 + (i * 0.1) }}
                                                                    className={cn(
                                                                        "overflow-hidden rounded-2xl bg-white shadow-sm border transition-all duration-300",
                                                                        isExpanded ? "ring-2 ring-blue-500/20 border-blue-200 shadow-md" : "border-slate-100 hover:border-blue-200"
                                                                    )}
                                                                >
                                                                    {/* Step Header (Clickable) */}
                                                                    <button
                                                                        onClick={() => setExpandedStepIndex(isExpanded ? null : i)}
                                                                        className="w-full flex items-center gap-4 p-5 text-left transition-colors"
                                                                    >
                                                                        <div className={cn(
                                                                            "w-10 h-10 rounded-full flex items-center justify-center text-sm font-black shrink-0 transition-all duration-300 shadow-lg",
                                                                            isExpanded ? "bg-blue-600 text-white shadow-blue-200 scale-110" : "bg-slate-100 text-slate-500 shadow-transparent"
                                                                        )}>
                                                                            {i + 1}
                                                                        </div>
                                                                        <p className={cn(
                                                                            "text-lg font-black tracking-tight flex-1 transition-colors",
                                                                            isExpanded ? "text-blue-600" : "text-slate-700"
                                                                        )}>
                                                                            {item.paso}
                                                                        </p>
                                                                        <motion.div
                                                                            animate={{ rotate: isExpanded ? 90 : 0 }}
                                                                            className="text-slate-300"
                                                                        >
                                                                            <ArrowRight className="w-5 h-5" />
                                                                        </motion.div>
                                                                    </button>

                                                                    {/* Step Body (Expanded Content) */}
                                                                    <AnimatePresence>
                                                                        {isExpanded && (
                                                                            <motion.div
                                                                                initial={{ height: 0, opacity: 0 }}
                                                                                animate={{ height: "auto", opacity: 1 }}
                                                                                exit={{ height: 0, opacity: 0 }}
                                                                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                                                            >
                                                                                <div className="px-5 pb-6 pt-0 ml-14 space-y-4">
                                                                                    {item.descripcion && (
                                                                                        <p className="text-slate-600 leading-relaxed text-md font-medium border-l-2 border-blue-100 pl-4">
                                                                                            {item.descripcion}
                                                                                        </p>
                                                                                    )}
                                                                                    {item.imagenUrl && (
                                                                                        <motion.div
                                                                                            initial={{ opacity: 0, scale: 0.95 }}
                                                                                            animate={{ opacity: 1, scale: 1 }}
                                                                                            className="relative rounded-2xl overflow-hidden border border-slate-100 bg-slate-50/50 group flex justify-center items-center max-h-[350px]"
                                                                                        >
                                                                                            <img
                                                                                                src={item.imagenUrl}
                                                                                                alt={item.paso}
                                                                                                className="max-w-full max-h-[350px] object-contain transition-transform duration-700 hover:scale-[1.02]"
                                                                                            />
                                                                                            <div className="absolute inset-0 bg-slate-900/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                                                                        </motion.div>
                                                                                    )}
                                                                                </div>
                                                                            </motion.div>
                                                                        )}
                                                                    </AnimatePresence>
                                                                </motion.div>
                                                            );
                                                        })}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    )}

                                    {/* Navigation Footer */}
                                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-6">
                                        <Button
                                            variant="ghost"
                                            onClick={handlePrevSection}
                                            className="text-slate-500 hover:text-slate-800"
                                        >
                                            <ChevronLeft className="w-4 h-4 mr-2" /> Regresar
                                        </Button>
                                        <Button
                                            onClick={handleNextSection}
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 shadow-lg shadow-indigo-100"
                                        >
                                            Siguiente <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </div>


                                </motion.div>
                            )}

                            {/* EVIDENCE SECTION */}
                            {currentSection === 'evidence' && (
                                <motion.div
                                    key="evidence"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <Card className="border-none shadow-2xl bg-white overflow-hidden relative ring-1 ring-slate-100">
                                        <div className="absolute top-0 left-0 w-2 h-full bg-purple-600" />
                                        <CardHeader className="p-8 pb-4">
                                            <CardTitle className="flex items-center gap-4 text-purple-800 text-3xl font-black">
                                                <div className="p-3 bg-purple-100 rounded-2xl shadow-sm text-purple-600">
                                                    <FileText className="w-8 h-8" />
                                                </div>
                                                📂 Entrega de Evidencia
                                            </CardTitle>
                                            <CardDescription className="text-lg text-slate-500 pl-20">
                                                Sube los archivos solicitados para demostrar tu dominio del tema.
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="p-8 pt-4 space-y-8">
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                                <div className="space-y-6">
                                                    <div className="bg-purple-50/50 p-6 rounded-3xl border border-purple-100">
                                                        <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2 text-lg">
                                                            <CheckCircle className="w-5 h-5 text-purple-500" /> Requisitos de Entrega:
                                                        </h4>
                                                        <div className="flex flex-wrap gap-2 mb-4">
                                                            {evidenciaTipos.map((tipo: string) => (
                                                                <Badge key={tipo} className="bg-white text-purple-700 border border-purple-200 px-4 py-1.5 font-bold shadow-sm">
                                                                    {tipo}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                        <p className="text-slate-600 text-md leading-relaxed italic bg-white p-4 rounded-xl border border-purple-100/50">
                                                            "{haData.evidenciaDescripcion}"
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col h-full">
                                                    {/* Real File Input */}
                                                    <input
                                                        type="file"
                                                        ref={fileInputRef}
                                                        className="hidden"
                                                        accept="image/*,video/*,application/pdf"
                                                        onChange={handleEvidenceUpload}
                                                    />

                                                    {/* Upload Trigger Area */}
                                                    <motion.div
                                                        whileHover={{ scale: 1.01 }}
                                                        whileTap={{ scale: 0.99 }}
                                                        className={cn(
                                                            "flex-1 border-3 border-dashed rounded-[2rem] p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-4 shadow-sm relative overflow-hidden",
                                                            evidenceFiles.length > 0
                                                                ? "bg-green-50 border-green-400"
                                                                : "bg-slate-50 border-slate-300 hover:border-purple-400 hover:bg-purple-50 hover:shadow-md group"
                                                        )}
                                                        onClick={triggerFileInput}
                                                    >
                                                        {evidenceFiles.length > 0 ? (
                                                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center relative z-10">
                                                                <div className="p-4 bg-green-100 rounded-full inline-block mb-3 shadow-inner">
                                                                    <CheckCircle className="w-12 h-12 text-green-600" />
                                                                </div>
                                                                <p className="text-2xl font-black text-green-700">¡Evidencia Lista!</p>
                                                                <p className="text-sm text-green-600/80 mt-1 font-medium">Haz clic para agregar otro archivo o cambiar</p>
                                                            </motion.div>
                                                        ) : (
                                                            <div className="relative z-10">
                                                                <div className="p-6 bg-white rounded-full shadow-lg group-hover:shadow-xl transition-all mb-4 inline-block">
                                                                    <Sparkles className="w-12 h-12 text-purple-500" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-xl font-black text-slate-700 group-hover:text-purple-700 transition-colors">Cargar Archivo</p>
                                                                    <p className="text-sm text-slate-500 mt-2 font-medium">Arrastra tu archivo aquí o haz clic</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] pointer-events-none" />
                                                    </motion.div>
                                                </div>
                                            </div>

                                            {/* Show Uploaded Files List */}
                                            <AnimatePresence>
                                                {evidenceFiles.length > 0 && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="p-4 bg-slate-50 rounded-2xl border border-slate-200"
                                                    >
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                                                            <p className="text-xs font-black text-slate-500 uppercase tracking-wider">Archivos Adjuntos</p>
                                                        </div>
                                                        <div className="flex flex-wrap gap-3">
                                                            {evidenceFiles.map((item, idx) => (
                                                                <motion.div
                                                                    key={idx}
                                                                    initial={{ scale: 0.9 }}
                                                                    animate={{ scale: 1 }}
                                                                    className="flex items-center gap-3 bg-white p-3 px-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all"
                                                                >
                                                                    <div className="p-1.5 bg-green-100 rounded-lg">
                                                                        <FileText className="w-4 h-4 text-green-700" />
                                                                    </div>
                                                                    <span className="text-sm font-bold text-slate-700 truncate max-w-[200px]">
                                                                        {item.file?.name || 'Archivo'}
                                                                    </span>
                                                                    <Badge variant="secondary" className="text-[10px] bg-slate-100 text-slate-600">
                                                                        {item.type}
                                                                    </Badge>
                                                                </motion.div>
                                                            ))}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </CardContent>

                                        {/* Bottom Navigation */}
                                        <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                                            <Button
                                                variant="outline"
                                                onClick={handlePrevSection}
                                                className="border-slate-300 hover:bg-white hover:text-slate-800 text-slate-500"
                                                size="lg"
                                            >
                                                <ChevronLeft className="w-5 h-5 mr-2" /> Regresar
                                            </Button>

                                            <div className="flex items-center gap-4">
                                                {!evidenceFiles.length && (
                                                    <motion.p
                                                        animate={{ x: [0, 5, -5, 0] }}
                                                        transition={{ repeat: Infinity, duration: 2 }}
                                                        className="text-xs font-bold text-amber-600"
                                                    >
                                                        ⚠ Sube tu evidencia para continuar
                                                    </motion.p>
                                                )}
                                                <Button
                                                    onClick={handleNextSection}
                                                    disabled={evidenceFiles.length === 0}
                                                    className={cn(
                                                        "px-10 h-12 rounded-2xl font-black transition-all shadow-lg",
                                                        evidenceFiles.length > 0
                                                            ? "bg-purple-600 hover:bg-purple-700 text-white shadow-purple-200"
                                                            : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                                                    )}
                                                >
                                                    Reflexionar <ArrowRight className="w-5 h-5 ml-2" />
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>


                                </motion.div>
                            )}

                            {/* REFLECTION SECTION */}
                            {currentSection === 'reflection' && (
                                <motion.div
                                    key="reflection"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <Card className="bg-indigo-50/50 border-none shadow-2xl overflow-hidden relative">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-600" />
                                        <CardContent className="p-10">
                                            <div className="flex gap-8 items-start">
                                                <div className="p-5 bg-indigo-100 rounded-3xl shrink-0 shadow-sm animate-pulse">
                                                    <MessageSquare className="w-12 h-12 text-indigo-600" />
                                                </div>
                                                <div className="space-y-6 flex-1">
                                                    <div>
                                                        <Badge className="bg-indigo-600 text-white mb-4 px-4 py-1 rounded-full text-xs font-black uppercase tracking-tighter shadow-md">Consolidación de Aprendizaje</Badge>
                                                        <h4 className="font-black text-slate-800 text-3xl leading-tight">
                                                            {haData.preguntaReflexion}
                                                        </h4>
                                                    </div>

                                                    <div className="relative group">
                                                        <textarea
                                                            value={reflection}
                                                            onChange={(e) => setReflection(e.target.value)}
                                                            className="w-full p-8 rounded-[2rem] border-2 border-indigo-100 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 bg-white transition-all min-h-[220px] text-lg text-slate-700 placeholder:text-slate-300 shadow-inner"
                                                            placeholder="Comparte lo que has descubierto hoy..."
                                                        />
                                                        <motion.div
                                                            className="absolute bottom-6 right-8 pointer-events-none"
                                                            animate={{ opacity: reflection.length >= 10 ? 1 : 0.3 }}
                                                        >
                                                            <span className={cn("text-sm font-black", reflection.length >= 10 ? "text-green-500" : "text-slate-300")}>
                                                                {reflection.length}/10 caracteres
                                                            </span>
                                                        </motion.div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between mt-10 pt-8 border-t border-indigo-100/50">
                                                <Button
                                                    variant="ghost"
                                                    onClick={handlePrevSection}
                                                    className="text-slate-500 hover:text-indigo-600 hover:bg-white rounded-2xl"
                                                >
                                                    <ChevronLeft className="w-4 h-4 mr-2" /> Corregir Evidencia
                                                </Button>
                                                <Button
                                                    onClick={handleNextSection}
                                                    disabled={reflection.length < 10}
                                                    className={cn(
                                                        "px-12 h-14 rounded-3xl font-black text-xl transition-all shadow-xl",
                                                        reflection.length >= 10
                                                            ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 scale-105 active:scale-95"
                                                            : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                                                    )}
                                                >
                                                    Finalizar Desafío <ArrowRight className="w-6 h-6 ml-3" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>


                                </motion.div>
                            )}

                            {/* COMPLETION SECTION */}
                            {currentSection === 'completion' && (
                                <motion.div
                                    key="completion"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="space-y-4 py-4 h-full flex flex-col items-center justify-center max-w-2xl mx-auto"
                                >
                                    <Card className="border-4 border-cyan-400 bg-gradient-to-br from-cyan-50 to-blue-50 shadow-2xl w-full">
                                        <CardContent className="p-8 text-center">
                                            <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4 animate-bounce" />
                                            <h2 className="text-3xl font-black text-slate-800 mb-2">
                                                ¡Hito Completado!
                                            </h2>
                                            <p className="text-lg text-slate-600 mb-4">
                                                Has demostrado tu dominio en: <strong>{haData.fase}</strong>
                                            </p>
                                            <div className="flex gap-4 justify-center">
                                                <Badge className="bg-green-500 text-white text-md px-3 py-1">
                                                    +300 Puntos
                                                </Badge>
                                                <Badge className="bg-cyan-500 text-white text-md px-3 py-1">
                                                    Evidencia Aprobada
                                                </Badge>
                                            </div>
                                        </CardContent>
                                        <div className="p-4 bg-slate-50 border-t flex justify-center gap-4">
                                            <Button onClick={() => window.location.href = '/missions'} variant="outline" size="sm">
                                                Ver Misiones
                                            </Button>
                                            <Button onClick={() => window.location.href = '/dashboard'} className="bg-cyan-600 text-white" size="sm">
                                                Volver al Inicio
                                            </Button>
                                        </div>
                                    </Card>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>


                    {createPortal(
                        <div className={cn("fixed bottom-4 right-2 z-[9999] pointer-events-none transition-opacity duration-500", !avatarState.isVisible && "opacity-0")}>
                            <div className="pointer-events-auto">
                                <AvatarGuide
                                    emotion={avatarState.emotion}
                                    message={avatarState.message}
                                />
                            </div>
                        </div>,
                        document.body
                    )}

                </div>
            </ScrollArea>
        </div>
    );
});

export default HaViewer;
