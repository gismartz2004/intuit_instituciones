import { useState, useEffect } from "react";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RagViewerProps {
  levelId: number;
}

export default function RagViewer({ levelId }: RagViewerProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  useEffect(() => {
    const fetchRag = async () => {
      try {
        // Assuming studentApi has this method implemented to fetch public RAG data
        const result = await studentApi.getRagTemplate(levelId);
        if (result) {
          // Parse JSON fields safely
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
        }
      } catch (e) {
        console.error("No RAG data found");
      } finally {
        setLoading(false);
      }
    };
    fetchRag();
  }, [levelId]);

  const toggleStep = (index: number) => {
    setCompletedSteps((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
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

  const ragData = data; // Alias for clarity
  let guidedSteps = [];
  try {
    // guidedSteps = JSON.parse(ragData.pasosGuiados || "[]");
    guidedSteps = ragData.pasosGuiados || [];
  } catch {}

  let keyConcepts = [];
  try {
    // keyConcepts = JSON.parse(ragData.contenidoClave || "[]");
    keyConcepts = ragData.contenidoClave || [];
  } catch {}

  let hints = [];
  try {
    // hints = JSON.parse(ragData.pistas || "[]");
    hints = ragData.pistas || [];
  } catch {}

  let seccionesDinamicas = [];
  try {
    // seccionesDinamicas = JSON.parse(ragData.seccionesDinamicas || "[]");
    seccionesDinamicas = ragData.seccionesDinamicas || [];
  } catch {}
  const progress = Math.round(
    (completedSteps.length / (guidedSteps.length || 1)) * 100,
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
            <div className="flex gap-2 flex-wrap">
              <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm">
                RAG: {ragData.modalidad}
              </Badge>
              {ragData.tipoRag && (
                <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm">
                  {ragData.tipoRag}
                </Badge>
              )}
            </div>
            <div className="flex gap-2 text-sm font-medium text-blue-100">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" /> {ragData.mes} - {ragData.semana}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" /> {ragData.duracionEstimada} min
              </span>
            </div>
          </div>
          {(ragData.programa || ragData.modulo) && (
            <div className="mb-3 text-sm text-blue-100 opacity-90">
              {ragData.programa} {ragData.modulo && `• ${ragData.modulo}`}
            </div>
          )}
          <h1 className="text-3xl font-black mb-2">
            {ragData.hitoAprendizaje}
          </h1>
          <p className="text-blue-100 max-w-2xl text-lg opacity-90">
            {ragData.proposito}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Context & Concepts */}
        <div className="space-y-6 md:col-span-2">
          {/* Objectives */}
          <Card className="border-l-4 border-l-purple-500 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
                <Target className="w-5 h-5 text-purple-600" /> Objetivo Semanal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 leading-relaxed font-medium">
                {ragData.objetivoAprendizaje}
              </p>
            </CardContent>
          </Card>

          {/* Micro-Learning Concepts */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-500" /> Conceptos Clave
            </h3>
            {keyConcepts.map((item: any, idx: number) => (
              <Card key={idx} className="bg-slate-50 border-slate-200">
                <CardContent className="p-4">
                  <h4 className="font-bold text-slate-800 mb-1 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    {item.titulo}
                  </h4>
                  <p className="text-sm text-slate-600 pl-8">
                    {item.descripcion}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Challenge Description */}
          {ragData.descripcionDesafio && (
            <Card className="border-l-4 border-l-orange-500 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
                  <Trophy className="w-5 h-5 text-orange-600" /> Desafío
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 leading-relaxed">
                  {ragData.descripcionDesafio}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Hints */}
          {hints.length > 0 && (
            <Card className="border-l-4 border-l-yellow-500 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
                  <Lightbulb className="w-5 h-5 text-yellow-600" /> Pistas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {hints.map((hint: string, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 text-sm text-slate-600"
                    >
                      <span className="w-5 h-5 rounded-full bg-yellow-100 text-yellow-700 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{hint}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Competencies */}
          {(ragData.competenciasTecnicas || ragData.competenciasBlandas) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ragData.competenciasTecnicas && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold text-blue-800">
                      Competencias Técnicas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-blue-700 whitespace-pre-line">
                      {ragData.competenciasTecnicas}
                    </p>
                  </CardContent>
                </Card>
              )}
              {ragData.competenciasBlandas && (
                <Card className="bg-purple-50 border-purple-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold text-purple-800">
                      Competencias Blandas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-purple-700 whitespace-pre-line">
                      {ragData.competenciasBlandas}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Evidence & Criteria */}
          {(ragData.tipoEvidencia || ragData.cantidadEvidencias || ragData.porcentajeAporte) && (
            <Card className="border-t-4 border-t-indigo-500 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
                  <FileText className="w-5 h-5 text-indigo-600" /> Evidencias y Evaluación
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  {ragData.tipoEvidencia && (
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Tipo de Evidencia</p>
                      <p className="text-sm text-slate-700 font-semibold">{ragData.tipoEvidencia}</p>
                    </div>
                  )}
                  {ragData.cantidadEvidencias && (
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Cantidad</p>
                      <p className="text-sm text-slate-700 font-semibold">{ragData.cantidadEvidencias}</p>
                    </div>
                  )}
                </div>
                {ragData.porcentajeAporte && (
                  <div className="bg-indigo-50 p-3 rounded-lg">
                    <p className="text-xs text-indigo-600 font-medium mb-1">Aporte a la Calificación</p>
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-indigo-600" />
                      <span className="text-2xl font-bold text-indigo-700">{ragData.porcentajeAporte}%</span>
                    </div>
                  </div>
                )}
                {(ragData.criterioEvidencia || ragData.criterioPasos || ragData.criterioTiempo) && (
                  <div>
                    <p className="text-xs text-slate-500 font-medium mb-2">Criterios de Evaluación</p>
                    <div className="flex flex-wrap gap-2">
                      {ragData.criterioEvidencia && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                          ✓ Evidencia
                        </Badge>
                      )}
                      {ragData.criterioPasos && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                          ✓ Pasos
                        </Badge>
                      )}
                      {ragData.criterioTiempo && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                          ✓ Tiempo
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
                {(ragData.actualizaRadar || ragData.regularizaAsistencia) && (
                  <div>
                    <p className="text-xs text-slate-500 font-medium mb-2">Beneficios</p>
                    <div className="flex flex-wrap gap-2">
                      {ragData.actualizaRadar && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                          📊 Actualiza Radar
                        </Badge>
                      )}
                      {ragData.regularizaAsistencia && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                          ✓ Regulariza Asistencia
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Interactive Checklist */}
        <div className="space-y-6">
          <Card className="border-t-4 border-t-green-500 shadow-md sticky top-6">
            <CardHeader className="bg-slate-50 border-b pb-4">
              <CardTitle className="text-lg flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-800">
                  <CheckCircle2 className="w-5 h-5 text-green-600" /> Tu Misión
                </span>
                <span
                  className={cn(
                    "text-xs font-bold px-2 py-1 rounded-full",
                    progress === 100
                      ? "bg-green-100 text-green-700"
                      : "bg-slate-200 text-slate-600",
                  )}
                >
                  {progress}%
                </span>
              </CardTitle>
              <CardDescription>{ragData.nombreActividad}</CardDescription>
              {/* Progress Bar */}
              <div className="h-2 w-full bg-slate-200 rounded-full mt-3 overflow-hidden">
                <div
                  className="h-full bg-green-500 transition-all duration-500 ease-out"
                  style={{ width: `${progress}% ` }}
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[400px]">
                <div className="p-4 space-y-1">
                  {guidedSteps.map((step: any, idx: number) => (
                    <div
                      key={idx}
                      onClick={() => toggleStep(idx)}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors border",
                        completedSteps.includes(idx)
                          ? "bg-green-50 border-green-200"
                          : "hover:bg-slate-50 border-transparent hover:border-slate-100",
                      )}
                    >
                      <Checkbox
                        checked={completedSteps.includes(idx)}
                        className="mt-1 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                      />
                      <span
                        className={cn(
                          "text-sm transition-all",
                          completedSteps.includes(idx) &&
                            "text-slate-400 line-through",
                        )}
                      >
                        {step.paso}
                      </span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
            {progress === 100 && (
              <div className="p-4 bg-green-50 border-t border-green-100 text-center animate-in zoom-in">
                <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <p className="font-bold text-green-800">¡Misión Cumplida!</p>
                <p className="text-xs text-green-600">
                  Has completado todos los pasos.
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
