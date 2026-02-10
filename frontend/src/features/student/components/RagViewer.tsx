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
  Sparkles,
  Upload
} from "lucide-react";
import { cn } from "@/lib/utils";
import AvatarGuide from "./AvatarGuide";
import { AvatarState } from "@/types/gamification";
import { motion, AnimatePresence } from "framer-motion";
import { IntroSplash, ConceptDeck, MissionTimeline, ActivityIntro, HintDeck } from "./rag/RagComponents";
import canvasConfetti from "canvas-confetti";

interface RagViewerProps {
  levelId: number;
  onAddPoints?: (amount: number, reason: string) => void;
  hasAttended?: boolean;
}

type RagSection = 'intro' | 'objectives' | 'concepts' | 'activity' | 'mission' | 'hints' | 'evidence' | 'completion';

export default forwardRef(function RagViewer({ levelId, onAddPoints, hasAttended }: RagViewerProps, ref) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [currentSection, setCurrentSection] = useState<RagSection>('intro');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepDeliverable, setStepDeliverable] = useState<File | null>(null);
  const [missionEvidence, setMissionEvidence] = useState<File | null>(null);
  const [conceptIndex, setConceptIndex] = useState(0);
  const [hintIndex, setHintIndex] = useState(0);
  const evidenceInputRef = useRef<HTMLInputElement>(null);
  const [missionEvidenceUrl, setMissionEvidenceUrl] = useState<string | null>(null);

  const [avatarState, setAvatarState] = useState<any>({
    isVisible: true,
    emotion: 'neutral',
    message: "¡Hola! Bienvenido a tu Guía RAG. Vamos a recorrer esto juntos paso a paso."
  });

  const getStudentId = () => {
    const userStr = localStorage.getItem('edu_user');
    if (userStr) {
      try { return JSON.parse(userStr).id || 1; } catch { return 1; }
    }
    return 1;
  };

  const handlePrevSection = () => {
    const sections: RagSection[] = ['intro', 'objectives', 'concepts', 'activity', 'mission', 'hints', 'evidence', 'completion'];
    const currentIndex = sections.indexOf(currentSection);

    // Logic to skip hints if empty (backwards)
    if (currentSection === 'evidence' && (!data?.pistas || data.pistas.length === 0)) {
      setCurrentSection('mission');
      return { handled: true };
    }

    if (currentIndex > 0) {
      setCurrentSection(sections[currentIndex - 1]);
      return { handled: true };
    }
    return { handled: false };
  };

  const handleNextSection = () => {
    const sections: RagSection[] = ['intro', 'objectives', 'concepts', 'activity', 'mission', 'hints', 'evidence', 'completion'];
    const currentIndex = sections.indexOf(currentSection);

    // Logic to skip hints if empty
    if (currentSection === 'mission' && (!data?.pistas || data.pistas.length === 0)) {
      setCurrentSection('evidence');
      return { handled: true };
    }

    if (currentIndex < sections.length - 1) {
      setCurrentSection(sections[currentIndex + 1]);
      return { handled: true };
    }
    return { handled: false };
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

    if (!completedSteps.includes(currentStepIndex)) {
      setCompletedSteps(prev => {
        const newSteps = [...prev, currentStepIndex];
        if (newSteps.length === rawSteps.length) {
          // Mission steps finished, we only trigger celebration when reaching completion section
          // but we award XP or similar logic here if needed.
        }
        return newSteps;
      });
    }

    if (currentStepIndex < rawSteps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      setStepDeliverable(null);
      setCurrentUploadUrl(null);
      setAvatarState({
        isVisible: true,
        emotion: 'happy',
        message: `¡Genial! Siguiente paso: ${rawSteps[currentStepIndex + 1]?.paso}`,
      });
    } else {
      handleNextSection();
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
      setStepDeliverable(null);
      setCurrentUploadUrl(null);
    }
  };

  useImperativeHandle(ref, () => ({
    goNext: () => {
      if (currentSection === 'concepts') {
        const total = data?.contenidoClave?.length || 0;
        if (conceptIndex < total - 1) {
          setConceptIndex(p => p + 1);
          return { handled: true };
        }
        return handleNextSection();
      } else if (currentSection === 'mission') {
        handleStepComplete();
        return { handled: true };
      } else if (currentSection === 'hints') {
        const total = data?.pistas?.length || 0;
        if (hintIndex < total - 1) {
          setHintIndex(p => p + 1);
          return { handled: true };
        }
        return handleNextSection();
      } else if (currentSection === 'evidence') {
        if (!missionEvidence || isUploading || !missionEvidenceUrl) {
          setAvatarState({
            isVisible: true,
            emotion: 'confused',
            message: isUploading ? "Espera a que termine la subida..." : "¡Espera! Necesitas subir y confirmar la evidencia antes de continuar."
          });
          return { handled: true };
        }
        return handleNextSection();
      } else {
        return handleNextSection();
      }
    },
    goPrev: () => {
      if (currentSection === 'concepts') {
        if (conceptIndex > 0) {
          setConceptIndex(p => p - 1);
          return { handled: true };
        }
        return handlePrevSection();
      } else if (currentSection === 'mission') {
        if (currentStepIndex > 0) {
          handlePrevStep();
          return { handled: true };
        }
        return handlePrevSection();
      } else if (currentSection === 'hints') {
        if (hintIndex > 0) {
          setHintIndex(p => p - 1);
          return { handled: true };
        }
        return handlePrevSection();
      } else if (currentSection === 'completion' || currentSection === 'evidence') {
        return handlePrevSection();
      } else {
        return handlePrevSection();
      }
    }
  }));

  useEffect(() => {
    const fetchRag = async () => {
      try {
        const result = await studentApi.getRagTemplate(levelId);
        if (result && result.id) {
          ['contenidoClave', 'pasosGuiados', 'pistas'].forEach(key => {
            if (typeof result[key] === "string") {
              try { result[key] = JSON.parse(result[key]); } catch { }
            }
          });

          setData(result);
          const studentId = parseInt(getStudentId());
          if (studentId && result.id) {
            const submissions = await studentApi.getRagSubmissions(studentId, result.id);
            if (submissions && submissions.length > 0) {
              const Indices = submissions.map((s: any) => s.pasoIndice).filter((i: number) => i >= 0);
              const initialEvidence = submissions.find((s: any) => s.pasoIndice === -1);

              setCompletedSteps(Indices);
              if (initialEvidence) {
                setMissionEvidenceUrl(initialEvidence.archivoUrl);
                setMissionEvidence(new File([], "evidencia_previa.png"));
              }

              const rawSteps = result.pasosGuiados || [];
              const isFullyDone = rawSteps.every((p: any, idx: number) =>
                !p.requiereEntregable || Indices.includes(idx)
              );

              if (isFullyDone) {
                // If fully done (all steps + evidence), we can go to completion
                // or stay at evidence. Let's stay at evidence if they want to review uploads.
                // For now, let's keep it at the last relevant step or intro.
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

  useEffect(() => {
    if (data && !hasAttended) {
      setAvatarState({
        isVisible: true,
        emotion: 'thinking',
        message: "Veo que no pudiste asistir a la clase presencial. ¡No te preocupes! Al completar esta guía, podrás recuperar tu asistencia y ganar puntos extra."
      });
    }
  }, [hasAttended, !!data]);

  const [currentUploadUrl, setCurrentUploadUrl] = useState<string | null>(null);

  useEffect(() => {
    if (data?.submissions) {
      const initialEvidence = data.submissions.find((s: any) => s.pasoIndice === -1);
      if (initialEvidence) {
        setMissionEvidenceUrl(initialEvidence.archivoUrl);
      }
    }
  }, [data]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setStepDeliverable(file);
      setIsUploading(true);
      try {
        setAvatarState({ emotion: 'thinking', message: 'Subiendo archivo...', isVisible: true });
        const res = await studentApi.uploadEvidence(file);
        setCurrentUploadUrl(res.url);
        setAvatarState({ emotion: 'happy', message: `✓ Archivo cargado. Listo para completar.`, isVisible: true });
      } catch (error: any) {
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

        setAvatarState({ emotion: 'happy', message: `¡Evidencia recibida! Has completado el desafío.`, isVisible: true });
      } catch (error: any) {
        setAvatarState({ emotion: 'sad', message: 'Error al subir evidencia.', isVisible: true });
        setMissionEvidence(null);
      } finally {
        setIsUploading(false);
      }
    }
  };

  useEffect(() => {
    const scrollableElements = document.querySelectorAll('.custom-scrollbar');
    scrollableElements.forEach(el => el.scrollTo({ top: 0, behavior: 'smooth' }));
  }, [currentSection, currentStepIndex]);

  useEffect(() => {
    if (currentSection === 'completion') {
      canvasConfetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [currentSection]);

  if (loading) return <div className="p-20 text-center animate-pulse text-indigo-500">Cargando experiencia...</div>;
  if (!data) return <div className="p-20 text-center text-slate-400">Guía no disponible.</div>;

  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-slate-50/50">
      <div className="w-full flex-1 min-h-0 relative">
        <AnimatePresence mode="wait">
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

          {currentSection === 'objectives' && (
            <motion.div
              key="objectives"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full overflow-y-auto custom-scrollbar p-6"
            >
              <div className="max-w-5xl mx-auto space-y-8 pb-20">
                <div className="text-center mb-8">
                  <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="inline-block">
                    <h2 className="text-4xl md:text-5xl font-black text-slate-800 mb-4 tracking-tight">🎯 Objetivo del RAG</h2>
                  </motion.div>
                  <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">{data.objetivoAprendizaje}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-0 shadow-lg group overflow-hidden relative">
                    <CardHeader>
                      <CardTitle className="text-indigo-900 text-2xl flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600"><Sparkles className="w-6 h-6" /></div>
                        Competencias Técnicas
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2.5">
                        {data.competenciasTecnicas?.split(/\n|•/).map((s: string, i: number) => (
                          s.trim() && <Badge key={i} className="bg-white text-indigo-700 border border-indigo-100 px-4 py-1.5 text-sm">{s.trim()}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-0 shadow-lg group overflow-hidden relative">
                    <CardHeader>
                      <CardTitle className="text-purple-900 text-2xl flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg text-purple-600"><Target className="w-6 h-6" /></div>
                        Competencias Blandas
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2.5">
                        {data.competenciasBlandas?.split(/\n|•/).map((s: string, i: number) => (
                          s.trim() && <Badge key={i} className="bg-white text-purple-700 border border-purple-100 px-4 py-1.5 text-sm">{s.trim()}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex justify-center gap-6 pt-8">
                  <Button variant="outline" onClick={handlePrevSection} className="h-14 px-8 border-2 rounded-2xl text-lg font-bold hover:bg-slate-50 text-slate-500">Regresar</Button>
                  <Button onClick={handleNextSection} className="h-14 px-10 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-lg shadow-xl hover:scale-105 transition-all font-bold">Continuar <ArrowRight className="ml-3 w-5 h-5" /></Button>
                </div>
              </div>
            </motion.div>
          )}

          {currentSection === 'concepts' && (
            <motion.div key="concepts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full overflow-y-auto custom-scrollbar p-4">
              <ConceptDeck concepts={data.contenidoClave || []} currentIndex={conceptIndex} setCurrentIndex={setConceptIndex} onComplete={handleNextSection} />
            </motion.div>
          )}

          {currentSection === 'activity' && (
            <motion.div key="activity" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full overflow-y-auto custom-scrollbar">
              <ActivityIntro name={data.nombreActividad} description={data.descripcionDesafio} onStart={handleNextSection} />
            </motion.div>
          )}

          {currentSection === 'mission' && (
            <motion.div key="mission" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col">
              <MissionTimeline steps={data.pasosGuiados || []} currentStepIndex={currentStepIndex} completedSteps={completedSteps} onStepSelect={setCurrentStepIndex} onStepComplete={handleStepComplete} stepDeliverable={stepDeliverable} isUploading={isUploading} onFileUpload={handleFileUpload} onPrevStep={handlePrevSection} />
            </motion.div>
          )}

          {currentSection === 'hints' && (
            <motion.div key="hints" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full overflow-y-auto custom-scrollbar">
              <HintDeck hints={data.pistas || []} currentIndex={hintIndex} setCurrentIndex={setHintIndex} onComplete={handleNextSection} />
            </motion.div>
          )}

          {currentSection === 'evidence' && (
            <motion.div key="evidence" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="h-full overflow-y-auto custom-scrollbar p-6">
              <div className="max-w-2xl mx-auto h-full flex flex-col justify-center">
                <Card className="shadow-2xl border-0 overflow-hidden rounded-[2rem] bg-white">
                  <div className="p-8 pb-0 text-center relative z-10">
                    <div className="inline-flex items-center justify-center p-3 bg-indigo-50 rounded-2xl mb-4"><Target className="w-8 h-8 text-indigo-600" /></div>
                    <h2 className="text-3xl font-black text-slate-800 mb-2 tracking-tight">Entrega Final</h2>
                  </div>
                  <CardContent className="p-6 md:p-8 space-y-6">
                    <input type="file" ref={evidenceInputRef} className="hidden" onChange={handleMissionEvidenceUpload} />
                    <div onClick={() => !isUploading && evidenceInputRef.current?.click()} className={cn("group border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all duration-300", missionEvidence ? "border-green-500 bg-green-50" : "border-indigo-200 bg-indigo-50 hover:border-indigo-400")}>
                      {missionEvidence ? <p className="text-xl font-bold text-green-700 truncate">{missionEvidence.name}</p> : <p className="text-xl font-bold text-slate-700">Subir Evidencia</p>}
                    </div>
                    <div className="flex gap-4">
                      <Button variant="ghost" onClick={handlePrevSection} className="flex-1 h-14 font-bold text-slate-400">Anterior</Button>
                      <Button onClick={handleNextSection} disabled={!missionEvidence || isUploading || !missionEvidenceUrl} className="flex-[2] h-14 bg-indigo-600 text-white rounded-xl shadow-lg ring-offset-2 hover:scale-[1.02] transition-all">{isUploading ? "Subiendo..." : "Finalizar Misión"}</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}

          {currentSection === 'completion' && (
            <motion.div key="completion" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center py-12 px-4 text-center max-w-5xl mx-auto h-full overflow-y-auto custom-scrollbar">
              <motion.div initial={{ scale: 0, rotate: 360 }} animate={{ scale: 1, rotate: 0 }} className="w-24 h-24 bg-gradient-to-br from-yellow-200 to-amber-400 rounded-full flex items-center justify-center mb-4 shadow-xl ring-4 ring-white"><Trophy className="w-12 h-12 text-yellow-800" /></motion.div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-800 mb-4">¡Misión Completada!</h1>
              <div className="flex gap-3 mb-6">
                <Badge className="bg-yellow-500 text-white px-3 py-1 rounded-full">+500 XP</Badge>
                <Badge className="bg-green-500 text-white px-3 py-1 rounded-full">Módulo Finalizado</Badge>
              </div>
              <div className="flex flex-col md:flex-row gap-6 w-full items-stretch justify-center min-h-[400px]">
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur rounded-2xl flex-1 flex flex-col">
                  <CardHeader><CardTitle className="text-xl flex items-center gap-2"><Target className="w-5 h-5 text-indigo-600" /> Resumen</CardTitle></CardHeader>
                  <CardContent className="p-6 flex-1 overflow-y-auto">
                    <div className="space-y-6 text-left">
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase mb-3">Técnicas</p>
                        <div className="flex flex-wrap gap-2">{data.competenciasTecnicas?.split(/\n|•/).map((s: string, i: number) => s.trim() && <Badge key={i} variant="secondary" className="bg-indigo-50 text-indigo-700">{s.trim()}</Badge>)}</div>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase mb-3">Blandas</p>
                        <div className="flex flex-wrap gap-2">{data.competenciasBlandas?.split(/\n|•/).map((s: string, i: number) => s.trim() && <Badge key={i} variant="secondary" className="bg-purple-50 text-purple-700">{s.trim()}</Badge>)}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-xl bg-slate-900 text-white rounded-2xl relative flex-1 flex flex-col justify-center p-8 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-slate-900 opacity-90" />
                  <div className="relative z-10 space-y-6">
                    <p className="text-indigo-200 text-lg">Has dominado los conceptos de <strong className="text-white">{data.hitoAprendizaje}</strong>. Estás listo para lo que sigue.</p>
                    <div className="space-y-3">
                      <Button onClick={() => window.location.href = '/dashboard'} className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold h-12 rounded-xl">Volver al Mapa</Button>
                      <Button onClick={handlePrevSection} variant="outline" className="w-full border-white/10 text-slate-300 hover:bg-white/10 rounded-xl h-10">Regresar</Button>
                    </div>
                  </div>
                </Card>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {createPortal(
        <div className={cn("fixed bottom-4 right-2 z-[9999] pointer-events-none transition-opacity duration-500", !avatarState.isVisible && "opacity-0")}>
          <div className="pointer-events-auto">
            <AvatarGuide emotion={avatarState.emotion} message={avatarState.message} />
          </div>
        </div>,
        document.body
      )}
    </div>
  );
});
