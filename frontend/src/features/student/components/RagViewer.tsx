import { createPortal } from "react-dom";
import { useState, useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { studentApi } from "@/features/student/services/student.api";
import {
  Target,
  Trophy,
  ArrowRight,
  FileText,
  CheckCircle2,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import AvatarGuide from "./AvatarGuide";
import { AvatarState } from "@/types/gamification";
import { motion, AnimatePresence } from "framer-motion";
import { IntroSplash, ConceptDeck, MissionTimeline } from "./rag/RagComponents";
import canvasConfetti from "canvas-confetti";

interface RagViewerProps {
  levelId: number;
  onAddPoints?: (amount: number, reason: string) => void;
}

type RagSection = 'intro' | 'objectives' | 'concepts' | 'mission' | 'evidence' | 'completion';

export default forwardRef(function RagViewer({ levelId, onAddPoints }: RagViewerProps, ref) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [currentSection, setCurrentSection] = useState<RagSection>('intro');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepDeliverable, setStepDeliverable] = useState<File | null>(null);
  const [missionEvidence, setMissionEvidence] = useState<File | null>(null);
  const [conceptIndex, setConceptIndex] = useState(0);
  const evidenceInputRef = useRef<HTMLInputElement>(null);
  const [missionEvidenceUrl, setMissionEvidenceUrl] = useState<string | null>(null);

  const [avatarState, setAvatarState] = useState<any>({
    isVisible: true,
    emotion: 'neutral',
    message: "¡Hola! Bienvenido a tu Guía RAG. Vamos a recorrer esto juntos paso a paso."
  });

  useImperativeHandle(ref, () => ({
    goNext: () => {
      if (currentSection === 'concepts') {
        const total = data?.contenidoClave?.length || 0;
        if (conceptIndex < total - 1) setConceptIndex(p => p + 1);
        else handleNextSection();
      } else if (currentSection === 'mission') {
        handleStepComplete();
      } else if (currentSection === 'evidence') {
        if (!missionEvidence || isUploading || !missionEvidenceUrl) {
          setAvatarState({
            isVisible: true,
            emotion: 'confused',
            message: isUploading ? "Espera a que termine la subida..." : "¡Espera! Necesitas subir y confirmar la evidencia antes de continuar."
          });
          return;
        }
        handleNextSection();
      } else {
        handleNextSection();
      }
    },
    goPrev: () => {
      if (currentSection === 'concepts') {
        if (conceptIndex > 0) setConceptIndex(p => p - 1);
        else handlePrevSection();
      } else if (currentSection === 'mission') {
        if (currentStepIndex > 0) handlePrevStep();
        else handlePrevSection();
      } else {
        handlePrevSection();
      }
    }
  }));

  // Load data
  useEffect(() => {
    const fetchRag = async () => {
      try {
        const result = await studentApi.getRagTemplate(levelId);
        if (result && result.id) {
          // Parse JSON fields safely
          ['contenidoClave', 'pasosGuiados', 'pistas'].forEach(key => {
            if (typeof result[key] === "string") {
              try { result[key] = JSON.parse(result[key]); } catch { }
            }
          });

          setData(result);

          // Restore progress from backend
          const studentId = parseInt(getStudentId());
          if (studentId && result.id) {
            const submissions = await studentApi.getRagSubmissions(studentId, result.id);
            if (submissions && submissions.length > 0) {
              const Indices = submissions.map((s: any) => s.pasoIndice).filter((i: number) => i >= 0);
              const initialEvidence = submissions.find((s: any) => s.pasoIndice === -1);

              setCompletedSteps(Indices);
              if (initialEvidence) {
                setMissionEvidenceUrl(initialEvidence.archivoUrl);
                // Mock file object or state to indicate presence
                setMissionEvidence(new File([], "evidencia_previa.png"));
              }

              // Check if all done
              const rawSteps = result.pasosGuiados || [];
              const isFullyDone = rawSteps.every((p: any, idx: number) =>
                !p.requiereEntregable || Indices.includes(idx)
              );

              if (isFullyDone) {
                setCurrentSection('completion');
              } else if (Indices.length > 0) {
                setCurrentStepIndex(Math.min(Math.max(...Indices) + 1, rawSteps.length - 1));
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

  // Effect to sync mission evidence if data arrives with a submission
  useEffect(() => {
    if (data?.submissions) {
      const initialEvidence = data.submissions.find((s: any) => s.pasoIndice === -1);
      if (initialEvidence) {
        setMissionEvidenceUrl(initialEvidence.archivoUrl);
      }
    }
  }, [data]);

  const getStudentId = () => {
    const userStr = localStorage.getItem('edu_user');
    if (userStr) {
      try { return JSON.parse(userStr).id || 1; } catch { return 1; }
    }
    return 1;
  };

  const handleStepComplete = async () => {
    const rawSteps = data?.pasosGuiados || [];
    const currentStep = rawSteps[currentStepIndex];
    const requiresDeliverable = currentStep?.requiereEntregable || false;

    if (requiresDeliverable && (!stepDeliverable || isUploading || !currentUploadUrl)) {
      setAvatarState({
        emotion: 'waiting',
        message: isUploading ? 'Espera a que termine la subida...' : '⚠️ Este paso requiere que subas un entregable antes de continuar.',
        isVisible: true
      });
      return;
    }

    try {
      if (requiresDeliverable && currentUploadUrl) {
        await studentApi.submitRagProgress({
          studentId: getStudentId(),
          plantillaRagId: data.id,
          pasoIndice: currentStepIndex,
          archivoUrl: currentUploadUrl,
          tipoArchivo: stepDeliverable?.type || 'unknown'
        });
      } else {
        // If already completed and just reviewing/clicking next, don't resubmit "skipped" unless truly new
        if (!completedSteps.includes(currentStepIndex)) {
          await studentApi.submitRagProgress({
            studentId: getStudentId(),
            plantillaRagId: data.id,
            pasoIndice: currentStepIndex,
            archivoUrl: 'skipped',
            tipoArchivo: 'none'
          });
        }
      }
    } catch (error) {
      console.error("Error submitting progress", error);
    }

    // Mark step as complete
    if (!completedSteps.includes(currentStepIndex)) {
      setCompletedSteps(prev => {
        const newSteps = [...prev, currentStepIndex];
        // Check full completion
        if (newSteps.length === rawSteps.length) {
          setTimeout(() => {
            setCurrentSection('completion');
            canvasConfetti({ particleCount: 200, spread: 100 });
          }, 1000);
        }
        return newSteps;
      });
    }

    // Move to next step
    if (currentStepIndex < rawSteps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      setStepDeliverable(null);
      setCurrentUploadUrl(null);
      setAvatarState({
        isVisible: true,
        emotion: 'happy',
        message: `¡Genial! Siguiente paso: ${rawSteps[currentStepIndex + 1]?.paso}`,
      });
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
      setStepDeliverable(null);
      setCurrentUploadUrl(null);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setStepDeliverable(file);
      setIsUploading(true);
      try {
        setAvatarState({ emotion: 'thinking', message: 'Subiendo archivo...', isVisible: true });
        const res = await studentApi.uploadEvidence(file);
        setCurrentUploadUrl(res.url);
        setAvatarState({
          emotion: 'happy',
          message: `✓ Archivo cargado. Listo para completar.`,
          isVisible: true
        });
      } catch (error: any) {
        console.error("Upload error:", error);
        setAvatarState({ emotion: 'sad', message: 'Error al subir el archivo.', isVisible: true });
      } finally {
        setIsUploading(false);
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

        await studentApi.submitRagProgress({
          studentId: getStudentId(),
          plantillaRagId: data.id,
          pasoIndice: -1,
          archivoUrl: res.url,
          tipoArchivo: file.type || 'unknown'
        });

        setAvatarState({
          emotion: 'happy',
          message: `¡Evidencia recibida! Has completado el desafío.`,
          isVisible: true
        });
      } catch (error: any) {
        console.error("Error:", error);
        setAvatarState({ emotion: 'sad', message: 'Error al subir evidencia.', isVisible: true });
        setMissionEvidence(null);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleNextSection = () => {
    const sections: RagSection[] = ['intro', 'objectives', 'concepts', 'mission', 'evidence', 'completion'];
    const currentIndex = sections.indexOf(currentSection);
    if (currentIndex < sections.length - 1) {
      setCurrentSection(sections[currentIndex + 1]);
    }
  };

  const handlePrevSection = () => {
    const sections: RagSection[] = ['intro', 'objectives', 'concepts', 'mission', 'evidence', 'completion'];
    const currentIndex = sections.indexOf(currentSection);
    if (currentIndex > 0) {
      setCurrentSection(sections[currentIndex - 1]);
    }
  };

  if (loading) return <div className="p-20 text-center animate-pulse text-indigo-500">Cargando experiencia...</div>;
  if (!data) return <div className="p-20 text-center text-slate-400">Guía no disponible.</div>;

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">


      <div className="w-full flex-1 min-h-0">
        <AnimatePresence mode="wait">

          {/* INTRO */}
          {currentSection === 'intro' && (
            <IntroSplash
              key="intro"
              title={data.hitoAprendizaje}
              purpose={data.proposito}
              modality={data.modalidad}
              type={data.tipoRag}
              onStart={handleNextSection}
            />
          )}

          {/* OBJECTIVES */}
          {currentSection === 'objectives' && (
            <motion.div
              key="objectives"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, x: -100 }}
              className="h-full overflow-y-auto custom-scrollbar p-4"
            >
              <div className="max-w-4xl mx-auto space-y-4 pb-20">
                <div className="text-center mb-4">
                  <h2 className="text-3xl font-black text-slate-800 mb-2">🎯 Objetivo del RAG</h2>
                  <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-6">{data.objetivoAprendizaje}</p>

                  <div className="bg-blue-50/50 rounded-xl p-4 max-w-xl mx-auto border border-blue-100 mb-8">
                    <p className="text-sm text-blue-700 font-medium">
                      🚀 <strong>¿Para qué sirve esto?</strong><br />
                      Al completar este módulo, dominarás tanto las herramientas técnicas como las habilidades de gestión necesarias para destacar en este rol.
                    </p>
                  </div>
                </div>

                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-slate-700">🚀 Habilidades que potenciarás</h3>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-0 shadow-lg hover:shadow-xl transition-all">
                    <CardHeader>
                      <CardTitle className="text-indigo-800 flex items-center gap-2">
                        <Sparkles className="w-5 h-5" /> Competencias Técnicas
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {data.competenciasTecnicas?.split(/\n|•/).map((s: string, i: number) => (
                          s.trim() && <Badge key={i} className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 cursor-default px-3 py-1">{s.trim()}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-0 shadow-lg hover:shadow-xl transition-all">
                    <CardHeader>
                      <CardTitle className="text-purple-800 flex items-center gap-2">
                        <Target className="w-5 h-5" /> Competencias Blandas
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {data.competenciasBlandas?.split(/\n|•/).map((s: string, i: number) => (
                          s.trim() && <Badge key={i} className="bg-purple-100 text-purple-700 hover:bg-purple-200 cursor-default px-3 py-1">{s.trim()}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex justify-center gap-4 pt-4">
                  <Button
                    variant="outline"
                    onClick={handlePrevSection}
                    size="lg"
                    className="rounded-full px-10 py-6 text-lg"
                  >
                    Regresar
                  </Button>
                  <Button
                    onClick={handleNextSection}
                    size="lg"
                    className="bg-slate-900 text-white rounded-full px-10 py-6 text-lg hover:scale-105 transition-transform"
                  >
                    Entendido, Continuar <ArrowRight className="ml-2" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* CONCEPTS */}
          {currentSection === 'concepts' && (
            <motion.div
              key="concepts"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full overflow-y-auto custom-scrollbar p-4"
            >
              <ConceptDeck
                concepts={data.contenidoClave || []}
                currentIndex={conceptIndex}
                setCurrentIndex={setConceptIndex}
                onComplete={handleNextSection}
              />
            </motion.div>
          )}

          {/* EVIDENCE */}
          {currentSection === 'evidence' && (
            <motion.div
              key="evidence"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="h-full overflow-y-auto custom-scrollbar p-4"
            >
              <div className="max-w-2xl mx-auto pb-10">
                <Card className="shadow-xl border-0 overflow-hidden">
                  <div className="bg-slate-900 p-4 text-white text-center">
                    <FileText className="w-12 h-12 mx-auto mb-2 text-indigo-400" />
                    <h2 className="text-2xl font-bold mb-1">Entrega de Evidencia Final</h2>
                    <p className="text-slate-400 text-sm max-w-md mx-auto">
                      ¡Felicidades por completar la misión! Ahora sube tu evidencia final para validar tu aprendizaje y obtener tu recompensa.
                    </p>
                  </div>
                  <CardContent className="p-8 space-y-6">
                    <input
                      type="file"
                      ref={evidenceInputRef}
                      className="hidden"
                      onChange={handleMissionEvidenceUpload}
                    />
                    <div
                      onClick={() => !isUploading && evidenceInputRef.current?.click()}
                      className={cn(
                        "border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all hover:bg-slate-50 relative group",
                        missionEvidence ? "border-green-400 bg-green-50/50" : "border-slate-300"
                      )}
                    >
                      {missionEvidence ? (
                        <>
                          <CheckCircle2 className="w-16 h-16 mx-auto text-green-500 mb-4" />
                          <p className="text-xl font-bold text-green-700">¡Listo para enviar!</p>
                          <p className="text-green-600">{missionEvidence.name}</p>
                        </>
                      ) : (
                        <>
                          <p className="text-lg font-medium text-slate-700">Arrastra tu archivo aquí o haz clic</p>
                          <p className="text-sm text-slate-500 mt-2 italic">Si ya subiste uno, se mostrará como completado abajo.</p>
                        </>
                      )}
                    </div>

                    <div className="flex gap-4">
                      <Button
                        variant="outline"
                        onClick={handlePrevSection}
                        className="flex-1 h-12 text-lg"
                      >
                        Regresar
                      </Button>
                      <Button
                        onClick={handleNextSection}
                        disabled={!missionEvidence || isUploading || !missionEvidenceUrl}
                        className="flex-[2] h-12 text-lg bg-indigo-600 hover:bg-indigo-700"
                      >
                        {isUploading ? "Subiendo..." : "Confirmar y Finalizar Módulo"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}

          {/* MISSION */}
          {currentSection === 'mission' && (
            <motion.div
              key="mission"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col"
            >
              <MissionTimeline
                steps={data.pasosGuiados || []}
                currentStepIndex={currentStepIndex}
                completedSteps={completedSteps}
                onStepSelect={setCurrentStepIndex}
                onStepComplete={handleStepComplete}
                stepDeliverable={stepDeliverable}
                isUploading={isUploading}
                onFileUpload={handleFileUpload}
                onPrevStep={handlePrevStep}
              />
            </motion.div>
          )}

          {/* COMPLETION */}
          {currentSection === 'completion' && (
            <motion.div
              key="completion"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-start py-2 text-center max-w-4xl mx-auto h-full overflow-y-auto custom-scrollbar"
            >
              <div className="relative pt-4">
                <div className="absolute inset-0 bg-yellow-500 blur-3xl opacity-20 animate-pulse" />
                <div className="w-32 h-32 bg-gradient-to-br from-yellow-100 to-amber-100 rounded-full flex items-center justify-center mb-4 shadow-2xl ring-8 ring-white relative z-10 animate-bounce">
                  <Trophy className="w-16 h-16 text-yellow-600 drop-shadow-sm" />
                </div>
              </div>

              <h1 className="text-4xl font-black text-slate-800 mb-4 tracking-tight">
                ¡Misión Completada!
              </h1>

              <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
                <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white text-md px-4 py-1.5 rounded-full shadow-lg border-2 border-yellow-400">
                  <Sparkles className="w-4 h-4 mr-2" />
                  +500 XP
                </Badge>
                <Badge className="bg-green-500 hover:bg-green-600 text-white text-md px-4 py-1.5 rounded-full shadow-lg border-2 border-green-400">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Finalizada
                </Badge>
              </div>

              <div className="grid md:grid-cols-2 gap-6 w-full text-left mb-10">
                {/* Summary Card */}
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-indigo-600" /> Competencias Adquiridas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-2">Técnicas</p>
                        <div className="flex flex-wrap gap-2">
                          {data.competenciasTecnicas?.split(/\n|•/).map((s: string, i: number) => (
                            s.trim() && <Badge key={i} variant="secondary" className="bg-indigo-50 text-indigo-700 border-indigo-100">{s.trim()}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-2">Blandas</p>
                        <div className="flex flex-wrap gap-2">
                          {data.competenciasBlandas?.split(/\n|•/).map((s: string, i: number) => (
                            s.trim() && <Badge key={i} variant="secondary" className="bg-purple-50 text-purple-700 border-purple-100">{s.trim()}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Next Steps Card */}
                <Card className="border-0 shadow-xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <ArrowRight className="w-5 h-5 text-cyan-400" /> Siguientes Pasos
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <p className="text-indigo-200">
                      Has dominado los conceptos de <strong>{data.hitoAprendizaje}</strong>. Ahora estás listo para el desafío final.
                    </p>
                    <Button
                      onClick={() => window.location.href = '#ha'}
                      className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold h-12 text-lg shadow-[0_0_20px_rgba(6,182,212,0.5)]"
                    >
                      Ir al Hito de Aprendizaje
                    </Button>
                    <Button
                      onClick={() => window.history.back()}
                      variant="outline"
                      className="w-full border-white/20 hover:bg-white/10 text-white hover:text-white"
                    >
                      Volver al Mapa
                    </Button>
                  </CardContent>
                </Card>
              </div>
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
              className="transition-opacity duration-300"
            />
          </div>
        </div>,
        document.body
      )}
    </div>
  );
});
