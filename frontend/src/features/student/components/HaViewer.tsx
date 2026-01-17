
import { useEffect, useState } from "react";
import { studentApi } from "@/features/student/services/student.api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Target, Lightbulb, Trophy, FileText, MessageSquare, ListTodo, Circle } from "lucide-react";

interface HaViewerProps {
    levelId: number;
}

export default function HaViewer({ levelId }: HaViewerProps) {
    const [haData, setHaData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        studentApi.getHaTemplate(levelId)
            .then(data => setHaData(data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [levelId]);

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

    let seccionesDinamicas = [];
    try { seccionesDinamicas = JSON.parse(haData.seccionesDinamicas || "[]"); } catch { }

    return (
        <ScrollArea className="h-full">
            <div className="max-w-4xl mx-auto p-6 space-y-8 pb-20">

                {/* HEADLINE */}
                <div className="text-center space-y-2 mb-8">
                    <Badge variant="outline" className="mb-2 border-cyan-500 text-cyan-600 bg-cyan-50">
                        Hito de Aprendizaje
                    </Badge>
                    <h1 className="text-3xl font-bold text-slate-800">
                        {haData.fase || "Fase de Aprendizaje"}
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        {haData.objetivoSemana}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Concepto Clave */}
                    <Card className="border-none shadow-md bg-white">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-amber-600 flex items-center gap-2">
                                <Lightbulb className="w-5 h-5" /> Concepto Clave
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                                {haData.conceptoClave || "Sin concepto definido."}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Resultado Esperado */}
                    <Card className="border-none shadow-md bg-white">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-green-600 flex items-center gap-2">
                                <Target className="w-5 h-5" /> Resultado Esperado
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                                {haData.resultadoEsperado || "Sin resultado definido."}
                            </p>
                            <div className="mt-4 flex gap-2">
                                <Badge variant="secondary">Logrado</Badge>
                                <Badge variant="outline" className="opacity-50">En proceso</Badge>
                                <Badge variant="outline" className="opacity-50">No logrado</Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Pasos Guiados */}
                <Card className="border-none shadow-md overflow-hidden">
                    <div className="bg-blue-50/50 p-4 border-b border-blue-100 flex items-center gap-2">
                        <ListTodo className="w-5 h-5 text-blue-600" />
                        <h3 className="font-bold text-blue-800">Pasos Guiados</h3>
                    </div>
                    <CardContent className="p-0">
                        <div className="divide-y divide-slate-100">
                            {pasosGuiados.map((item: any, i: number) => (
                                <div key={i} className="p-4 flex items-start gap-3 hover:bg-slate-50 transition-colors">
                                    <div className="mt-1">
                                        <Circle className="w-4 h-4 text-slate-300" />
                                    </div>
                                    <p className="text-slate-700">{item.paso}</p>
                                </div>
                            ))}
                            {pasosGuiados.length === 0 && (
                                <p className="p-6 text-center text-slate-400 italic">No hay pasos guiados.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Evidencia */}
                <Card className="border-none shadow-md bg-slate-50 border-2 border-dashed border-slate-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-slate-700">
                            <FileText className="w-5 h-5" /> Evidencia Requerida
                        </CardTitle>
                        <CardDescription>Sube tu evidencia para completar este hito</CardDescription>
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

                        {/* Placeholder upload button - Actual upload would go here */}
                        <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-white hover:bg-slate-50 transition-colors cursor-pointer">
                            <FileText className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                            <p className="text-sm font-medium text-slate-600">Click para subir evidencia</p>
                            <p className="text-xs text-slate-400 mt-1">Soporta: {evidenciaTipos.join(", ")}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Pregunta Reflexión */}
                <Card className="bg-indigo-50 border-none shadow-sm">
                    <CardContent className="p-6 flex gap-4">
                        <MessageSquare className="w-8 h-8 text-indigo-400 flex-shrink-0" />
                        <div className="space-y-2">
                            <h4 className="font-bold text-indigo-900">Pregunta de Reflexión</h4>
                            <p className="text-indigo-800 text-lg font-medium italic">
                                "{haData.preguntaReflexion}"
                            </p>
                            <textarea
                                className="w-full mt-4 p-3 rounded-lg border-indigo-200 focus:border-indigo-400 focus:ring-indigo-400 min-h-[100px]"
                                placeholder="Escribe tu reflexión aquí..."
                            ></textarea>
                        </div>
                    </CardContent>
                </Card>

                {/* Dynamic Sections */}
                {seccionesDinamicas.map((section: any, idx: number) => (
                    <Card key={idx} className="border-none shadow-md">
                        <CardHeader className="pb-2 border-b border-slate-100">
                            <CardTitle className="text-slate-800 flex items-center gap-2">
                                {section.tipo === 'checklist' ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <FileText className="w-5 h-5 text-blue-500" />}
                                {section.titulo}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            {section.tipo === 'texto' ? (
                                <p className="text-slate-700 whitespace-pre-line leading-relaxed">{section.contenido}</p>
                            ) : (
                                <div className="space-y-2">
                                    {(section.contenido || []).map((item: any, i: number) => (
                                        <div key={i} className="flex items-start gap-3">
                                            <div className="mt-1">
                                                <input type="checkbox" className="w-4 h-4 rounded text-blue-600 border-slate-300" />
                                            </div>
                                            <span className="text-slate-700">{item.texto}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}

            </div>
        </ScrollArea>
    );
}
