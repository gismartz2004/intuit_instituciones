import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { studentApi } from "@/features/student/services/student.api";
import {
  CheckCircle2,
  Target,
  Lightbulb,
  Trophy,
  BookOpen,
  Clock,
  Calendar,
  Award,
  FileText,
  ArrowRight,
  Sparkles,
  Zap,
  Brain,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import AvatarGuide from "./AvatarGuide";
import { AvatarState } from "@/types/gamification";
import { motion, AnimatePresence } from "framer-motion";

interface RagViewerProps {
  levelId: number;
  onAddPoints?: (amount: number, reason: string) => void;
}

type RagSection = 'intro' | 'objectives' | 'concepts' | 'evidence' | 'mission' | 'completion';

export default function RagViewer({ levelId, onAddPoints }: RagViewerProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [currentSection, setCurrentSection] = useState<RagSection>('intro');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepDeliverable, setStepDeliverable] = useState<File | null>(null);
  const [missionEvidence, setMissionEvidence] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const evidenceInputRef = useRef<HTMLInputElement>(null);

  const [avatarState, setAvatarState] = useState<AvatarState>({
    isVisible: true,
    emotion: 'neutral',
    message: "¡Hola! Bienvenido a tu Guía RAG. Vamos a recorrer esto juntos paso a paso."
  });

  // Proactive hints on idle
  useEffect(() => {
    if (currentSection === 'intro') return;

    const idleTimer = setTimeout(() => {
      if (currentSection === 'mission' && completedSteps.length === 0) {
        setAvatarState({
          emotion: 'thinking',
          message: "¿Necesitas ayuda? Haz clic en cada paso para marcarlo como completado.",
          isVisible: true
        });
      } else if (currentSection === 'objectives' || currentSection === 'concepts') {
        setAvatarState({
          emotion: 'waiting',
          message: "Tómate tu tiempo para leer. Cuando estés listo, haz clic en 'Continuar'.",
          isVisible: true
        });
      }
    }, 15000); // Show hint after 15 seconds of inactivity

    return () => clearTimeout(idleTimer);
  }, [currentSection, completedSteps]);

  useEffect(() => {
    const fetchRag = async () => {
      try {
        const result = await studentApi.getRagTemplate(levelId);
        if (result && result.id) {
          result.contenidoClave =
            typeof result.contenidoClave === "string"
              ? JSON.parse(result.contenidoClave)
              : result.contenidoClave;
          result.pasosGuiados =
            typeof result.pasosGuiados === "string"
              ? JSON.parse(result.pasosGuiados)
              : result.pasosGuiados;
          result.pistas =
            typeof result.pistas === "string"
              ? JSON.parse(result.pistas)
              : result.pistas;
          setData(result);

          // Restore progress
          const studentId = parseInt(getStudentId());
          if (studentId && result.id) {
            const submissions = await studentApi.getRagSubmissions(studentId, result.id);
            if (submissions && submissions.length > 0) {
              const Indices = submissions.map((s: any) => s.pasoIndice);
              setCompletedSteps(Indices);

              // Check if already fully complete
              const rawSteps = result.pasosGuiados || [];
              const isFullyDone = rawSteps.every((p: any, idx: number) =>
                !p.requiereEntregable || Indices.includes(idx)
              );

              if (isFullyDone) {
                setCurrentSection('completion');
              } else if (Indices.length > 0) {
                // If some progress, maybe jump to mission or keep at context?
                // For now, let's at least mark steps.
              }
            }
          }
        }
      } catch (e) {
        console.error("No RAG data found");
      } finally {
        setLoading(false);
      }
    };
    fetchRag();
  }, [levelId]);

  const [currentUploadUrl, setCurrentUploadUrl] = useState<string | null>(null);
  const [missionEvidenceUrl, setMissionEvidenceUrl] = useState<string | null>(null);

  // Helper to get user ID
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

  const handleStepComplete = async () => {
    const rawSteps = data?.pasosGuiados || [];
    const currentStep = rawSteps[currentStepIndex];
    const requiresDeliverable = currentStep?.requiereEntregable || false;

    if (requiresDeliverable && !stepDeliverable) {
      setAvatarState({
        emotion: 'waiting',
        message: '⚠️ Este paso requiere que subas un entregable antes de continuar.',
        isVisible: true
      });
      return;
    }

    // Submit progress to backend
    try {
      if (requiresDeliverable && currentUploadUrl) {
        await studentApi.submitRagProgress({
          studentId: getStudentId(),
          plantillaRagId: data.id,
          pasoIndice: currentStepIndex,
          archivoUrl: currentUploadUrl,
          tipoArchivo: stepDeliverable?.type || 'unknown'
        });
      }
    } catch (error) {
      console.error("Error submitting progress", error);
    }

    // Mark step as complete
    if (!completedSteps.includes(currentStepIndex)) {
      setCompletedSteps(prev => [...prev, currentStepIndex]);
    }

    // Check if there are more steps
    if (currentStepIndex < rawSteps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      setStepDeliverable(null); // Reset for next step
      setCurrentUploadUrl(null);
      setAvatarState({
        isVisible: true,
        emotion: 'neutral',
        message: `Paso ${currentStepIndex + 2}: ${rawSteps[currentStepIndex + 1]?.paso || "Sigue adelante."}`,
      });
    } else {
      // All steps completed
      setCurrentSection('completion');
      setAvatarState({
        isVisible: true,
        emotion: 'celebrating',
        message: '🎉 ¡Felicidades! Has completado todos los pasos de la misión.'
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setStepDeliverable(file);
      try {
        setAvatarState({ emotion: 'thinking', message: 'Subiendo archivo...', isVisible: true });
        const res = await studentApi.uploadEvidence(file);
        setCurrentUploadUrl(res.url);
        setAvatarState({
          emotion: 'happy',
          message: `✓ Archivo "${file.name}" subido correctamente. Ahora puedes completar este paso.`,
          isVisible: true
        });
      } catch (error: any) {
        console.error("Upload error:", error);
        setAvatarState({
          emotion: 'sad',
          message: `Error al subir el archivo: ${error.message || 'Verifica tu conexión.'}`,
          isVisible: true
        });
      }
    }
  };

  const handleMissionEvidenceUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setMissionEvidence(file);
      setIsUploading(true);
      try {
        setAvatarState({ emotion: 'thinking', message: 'Subiendo evidencia...', isVisible: true });
        const res = await studentApi.uploadEvidence(file);
        setMissionEvidenceUrl(res.url);

        // Submit to database immediately with pasoIndice -1 (Initial Evidence)
        await studentApi.submitRagProgress({
          studentId: getStudentId(),
          plantillaRagId: data.id,
          pasoIndice: -1, // Special index for initial evidence
          archivoUrl: res.url,
          tipoArchivo: file.type || 'unknown'
        });
        setAvatarState({
          emotion: 'happy',
          message: `¡Perfecto! Has subido la evidencia principal. Ahora podemos proceder a la misión.`,
          isVisible: true
        });
      } catch (error: any) {
        console.error("Evidence upload error:", error);
        setAvatarState({
          emotion: 'sad',
          message: `Error al subir la evidencia: ${error.message || 'El archivo podría ser muy pesado.'}`,
          isVisible: true
        });
        setMissionEvidence(null);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const toggleStep = (index: number) => {
    // Legacy function, keeping signature to avoid breaks but redirects to modern logic if current
    if (index === currentStepIndex) handleStepComplete();
  };

  // Check for completion
  useEffect(() => {
    if (!data) return;
    const totalSteps = (data.pasosGuiados || []).length;
    if (totalSteps > 0 && completedSteps.length === totalSteps) {
      setCurrentSection('completion');
      setAvatarState({
        isVisible: true,
        emotion: 'celebrating',
        message: "¡Misión Cumplida! Has completado todos los pasos de esta guía. ¡Eres increíble!"
      });
    }
  }, [completedSteps, data]);

  const handleNextSection = () => {
    const sections: RagSection[] = ['intro', 'objectives', 'concepts', 'evidence', 'mission', 'completion'];
    const currentIndex = sections.indexOf(currentSection);

    if (currentIndex < sections.length - 1) {
      const nextSection = sections[currentIndex + 1];
      setCurrentSection(nextSection);

      // Update avatar based on section
      switch (nextSection) {
        case 'objectives':
          setAvatarState({
            emotion: 'thinking',
            message: "Ahora veamos los objetivos de esta guía. ¿Qué vamos a lograr?",
            isVisible: true
          });
          break;
        case 'concepts':
          setAvatarState({
            emotion: 'happy',
            message: "Perfecto. Ahora revisemos los conceptos clave que necesitas dominar.",
            isVisible: true
          });
          break;
        case 'evidence':
          setAvatarState({
            emotion: 'happy',
            message: "Antes de empezar la misión, necesito que subas tu evidencia de trabajo previo.",
            isVisible: true
          });
          break;
        case 'mission':
          if (!missionEvidence || !missionEvidenceUrl) {
            setAvatarState({
              emotion: 'waiting',
              message: "⚠️ ¡Detente! Espera a que la evidencia se suba correctamente.",
              isVisible: true
            });
            setCurrentSection('evidence');
            return;
          }
          // Points are now handled by the backend on completion
          const firstStep = data?.pasosGuiados?.[0]?.paso || "Comencemos.";
          setAvatarState({
            emotion: 'neutral',
            message: `¡Misión iniciada! Primer paso: ${firstStep}`,
            isVisible: true
          });
          break;
      }
    }
  };

  if (loading)
    return (
      <div className="p-8 text-center text-slate-400">
        Cargando guía de aprendizaje...
      </div>
    );
  if (!data)
    return (
      <div className="p-8 text-center text-slate-400 italic">
        Este nivel no tiene una guía RAG asignada.
      </div>
    );

  const ragData = data;
  let guidedSteps = [];
  try {
    guidedSteps = ragData.pasosGuiados || [];
  } catch { }

  let keyConcepts = [];
  try {
    keyConcepts = ragData.contenidoClave || [];
  } catch { }

  let hints = [];
  try {
    hints = ragData.pistas || [];
  } catch { }

  const progress = Math.round(
    (completedSteps.length / (guidedSteps.length || 1)) * 100,
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-24 relative">

      {/* Avatar Guide Fixed Position */}
      <div className="fixed bottom-6 right-6 z-50 max-w-sm">
        <AvatarGuide
          emotion={avatarState.emotion}
          message={avatarState.message}
          responseOptions={avatarState.responseOptions}
          className="max-w-md"
        />
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {['intro', 'objectives', 'concepts', 'evidence', 'mission', 'completion'].map((section, idx) => (
          <div
            key={section}
            className={cn(
              "w-3 h-3 rounded-full transition-all",
              currentSection === section ? "bg-indigo-600 scale-125" :
                ['intro', 'objectives', 'concepts', 'evidence', 'mission', 'completion'].indexOf(currentSection) > idx
                  ? "bg-green-500"
                  : "bg-slate-300"
            )}
          />
        ))}
      </div>

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
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
              <div className="relative z-10 text-center">
                <Sparkles className="w-16 h-16 mx-auto mb-4 text-yellow-300" />
                <h1 className="text-4xl font-black mb-4">
                  {ragData.hitoAprendizaje}
                </h1>
                <p className="text-blue-100 text-lg max-w-2xl mx-auto mb-6">
                  {ragData.proposito}
                </p>
                <div className="flex gap-2 justify-center flex-wrap">
                  <Badge className="bg-white/20 hover:bg-white/30 text-white border-0">
                    RAG: {ragData.modalidad}
                  </Badge>
                  {ragData.tipoRag && (
                    <Badge className="bg-white/20 hover:bg-white/30 text-white border-0">
                      {ragData.tipoRag}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <Button
                onClick={handleNextSection}
                size="lg"
                className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg"
              >
                Comenzar <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* OBJECTIVES SECTION */}
        {currentSection === 'objectives' && (
          <motion.div
            key="objectives"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <Card className="border-l-4 border-l-purple-500 shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl flex items-center gap-2 text-slate-800">
                  <Target className="w-6 h-6 text-purple-600" /> Objetivo Semanal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 leading-relaxed font-medium text-lg">
                  {ragData.objetivoAprendizaje}
                </p>
              </CardContent>
            </Card>

            {(ragData.competenciasTecnicas || ragData.competenciasBlandas) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                {/* TECHNICAL SKILLS */}
                {ragData.competenciasTecnicas && (
                  <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 border-none shadow-lg overflow-hidden relative group hover:shadow-xl transition-all duration-300">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Zap className="w-24 h-24 text-cyan-600" />
                    </div>
                    <CardHeader className="pb-2 relative z-10">
                      <CardTitle className="text-lg font-black text-cyan-800 flex items-center gap-2">
                        <div className="p-2 bg-cyan-100 rounded-lg">
                          <Zap className="w-5 h-5 text-cyan-600" />
                        </div>
                        Competencias Técnicas
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10 pt-2">
                      <div className="flex flex-wrap gap-2">
                        {ragData.competenciasTecnicas.split(/\n|•/).map((skill: string, i: number) => {
                          const cleanSkill = skill.trim();
                          if (!cleanSkill) return null;
                          return (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.1 * i }}
                              className="bg-white/80 backdrop-blur-sm px-3 py-2 rounded-lg text-sm font-semibold text-cyan-700 shadow-sm border border-cyan-100 flex items-center gap-2 hover:scale-105 transition-transform cursor-default"
                            >
                              <div className="w-2 h-2 rounded-full bg-cyan-400" />
                              {cleanSkill}
                            </motion.div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* SOFT SKILLS */}
                {ragData.competenciasBlandas && (
                  <Card className="bg-gradient-to-br from-fuchsia-50 to-pink-50 border-none shadow-lg overflow-hidden relative group hover:shadow-xl transition-all duration-300">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Brain className="w-24 h-24 text-fuchsia-600" />
                    </div>
                    <CardHeader className="pb-2 relative z-10">
                      <CardTitle className="text-lg font-black text-fuchsia-800 flex items-center gap-2">
                        <div className="p-2 bg-fuchsia-100 rounded-lg">
                          <Brain className="w-5 h-5 text-fuchsia-600" />
                        </div>
                        Competencias Blandas
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10 pt-2">
                      <div className="flex flex-wrap gap-2">
                        {ragData.competenciasBlandas.split(/\n|•/).map((skill: string, i: number) => {
                          const cleanSkill = skill.trim();
                          if (!cleanSkill) return null;
                          return (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.1 * i + 0.3 }}
                              className="bg-white/80 backdrop-blur-sm px-3 py-2 rounded-lg text-sm font-semibold text-fuchsia-700 shadow-sm border border-fuchsia-100 flex items-center gap-2 hover:scale-105 transition-transform cursor-default"
                            >
                              <div className="w-2 h-2 rounded-full bg-fuchsia-400" />
                              {cleanSkill}
                            </motion.div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            <div className="flex justify-center">
              <Button
                onClick={handleNextSection}
                size="lg"
                className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg"
              >
                Continuar <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* CONCEPTS SECTION */}
        {currentSection === 'concepts' && (
          <motion.div
            key="concepts"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-amber-500" /> Conceptos Clave
            </h3>
            {keyConcepts.map((item: any, idx: number) => (
              <Card key={idx} className="bg-amber-50 border-amber-200 shadow-md">
                <CardContent className="p-6">
                  <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2 text-lg">
                    <span className="w-8 h-8 rounded-full bg-amber-500 text-white text-sm flex items-center justify-center font-black">
                      {idx + 1}
                    </span>
                    {item.titulo}
                  </h4>
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    <p className="flex-1 text-base text-slate-700">
                      {item.descripcion}
                    </p>
                    {item.imagenUrl && (
                      <div className="w-full md:w-64 aspect-video rounded-xl overflow-hidden border-4 border-white shadow-lg flex-shrink-0">
                        <img src={item.imagenUrl} className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {hints.length > 0 && (
              <Card className="border-l-4 border-l-yellow-500 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
                    <Lightbulb className="w-5 h-5 text-yellow-600" /> Pistas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {hints.map((hint: any, idx: number) => {
                      const hintText = typeof hint === 'string' ? hint : hint.text;
                      const hintImage = typeof hint === 'object' ? hint.imagenUrl : null;

                      return (
                        <div key={idx} className="space-y-2">
                          <div className="flex items-start gap-2 text-sm text-slate-600">
                            <span className="w-5 h-5 rounded-full bg-yellow-100 text-yellow-700 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <span>{hintText}</span>
                          </div>
                          {hintImage && (
                            <div className="ml-7 w-full max-w-xs rounded-lg overflow-hidden border shadow-sm bg-white">
                              <img src={hintImage} className="w-full h-auto object-cover" alt={`Pista ${idx + 1}`} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-center">
              <Button
                onClick={handleNextSection}
                size="lg"
                className="bg-amber-600 hover:bg-amber-700 text-white shadow-lg"
              >
                Subir Evidencia <ArrowRight className="w-5 h-5 ml-2" />
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
            <Card className="border-t-4 border-t-indigo-500 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <FileText className="w-6 h-6 text-indigo-600" /> Evidencia Previa
                </CardTitle>
                <CardDescription>
                  Sube la evidencia de tu trabajo antes de comenzar con los pasos de la misión.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <input
                  type="file"
                  ref={evidenceInputRef}
                  className="hidden"
                  onChange={handleMissionEvidenceUpload}
                />
                <div
                  onClick={() => !isUploading && evidenceInputRef.current?.click()}
                  className={cn(
                    "border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all",
                    missionEvidence
                      ? "bg-green-50 border-green-300"
                      : "bg-indigo-50 border-indigo-200 hover:bg-indigo-100",
                    isUploading && "opacity-50 cursor-wait"
                  )}
                >
                  {missionEvidence ? (
                    <>
                      <CheckCircle2 className="w-16 h-16 mx-auto text-green-600 mb-4" />
                      <p className="text-xl font-bold text-green-700">✓ Evidencia Cargada</p>
                      <p className="text-sm text-green-600 mt-2">{missionEvidence.name}</p>
                    </>
                  ) : (
                    <>
                      <FileText className="w-16 h-16 mx-auto text-indigo-300 mb-4" />
                      <p className="text-lg font-medium text-slate-700">Haga clic para subir su evidencia</p>
                      <p className="text-sm text-slate-500 mt-2">Este paso es obligatorio para continuar</p>
                    </>
                  )}
                </div>

                {missionEvidence && (
                  <Button
                    onClick={handleNextSection}
                    disabled={isUploading || !missionEvidenceUrl}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUploading ? (
                      <span className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 animate-spin" /> Subiendo...
                      </span>
                    ) : (
                      <>Ir a la Misión <ArrowRight className="w-5 h-5 ml-2" /></>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* MISSION SECTION */}
        {currentSection === 'mission' && (
          <motion.div
            key="mission"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <Card className="border-t-4 border-t-green-500 shadow-md">
              <CardHeader className="bg-slate-50 border-b pb-4">
                <CardTitle className="text-2xl flex items-center justify-between">
                  <span className="flex items-center gap-2 text-slate-800">
                    <CheckCircle2 className="w-6 h-6 text-green-600" /> Tu Misión
                  </span>
                  <Badge className="bg-purple-100 text-purple-700 text-sm">
                    Paso {currentStepIndex + 1} de {guidedSteps.length}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-base">{ragData.nombreActividad}</CardDescription>

                {/* Progress Bar */}
                <div className="h-3 w-full bg-slate-200 rounded-full mt-3 overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Current Step Focus */}
                <Card className="border-2 border-purple-100 bg-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center">
                        {currentStepIndex + 1}
                      </div>
                      Paso actual
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                      <p className="flex-1 text-slate-700 leading-relaxed text-lg italic">
                        "{guidedSteps[currentStepIndex]?.paso}"
                      </p>
                      {guidedSteps[currentStepIndex]?.imagenUrl && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="w-full md:w-72 aspect-video rounded-xl overflow-hidden shadow-2xl border-4 border-white ring-8 ring-purple-100/50 flex-shrink-0"
                        >
                          <img src={guidedSteps[currentStepIndex].imagenUrl} className="w-full h-full object-cover" />
                        </motion.div>
                      )}
                    </div>

                    {/* File upload requirement if configured */}
                    {guidedSteps[currentStepIndex]?.requiereEntregable && (
                      <div className="space-y-3">
                        <input
                          type="file"
                          ref={fileInputRef}
                          className="hidden"
                          onChange={handleFileUpload}
                        />
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className={cn(
                            "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
                            stepDeliverable
                              ? "bg-green-50 border-green-300"
                              : "bg-slate-50 border-slate-300 hover:bg-slate-100"
                          )}
                        >
                          {stepDeliverable ? (
                            <>
                              <CheckCircle2 className="w-12 h-12 mx-auto text-green-600 mb-2" />
                              <p className="font-bold text-green-700 text-lg">✓ Entregable cargado</p>
                              <p className="text-sm text-green-600 mt-1">{stepDeliverable.name}</p>
                            </>
                          ) : (
                            <>
                              <FileText className="w-12 h-12 mx-auto text-slate-400 mb-2" />
                              <p className="font-semibold text-slate-600">Click para subir entregable</p>
                              <p className="text-sm text-slate-400 mt-1">Sube una imagen o archivo de tu avance</p>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Button */}
                    <Button
                      onClick={handleStepComplete}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white h-12 text-lg shadow-lg"
                    >
                      {currentStepIndex < guidedSteps.length - 1 ? 'Completar paso' : 'Finalizar Misión'}
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </CardContent>
                </Card>

                {/* Steps History Recap */}
                {completedSteps.length > 0 && (
                  <div className="mt-8">
                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Pasos completados anteriormente</h4>
                    <div className="space-y-2">
                      {completedSteps.map(idx => (
                        <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100 opacity-60">
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                          <span className="text-sm text-slate-600 line-through">{guidedSteps[idx]?.paso}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
            className="space-y-6"
          >
            <Card className="border-4 border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50 shadow-2xl">
              <CardContent className="p-12 text-center">
                <Trophy className="w-24 h-24 text-yellow-500 mx-auto mb-6 animate-bounce" />
                <h2 className="text-4xl font-black text-slate-800 mb-4">
                  ¡Misión Cumplida!
                </h2>
                <p className="text-xl text-slate-600 mb-6">
                  Has completado con éxito la Guía RAG: <strong>{ragData.hitoAprendizaje}</strong>
                </p>
                <div className="flex gap-4 justify-center mb-8">
                  <Badge className="bg-green-500 text-white text-lg px-4 py-2">
                    +500 Puntos
                  </Badge>
                  <Badge className="bg-purple-500 text-white text-lg px-4 py-2">
                    100% Completado
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Earned Competencies Section */}
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-center text-slate-800 flex items-center justify-center gap-2">
                <Award className="w-7 h-7 text-amber-500" /> Competencias Ganadas
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {ragData.competenciasTecnicas && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 border-none shadow-lg overflow-hidden relative group hover:shadow-xl transition-all duration-300 h-full">
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Zap className="w-24 h-24 text-cyan-600" />
                      </div>
                      <CardHeader className="pb-3 relative z-10">
                        <CardTitle className="text-lg font-black text-cyan-800 flex items-center gap-2">
                          <div className="p-2 bg-cyan-100 rounded-lg">
                            <Zap className="w-5 h-5 text-cyan-600" />
                          </div>
                          Competencias Técnicas
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="relative z-10">
                        <div className="flex flex-wrap gap-2">
                          {ragData.competenciasTecnicas.split(/\n|•/).map((skill: string, i: number) => {
                            const cleanSkill = skill.trim();
                            if (!cleanSkill) return null;
                            return (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.1 * i + 0.4 }}
                                className="bg-white/80 backdrop-blur-sm px-3 py-2 rounded-lg text-sm font-semibold text-cyan-700 shadow-sm border border-cyan-100 flex items-center gap-2"
                              >
                                <div className="w-2 h-2 rounded-full bg-cyan-400" />
                                {cleanSkill}
                              </motion.div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {ragData.competenciasBlandas && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Card className="bg-gradient-to-br from-fuchsia-50 to-pink-50 border-none shadow-lg overflow-hidden relative group hover:shadow-xl transition-all duration-300 h-full">
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Brain className="w-24 h-24 text-fuchsia-600" />
                      </div>
                      <CardHeader className="pb-3 relative z-10">
                        <CardTitle className="text-lg font-black text-fuchsia-800 flex items-center gap-2">
                          <div className="p-2 bg-fuchsia-100 rounded-lg">
                            <Brain className="w-5 h-5 text-fuchsia-600" />
                          </div>
                          Competencias Blandas
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="relative z-10">
                        <div className="flex flex-wrap gap-2">
                          {ragData.competenciasBlandas.split(/\n|•/).map((skill: string, i: number) => {
                            const cleanSkill = skill.trim();
                            if (!cleanSkill) return null;
                            return (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.1 * i + 0.6 }}
                                className="bg-white/80 backdrop-blur-sm px-3 py-2 rounded-lg text-sm font-semibold text-fuchsia-700 shadow-sm border border-fuchsia-100 flex items-center gap-2"
                              >
                                <div className="w-2 h-2 rounded-full bg-fuchsia-400" />
                                {cleanSkill}
                              </motion.div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </div>

              {/* Achievement Summary */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300">
                  <CardContent className="p-6">
                    <h4 className="font-bold text-green-800 mb-3 text-center text-lg">
                      📊 Resumen de Logros
                    </h4>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-3xl font-black text-green-600">{completedSteps.length}</p>
                        <p className="text-xs text-green-700">Pasos Completados</p>
                      </div>
                      <div>
                        <p className="text-3xl font-black text-blue-600">+500</p>
                        <p className="text-xs text-blue-700">Puntos Ganados</p>
                      </div>
                      <div>
                        <p className="text-3xl font-black text-purple-600">2</p>
                        <p className="text-xs text-purple-700">Competencias</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
