
import { useEffect, useState, useRef, forwardRef, useImperativeHandle } from "react";
import { studentApi } from "@/features/student/services/student.api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, Target, Lightbulb, Trophy, FileText, MessageSquare, ListTodo, Circle, ArrowRight, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import AvatarGuide from "./AvatarGuide";
import { AvatarState } from "@/types/gamification";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface HaViewerProps {
    levelId: number;
    onAddPoints?: (amount: number, reason: string) => void;
}

type HaSection = 'intro' | 'context' | 'evidence' | 'reflection' | 'completion';

export const HaViewer = forwardRef(({ levelId, onAddPoints }: HaViewerProps, ref) => {
    const [haData, setHaData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [currentSection, setCurrentSection] = useState<HaSection>('intro');
    const [evidenceFiles, setEvidenceFiles] = useState<{ type: string, file: File | null, url?: string }[]>([]);
    const [reflection, setReflection] = useState("");

    const getStudentId = () => {
        const userStr = localStorage.getItem('edu_user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                return user.id || user.user?.id || 1;
            } catch {
                return 1;
            }
        }
        return 1;
    };

    const [avatarState, setAvatarState] = useState<AvatarState>({
        isVisible: true,
        emotion: 'thinking',
        message: "¡Bienvenido al Hito de Aprendizaje! Aquí demostrarás todo lo que has aprendido."
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
            try {
                const data = await studentApi.getHaTemplate(levelId);

                // Validate if data exists and has ID (to avoid 400 on submissions fetch)
                if (data && data.id) {
                    setHaData(data);

                    // Restore progress
                    const studentId = parseInt(getStudentId());
                    if (studentId) {
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
                        } else {
                            // If no SUBMISSION but maybe files uploaded previously?
                            // Currently API doesn't separate files from submission, but if we did:
                            // setEvidenceFiles(...)
                        }
                    }
                } else {
                    // console.log("No HA template found or invalid data");
                    setHaData(null);
                }
            } catch (err) {
                console.error(err);
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
                        emotion: 'neutral',
                        message: "Revisemos el contexto: el concepto clave y lo que debes lograr.",
                        isVisible: true
                    });
                    break;
                case 'evidence':
                    setAvatarState({
                        emotion: 'happy',
                        message: "Ahora es momento de subir tu evidencia. ¡Muestra lo que has creado!",
                        isVisible: true
                    });
                    break;
                case 'reflection':
                    setAvatarState({
                        emotion: 'thinking',
                        message: "Por último, reflexiona sobre tu aprendizaje. ¿Qué aprendiste?",
                        isVisible: true
                    });
                    break;
                case 'completion':
                    // Points are now handled by the backend on completion
                    setAvatarState({
                        emotion: 'celebrating',
                        message: "¡Felicitaciones! Has completado el Hito de Aprendizaje.",
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
            <ScrollArea className="flex-1 w-full h-full">
                <div className="pb-8 py-4">

                    {/* Section Progress Indicator */}
                    <div className="flex items-center justify-center gap-1 mb-4">
                        {['intro', 'context', 'evidence', 'reflection', 'completion'].map((section, idx) => (
                            <div key={section} className="flex items-center">
                                <motion.div
                                    initial={false}
                                    animate={{
                                        scale: currentSection === section ? 1.2 : 1,
                                        backgroundColor: currentSection === section
                                            ? "#9333ea"
                                            : ['intro', 'context', 'evidence', 'reflection', 'completion'].indexOf(currentSection) > idx
                                                ? "#22c55e"
                                                : "#e2e8f0"
                                    }}
                                    className={cn(
                                        "w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all text-white",
                                        currentSection === section ? "shadow-lg shadow-purple-200" : ""
                                    )}
                                >
                                    {idx + 1}
                                </motion.div>
                                {idx < 4 && (
                                    <div className="w-6 h-0.5 bg-slate-100 mx-0.5">
                                        <motion.div
                                            initial={{ width: "0%" }}
                                            animate={{ width: ['intro', 'context', 'evidence', 'reflection', 'completion'].indexOf(currentSection) > idx ? "100%" : "0%" }}
                                            className="h-full bg-green-500"
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

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
                                    <div className="bg-gradient-to-r from-cyan-600 to-blue-700 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-8 -mt-8" />
                                        <div className="relative z-10 text-center">
                                            <Trophy className="w-12 h-12 mx-auto mb-2 text-yellow-300" />
                                            <Badge variant="outline" className="mb-2 border-white/50 text-white bg-white/20 text-[10px]">
                                                Hito de Aprendizaje
                                            </Badge>
                                            <h1 className="text-2xl font-black mb-2">
                                                {haData.fase || "Fase de Aprendizaje"}
                                            </h1>
                                            <p className="text-md text-cyan-100 max-w-2xl mx-auto line-clamp-2">
                                                {haData.objetivoSemana}
                                            </p>
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
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Concepto Clave */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1 }}
                                        >
                                            <Card className="border-none shadow-xl bg-gradient-to-br from-amber-50 to-orange-50 hover:shadow-2xl transition-shadow group h-full">
                                                <CardHeader className="p-6 pb-2">
                                                    <CardTitle className="text-amber-600 flex items-center gap-2 text-lg">
                                                        <div className="p-2 bg-amber-100 rounded-lg group-hover:scale-110 transition-transform">
                                                            <Lightbulb className="w-5 h-5" />
                                                        </div>
                                                        Concepto Clave
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="p-6 pt-2 space-y-3">
                                                    <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
                                                        {haData.conceptoClave || "Sin concepto definido."}
                                                    </p>
                                                </CardContent>
                                            </Card>
                                        </motion.div>

                                        {/* Resultado Esperado */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 }}
                                        >
                                            <Card className="border-none shadow-xl bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-2xl transition-shadow group h-full">
                                                <CardHeader className="p-6 pb-2">
                                                    <CardTitle className="text-green-600 flex items-center gap-2 text-lg">
                                                        <div className="p-2 bg-green-100 rounded-lg group-hover:scale-110 transition-transform">
                                                            <Target className="w-5 h-5" />
                                                        </div>
                                                        Resultado Esperado
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="p-6 pt-2">
                                                    <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
                                                        {haData.resultadoEsperado || "Sin resultado definido."}
                                                    </p>
                                                </CardContent>
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
                                            <Card className="border-none shadow-lg overflow-hidden bg-white">
                                                <div className="bg-slate-50 p-4 px-6 border-b border-slate-100 flex items-center gap-3">
                                                    <div className="p-2 bg-blue-100 rounded-lg">
                                                        <ListTodo className="w-5 h-5 text-blue-600" />
                                                    </div>
                                                    <h3 className="font-black text-slate-800">Pasos de Exploración</h3>
                                                </div>
                                                <CardContent className="p-6">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {pasosGuiados.map((item: any, i: number) => (
                                                            <motion.div
                                                                key={i}
                                                                initial={{ opacity: 0, x: -10 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{ delay: 0.4 + (i * 0.1) }}
                                                                className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200"
                                                            >
                                                                <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                                                                    {i + 1}
                                                                </div>
                                                                <p className="text-slate-700 text-sm font-medium">{item.paso}</p>
                                                            </motion.div>
                                                        ))}
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
                                    <Card className="border-none shadow-2xl bg-white overflow-hidden relative">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-purple-600" />
                                        <CardHeader className="p-8 pb-4">
                                            <CardTitle className="flex items-center gap-3 text-purple-700 text-2xl font-black">
                                                <div className="p-3 bg-purple-100 rounded-2xl">
                                                    <FileText className="w-8 h-8" />
                                                </div>
                                                Evidencia de Aprendizaje
                                            </CardTitle>
                                            <CardDescription className="text-lg text-slate-500">Documenta tus resultados para completar el hito</CardDescription>
                                        </CardHeader>
                                        <CardContent className="p-8 pt-4 space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="space-y-4">
                                                    <div>
                                                        <h4 className="font-bold text-slate-700 mb-2 flex items-center gap-2">
                                                            <CheckCircle className="w-4 h-4 text-green-500" /> Qué debes subir:
                                                        </h4>
                                                        <div className="flex flex-wrap gap-2">
                                                            {evidenciaTipos.map((tipo: string) => (
                                                                <Badge key={tipo} className="bg-purple-50 text-purple-700 border border-purple-100 px-3 py-1 font-bold">
                                                                    {tipo}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                                        <p className="text-slate-600 text-sm leading-relaxed italic">
                                                            "{haData.evidenciaDescripcion}"
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
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
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        className={cn(
                                                            "border-3 border-dashed rounded-3xl p-10 text-center transition-all cursor-pointer h-full flex flex-col items-center justify-center gap-4",
                                                            evidenceFiles.length > 0
                                                                ? "bg-green-50 border-green-300 shadow-inner"
                                                                : "bg-slate-50 border-slate-200 hover:border-purple-400 hover:bg-purple-50 group"
                                                        )}
                                                        onClick={triggerFileInput}
                                                    >
                                                        {evidenceFiles.length > 0 ? (
                                                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center">
                                                                <div className="p-4 bg-green-100 rounded-full inline-block mb-3">
                                                                    <CheckCircle className="w-10 h-10 text-green-600" />
                                                                </div>
                                                                <p className="text-xl font-black text-green-700">Evidencia Lista</p>
                                                                <p className="text-sm text-green-600/80 mt-1">Haz clic para cambiar el archivo</p>
                                                            </motion.div>
                                                        ) : (
                                                            <>
                                                                <div className="p-5 bg-white rounded-3xl shadow-sm group-hover:shadow-md transition-shadow">
                                                                    <Sparkles className="w-10 h-10 text-purple-500" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-lg font-bold text-slate-800">Cargar Archivo</p>
                                                                    <p className="text-xs text-slate-500 mt-1">Arrastra o haz clic aquí</p>
                                                                </div>
                                                            </>
                                                        )}
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
                                                        className="mt-4 p-4 bg-green-500/5 rounded-2xl border border-green-500/20"
                                                    >
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                                            <p className="text-xs font-black text-green-700 uppercase tracking-wider">Archivos Seleccionados</p>
                                                        </div>
                                                        <div className="flex flex-wrap gap-3">
                                                            {evidenceFiles.map((item, idx) => (
                                                                <motion.div
                                                                    key={idx}
                                                                    initial={{ scale: 0.9 }}
                                                                    animate={{ scale: 1 }}
                                                                    className="flex items-center gap-2 bg-white p-2 px-4 rounded-xl border border-green-100 shadow-sm"
                                                                >
                                                                    <FileText className="w-4 h-4 text-green-600" />
                                                                    <span className="text-sm font-bold text-slate-700 truncate max-w-[200px]">
                                                                        {item.file?.name || 'Archivo'}
                                                                    </span>
                                                                    <Badge variant="outline" className="text-[10px] bg-slate-50 border-slate-200">
                                                                        {item.type}
                                                                    </Badge>
                                                                </motion.div>
                                                            ))}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </CardContent>

                                        {/* Bottom Navigation with Conditional State */}
                                        <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                                            <Button
                                                variant="ghost"
                                                onClick={handlePrevSection}
                                                className="text-slate-500 hover:text-slate-800"
                                            >
                                                <ChevronLeft className="w-4 h-4 mr-2" /> Regresar
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
                                                        <Badge className="bg-indigo-600 text-white mb-4 px-4 py-1 rounded-full text-xs font-black uppercase tracking-tighter shadow-md">Reflexión Final</Badge>
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


                    <div className={cn("fixed bottom-4 right-4 z-50 pointer-events-none transition-opacity duration-500", !avatarState.isVisible && "opacity-0")}>
                        <div className="pointer-events-auto">
                            <AvatarGuide
                                emotion={avatarState.emotion}
                                message={avatarState.message}
                            />
                        </div>
                    </div>

                </div>
            </ScrollArea>
        </div>
    );
});

export default HaViewer;
