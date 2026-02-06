
import { useEffect, useState, useRef } from "react";
import { studentApi } from "@/features/student/services/student.api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, Target, Lightbulb, Trophy, FileText, MessageSquare, ListTodo, Circle, ArrowRight, Sparkles } from "lucide-react";
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

export default function HaViewer({ levelId, onAddPoints }: HaViewerProps) {
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
        <div className="w-full space-y-8 pb-10">

            {/* Section Progress Indicator */}
            <div className="flex items-center justify-center gap-1 mb-2">
                {['intro', 'context', 'evidence', 'reflection', 'completion'].map((section, idx) => (
                    <div key={section} className="flex items-center">
                        <div className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all",
                            currentSection === section
                                ? "bg-purple-600 text-white scale-110"
                                : ['intro', 'context', 'evidence', 'reflection', 'completion'].indexOf(currentSection) > idx
                                    ? "bg-green-500 text-white"
                                    : "bg-slate-200 text-slate-400"
                        )}>
                            {idx + 1}
                        </div>
                        {idx < 4 && <div className="w-4 h-0.5 bg-slate-200 mx-0.5" />}
                    </div>
                ))}
            </div>

            {/* Avatar Guide Fixed Position */}
            <div className="fixed bottom-6 right-6 z-50 max-w-sm">
                <AvatarGuide
                    emotion={avatarState.emotion}
                    message={avatarState.message}
                    responseOptions={avatarState.responseOptions}
                    className="max-w-md transition-opacity duration-300"
                />
            </div>

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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Concepto Clave */}
                                <Card className="border-none shadow-md bg-gradient-to-br from-amber-50 to-orange-50">
                                    <CardHeader className="p-4 pb-1">
                                        <CardTitle className="text-amber-600 flex items-center gap-2 text-sm">
                                            <Lightbulb className="w-4 h-4" /> Concepto Clave
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-1 space-y-2">
                                        <p className="text-slate-700 text-sm leading-snug whitespace-pre-line line-clamp-4">
                                            {haData.conceptoClave || "Sin concepto definido."}
                                        </p>
                                    </CardContent>
                                </Card>

                                {/* Resultado Esperado */}
                                <Card className="border-none shadow-md bg-gradient-to-br from-green-50 to-emerald-50">
                                    <CardHeader className="p-4 pb-1">
                                        <CardTitle className="text-green-600 flex items-center gap-2 text-sm">
                                            <Target className="w-4 h-4" /> Resultado Esperado
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-1">
                                        <p className="text-slate-700 text-sm leading-snug whitespace-pre-line line-clamp-4">
                                            {haData.resultadoEsperado || "Sin resultado definido."}
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Pasos Guiados compactos */}
                            {pasosGuiados.length > 0 && (
                                <Card className="border-none shadow-sm overflow-hidden">
                                    <div className="bg-blue-50/50 p-2 px-4 border-b border-blue-100 flex items-center gap-2">
                                        <ListTodo className="w-4 h-4 text-blue-600" />
                                        <h3 className="font-bold text-blue-800 text-xs text-center">Pasos</h3>
                                    </div>
                                    <CardContent className="p-2 max-h-[120px] overflow-y-auto">
                                        <div className="space-y-1">
                                            {pasosGuiados.map((item: any, i: number) => (
                                                <div key={i} className="flex items-center gap-2 text-xs">
                                                    <Circle className="w-2 h-2 text-slate-300 shrink-0" />
                                                    <p className="text-slate-700 truncate">{item.paso}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            <div className="flex justify-center gap-4">
                                <Button
                                    variant="outline"
                                    onClick={handlePrevSection}
                                    size="sm"
                                >
                                    Regresar
                                </Button>
                                <Button
                                    onClick={handleNextSection}
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                    Subir Evidencia <ArrowRight className="w-4 h-4 ml-1" />
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
                            <Card className="border-none shadow-lg bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-dashed border-purple-200">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-purple-700">
                                        <FileText className="w-6 h-6" /> Evidencia Requerida
                                    </CardTitle>
                                    <CardDescription className="text-base">Sube tu evidencia para completar este hito</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {evidenciaTipos.map((tipo: string) => (
                                            <Badge key={tipo} className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-none">
                                                {tipo}
                                            </Badge>
                                        ))}
                                    </div>
                                    <p className="text-slate-600 mb-4">{haData.evidenciaDescripcion}</p>

                                    {/* Real File Input */}
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*,video/*,application/pdf"
                                        onChange={handleEvidenceUpload}
                                    />

                                    {/* Upload Trigger Area */}
                                    <div
                                        className={cn(
                                            "border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer",
                                            evidenceFiles.length > 0
                                                ? "bg-green-50 border-green-300"
                                                : "bg-white border-purple-300 hover:bg-purple-50"
                                        )}
                                        onClick={triggerFileInput}
                                    >
                                        {evidenceFiles.length > 0 ? (
                                            <>
                                                <CheckCircle className="w-12 h-12 mx-auto text-green-600 mb-2" />
                                                <p className="text-lg font-bold text-green-700">✓ Evidencia Subida</p>
                                            </>
                                        ) : (
                                            <>
                                                <FileText className="w-12 h-12 mx-auto text-purple-400 mb-2" />
                                                <p className="text-sm font-medium text-slate-600">Click para subir evidencia</p>
                                                <p className="text-xs text-slate-400 mt-1">Soporta: {evidenciaTipos.join(", ")}</p>
                                            </>
                                        )}
                                    </div>

                                    {/* Show Uploaded Files */}
                                    {evidenceFiles.length > 0 && (
                                        <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                                            <p className="text-sm font-bold text-green-700 mb-2">✓ Archivos subidos:</p>
                                            <ul className="space-y-1">
                                                {evidenceFiles.map((item, idx) => (
                                                    <li key={idx} className="text-sm text-green-600 flex items-center gap-2">
                                                        <CheckCircle className="w-4 h-4" />
                                                        <span>{item.file?.name || 'Archivo'} ({item.type})</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Dynamic Sections if any */}
                            {seccionesDinamicas.length > 0 && (
                                <div className="space-y-4">
                                    {seccionesDinamicas.map((sec: any, idx: number) => (
                                        <Card key={idx} className="border-none shadow-md bg-white">
                                            <CardHeader className="p-4 pb-2">
                                                <CardTitle className="text-indigo-600 text-sm font-bold flex items-center gap-2">
                                                    <Sparkles className="w-4 h-4" /> {sec.titulo || "Información Adicional"}
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-4 pt-0">
                                                <p className="text-slate-600 text-sm leading-relaxed">
                                                    {sec.contenido}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}

                            {/* Section Navigation */}
                            <div className="flex justify-center gap-4">
                                <Button
                                    variant="outline"
                                    onClick={handlePrevSection}
                                    size="sm"
                                >
                                    Regresar
                                </Button>
                                <Button
                                    onClick={handleNextSection}
                                    disabled={evidenceFiles.length === 0}
                                    size="sm"
                                    className="bg-purple-600 hover:bg-purple-700 text-white"
                                >
                                    {evidenceFiles.length === 0 ? "Sube evidencia para continuar" : "Reflexionar"} <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
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
                            <Card className="bg-indigo-50 border-none shadow-lg">
                                <CardContent className="p-8 flex gap-4">
                                    <MessageSquare className="w-10 h-10 text-indigo-400 flex-shrink-0" />
                                    <div className="space-y-4 flex-1">
                                        <h4 className="font-bold text-indigo-900 text-xl">Pregunta de Reflexión</h4>
                                        <p className="text-indigo-800 text-lg font-medium italic">
                                            "{haData.preguntaReflexion}"
                                        </p>
                                        <textarea
                                            value={reflection}
                                            onChange={(e) => setReflection(e.target.value)}
                                            className="w-full mt-4 p-4 rounded-lg border-2 border-indigo-200 focus:border-indigo-400 focus:ring-indigo-400 min-h-[150px]"
                                            placeholder="Escribe tu reflexión aquí..."
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="flex justify-center">
                                <Button
                                    onClick={handleNextSection}
                                    disabled={reflection.length < 10}
                                    size="lg"
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg disabled:opacity-50"
                                >
                                    Finalizar <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                            </div>
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

            <div className={cn("fixed bottom-6 right-6 z-50 pointer-events-none transition-opacity duration-500", !avatarState.isVisible && "opacity-0")}>
                <div className="pointer-events-auto">
                    <AvatarGuide
                        emotion={avatarState.emotion}
                        message={avatarState.message}
                    />
                </div>
            </div>
        </div>
    );
}
