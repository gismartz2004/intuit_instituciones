
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, Save, ArrowLeft, CheckCircle, FileText, Target, Brain, Award } from "lucide-react";
import professorApi from "@/features/professor/services/professor.api";
import { toast } from "@/hooks/use-toast";
import { ImagePickerModal } from "./ImagePickerModal";
import { Image as ImageIcon, Camera } from "lucide-react";

interface RagEditorProps {
    levelId: number;
    moduleId: number;
    initialData?: any;
    onClose: () => void;
}

export default function RagEditor({ levelId, moduleId, initialData, onClose }: RagEditorProps) {
    const [formData, setFormData] = useState({
        programa: "",
        modulo: "",
        hitoAprendizaje: "",
        mes: "",
        semana: "",
        tipoRag: "Técnica",
        modalidad: "Autónoma",
        duracionEstimada: "",
        proposito: "",
        objetivoAprendizaje: "",
        nombreActividad: "",
        descripcionDesafio: "",
        tipoEvidencia: "",
        cantidadEvidencias: 1,
        competenciasTecnicas: "", // Will store as "Técnica 1\nTécnica 2"
        competenciasBlandas: "",
        porcentajeAporte: 0,

        // New Fields
        actualizaRadar: false,
        regularizaAsistencia: false,

        criterioEvidencia: false,
        criterioPasos: false,
        criterioTiempo: false
    });

    // Dynamic Lists
    const [keyConcepts, setKeyConcepts] = useState<{ titulo: string, descripcion: string }[]>([
        { titulo: "", descripcion: "" }
    ]);
    const [guidedSteps, setGuidedSteps] = useState<{ paso: string }[]>([
        { paso: "" }
    ]);
    const [hints, setHints] = useState<string[]>([""]);

    // Dynamic Sections State
    const [dynamicSections, setDynamicSections] = useState<any[]>([]); // { id, titulo, tipo, contenido }

    const [loading, setLoading] = useState(false);

    // Image Picker State
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [pickerTarget, setPickerTarget] = useState<{ type: 'step' | 'concept' | 'general', index?: number } | null>(null);

    // Initial Data Load
    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                // Ensure defaults for booleans if missing
                actualizaRadar: initialData.actualizaRadar || false,
                regularizaAsistencia: initialData.regularizaAsistencia || false,
                criterioEvidencia: initialData.criterioEvidencia || false,
                criterioPasos: initialData.criterioPasos || false,
                criterioTiempo: initialData.criterioTiempo || false,
            });
            if (initialData.contenidoClave) {
                try {
                    setKeyConcepts(typeof initialData.contenidoClave === 'string' ? JSON.parse(initialData.contenidoClave) : initialData.contenidoClave);
                } catch (e) { console.error("Error parsing content", e); }
            }
            if (initialData.pasosGuiados) {
                try {
                    setGuidedSteps(typeof initialData.pasosGuiados === 'string' ? JSON.parse(initialData.pasosGuiados) : initialData.pasosGuiados);
                } catch (e) {
                    // Handle simple text if legacy
                    console.error("Error parsing steps", e);
                }
            }
            if (initialData.pistas) {
                try {
                    setHints(typeof initialData.pistas === 'string' ? JSON.parse(initialData.pistas) : initialData.pistas);
                } catch (e) { console.error("Error parsing hints", e); }
            }
            if (initialData.seccionesDinamicas) {
                try {
                    setDynamicSections(typeof initialData.seccionesDinamicas === 'string' ? JSON.parse(initialData.seccionesDinamicas) : initialData.seccionesDinamicas);
                } catch (e) { console.error("Error parsing dynamic sections", e); }
            }
        }
    }, [initialData]);

    const handleSave = async () => {
        setLoading(true);
        try {
            const payload = {
                ...formData,
                fechaCreacion: null,
                nivelId: levelId,
                contenidoClave: JSON.stringify(keyConcepts),
                pasosGuiados: JSON.stringify(guidedSteps),
                pistas: JSON.stringify(hints),
                seccionesDinamicas: JSON.stringify(dynamicSections)
            };
            console.log("Saving RAG with payload:", payload);
            await professorApi.saveRagTemplate(levelId, payload);
            toast({ title: "Plantilla RAG guardada exitosamente" });
            if (onClose) onClose();
        } catch (error) {
            toast({ title: "Error al guardar", description: "No se pudo guardar la plantilla", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    // Dynamic Section Handlers
    const addDynamicSection = (tipo: 'texto' | 'checklist') => {
        const newSection = {
            id: Date.now().toString(),
            titulo: "Nueva Sección",
            tipo,
            contenido: tipo === 'texto' ? "" : [{ texto: "", completado: false }]
        };
        setDynamicSections([...dynamicSections, newSection]);
    };

    const updateDynamicSection = (id: string, updates: any) => {
        setDynamicSections(dynamicSections.map(s => s.id === id ? { ...s, ...updates } : s));
    };

    const removeDynamicSection = (id: string) => {
        setDynamicSections(dynamicSections.filter(s => s.id !== id));
    };

    const handleImageSelect = (url: string) => {
        if (!pickerTarget) return;

        if (pickerTarget.type === 'concept' && pickerTarget.index !== undefined) {
            const newConcepts = [...keyConcepts];
            newConcepts[pickerTarget.index].imagenUrl = url;
            setKeyConcepts(newConcepts);
        } else if (pickerTarget.type === 'step' && pickerTarget.index !== undefined) {
            const newSteps = [...guidedSteps];
            (newSteps[pickerTarget.index] as any).imagenUrl = url;
            setGuidedSteps(newSteps);
        } else if (pickerTarget.type === 'general') {
            setFormData({ ...formData, ...({ imagenUrl: url } as any) });
        }
    };

    const openPicker = (type: 'step' | 'concept' | 'general', index?: number) => {
        setPickerTarget({ type, index });
        setIsPickerOpen(true);
    };

    return (
        <div className="fixed inset-0 bg-slate-50 z-50 flex flex-col overflow-hidden animate-in fade-in duration-300">
            {/* Header Toolbar */}
            <header className="bg-white border-b px-6 py-4 flex items-center justify-between shadow-sm flex-shrink-0">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-slate-100">
                        <ArrowLeft className="w-5 h-5 text-slate-600" />
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-600" />
                            Editor de Plantilla RAG
                        </h1>
                        <p className="text-xs text-slate-500">Recuperación Autónoma Guiada • Nivel {levelId}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={onClose}>Cancelar</Button>
                    <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 gap-2">
                        <Save className="w-4 h-4" /> Guardar RAG
                    </Button>
                </div>
            </header>

            {/* Main Scrollable Content */}
            <ScrollArea className="flex-1 p-6">
                <div className="max-w-5xl mx-auto space-y-8 pb-20">

                    {/* Sección 1: Identificación */}
                    <Card className="border-none shadow-md">
                        <CardHeader className="bg-blue-50/50 rounded-t-xl border-b border-blue-100">
                            <CardTitle className="text-blue-800 flex items-center gap-2">
                                <Target className="w-5 h-5" /> 1. Identificación General
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                            <div className="space-y-2">
                                <Label>Programa</Label>
                                <Input value={formData.programa} onChange={e => setFormData({ ...formData, programa: e.target.value })} placeholder="Ej. Desarrollo Web Fullstack" />
                            </div>
                            <div className="space-y-2">
                                <Label>Módulo</Label>
                                <Input value={formData.modulo} onChange={e => setFormData({ ...formData, modulo: e.target.value })} placeholder="Ej. Frontend React" />
                            </div>
                            <div className="space-y-2">
                                <Label>Hito de Aprendizaje</Label>
                                <Input value={formData.hitoAprendizaje} onChange={e => setFormData({ ...formData, hitoAprendizaje: e.target.value })} placeholder="Ej. Creación de Componentes" />
                            </div>
                            <div className="space-y-2">
                                <Label>Mes</Label>
                                <Input value={formData.mes} onChange={e => setFormData({ ...formData, mes: e.target.value })} placeholder="Ej. Octubre" />
                            </div>
                            <div className="space-y-2">
                                <Label>Semana</Label>
                                <Input value={formData.semana} onChange={e => setFormData({ ...formData, semana: e.target.value })} placeholder="Ej. Semana 3" />
                            </div>
                            <div className="space-y-2">
                                <Label>Duración Estimada</Label>
                                <Input value={formData.duracionEstimada} onChange={e => setFormData({ ...formData, duracionEstimada: e.target.value })} placeholder="Ej. 2 Horas" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Sección 2: Propósito y Objetivos */}
                    <Card className="border-none shadow-md">
                        <CardHeader className="bg-purple-50/50 rounded-t-xl border-b border-purple-100">
                            <CardTitle className="text-purple-800 flex items-center gap-2">
                                <Brain className="w-5 h-5" /> 2. Propósito y Objetivos
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            <div className="space-y-2">
                                <Label>Propósito (Visible para estudiante)</Label>
                                <Textarea
                                    className="min-h-[80px]"
                                    value={formData.proposito}
                                    onChange={e => setFormData({ ...formData, proposito: e.target.value })}
                                    placeholder="Describe por qué es importante este aprendizaje..."
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Objetivo de Aprendizaje (Semana)</Label>
                                <Textarea
                                    className="min-h-[80px]"
                                    value={formData.objetivoAprendizaje}
                                    onChange={e => setFormData({ ...formData, objetivoAprendizaje: e.target.value })}
                                    placeholder="Al finalizar la sesión, el estudiante será capaz de..."
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Sección 3: Contenido Clave (Micro-Aprendizaje) */}
                    <Card className="border-none shadow-md">
                        <CardHeader className="bg-amber-50/50 rounded-t-xl border-b border-amber-100">
                            <CardTitle className="text-amber-800 flex items-center gap-2">
                                <FileText className="w-5 h-5" /> 4. Contenido Clave (Micro-Aprendizaje)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-6">
                            {keyConcepts.map((item, index) => (
                                <div key={index} className="flex gap-4 items-start p-4 bg-slate-50 rounded-lg border border-slate-100">
                                    <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0 font-bold">
                                        {index + 1}
                                    </div>
                                    <div className="flex-1 space-y-3">
                                        <div className="flex gap-3">
                                            <Input
                                                placeholder="Título del Concepto"
                                                className="font-semibold flex-1"
                                                value={item.titulo}
                                                onChange={(e) => {
                                                    const newItems = [...keyConcepts];
                                                    newItems[index].titulo = e.target.value;
                                                    setKeyConcepts(newItems);
                                                }}
                                            />
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className={item.imagenUrl ? "text-blue-600 border-blue-200" : "text-slate-500"}
                                                onClick={() => openPicker('concept', index)}
                                            >
                                                <Camera className="w-4 h-4 mr-2" />
                                                {item.imagenUrl ? "Imagen OK" : "Imagen"}
                                            </Button>
                                        </div>
                                        <Textarea
                                            placeholder="Descripción breve..."
                                            value={item.descripcion}
                                            onChange={(e) => {
                                                const newItems = [...keyConcepts];
                                                newItems[index].descripcion = e.target.value;
                                                setKeyConcepts(newItems);
                                            }}
                                        />
                                        {item.imagenUrl && (
                                            <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-slate-200 bg-white">
                                                <img src={item.imagenUrl} className="w-full h-full object-cover" />
                                                <button
                                                    className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-bl-lg"
                                                    onClick={() => {
                                                        const n = [...keyConcepts];
                                                        delete n[index].imagenUrl;
                                                        setKeyConcepts(n);
                                                    }}
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-red-400 hover:text-red-600"
                                        onClick={() => setKeyConcepts(keyConcepts.filter((_, i) => i !== index))}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                            <Button
                                variant="outline"
                                className="w-full border-dashed border-2 text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50"
                                onClick={() => setKeyConcepts([...keyConcepts, { titulo: "", descripcion: "" }])}
                            >
                                <Plus className="w-4 h-4 mr-2" /> Agregar Concepto Clave
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Sección 4: Actividad Autónoma */}
                    <Card className="border-none shadow-md">
                        <CardHeader className="bg-green-50/50 rounded-t-xl border-b border-green-100">
                            <CardTitle className="text-green-800 flex items-center gap-2">
                                <Award className="w-5 h-5" /> 5. Actividad Autónoma Guiada
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Nombre de la Actividad</Label>
                                    <Input
                                        value={formData.nombreActividad}
                                        onChange={e => setFormData({ ...formData, nombreActividad: e.target.value })}
                                        placeholder="Ej. Taller Práctico #1"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Descripción del Desafío</Label>
                                    <Input
                                        value={formData.descripcionDesafio}
                                        onChange={e => setFormData({ ...formData, descripcionDesafio: e.target.value })}
                                        placeholder="Breve reseña de lo que deben lograr"
                                    />
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-3">
                                <Label>Pasos Guiados (Checklist)</Label>
                                {guidedSteps.map((item, index) => (
                                    <div key={index} className="flex gap-2 items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                                        <div className="flex flex-col items-center gap-2 mr-2">
                                            <CheckCircle className="w-5 h-5 text-slate-300" />
                                            <input
                                                type="checkbox"
                                                title="Requiere Entregable"
                                                checked={(item as any).requiereEntregable || false}
                                                onChange={(e) => {
                                                    const ns = [...guidedSteps];
                                                    (ns[index] as any).requiereEntregable = e.target.checked;
                                                    setGuidedSteps(ns);
                                                }}
                                                className="w-4 h-4 text-blue-600"
                                            />
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <div className="flex gap-2">
                                                <Input
                                                    value={item.paso}
                                                    onChange={(e) => {
                                                        const newItems = [...guidedSteps];
                                                        newItems[index].paso = e.target.value;
                                                        setGuidedSteps(newItems);
                                                    }}
                                                    placeholder={`Paso ${index + 1}`}
                                                    className="flex-1"
                                                />
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    title="Agregar Imagen"
                                                    className={(item as any).imagenUrl ? "text-blue-600 border-blue-200" : "text-slate-400"}
                                                    onClick={() => openPicker('step', index)}
                                                >
                                                    <ImageIcon className="w-4 h-4" />
                                                </Button>
                                            </div>
                                            {(item as any).imagenUrl && (
                                                <div className="relative w-20 h-20 rounded border bg-white overflow-hidden">
                                                    <img src={(item as any).imagenUrl} className="w-full h-full object-cover" />
                                                    <button
                                                        className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-bl"
                                                        onClick={() => {
                                                            const n = [...guidedSteps];
                                                            delete (n[index] as any).imagenUrl;
                                                            setGuidedSteps(n);
                                                        }}
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-slate-400 hover:text-red-500"
                                            onClick={() => setGuidedSteps(guidedSteps.filter((_, i) => i !== index))}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    className="mt-2"
                                    onClick={() => setGuidedSteps([...guidedSteps, { paso: "" }])}
                                >
                                    <Plus className="w-4 h-4 mr-2" /> Agregar Paso
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 6. AYUDAS PROGRESIVAS */}
                    <Card className="border-none shadow-md">
                        <CardHeader className="bg-indigo-50/50 rounded-t-xl border-b border-indigo-100">
                            <CardTitle className="text-indigo-800 flex items-center gap-2">
                                <Brain className="w-5 h-5" /> 6. Ayudas Progresivas (Opcional)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-6">
                            {hints.map((hint, index) => (
                                <div key={index} className="flex gap-2 items-center">
                                    <span className="text-sm font-bold text-indigo-400 w-6">#{index + 1}</span>
                                    <Input
                                        value={hint}
                                        onChange={(e) => {
                                            const newHints = [...hints];
                                            newHints[index] = e.target.value;
                                            setHints(newHints);
                                        }}
                                        placeholder={`Pista ${index + 1} para desbloquear`}
                                    />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setHints(hints.filter((_, i) => i !== index))}
                                    >
                                        <Trash2 className="w-4 h-4 text-slate-400" />
                                    </Button>
                                </div>
                            ))}
                            <Button
                                size="sm"
                                variant="outline"
                                className="mt-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                                onClick={() => setHints([...hints, ""])}
                            >
                                <Plus className="w-4 h-4 mr-2" /> Agregar Pista
                            </Button>
                        </CardContent>
                    </Card>

                    {/* 7. EVIDENCIA DE APRENDIZAJE */}
                    <Card className="border-none shadow-md">
                        <CardHeader className="bg-pink-50/50 rounded-t-xl border-b border-pink-100">
                            <CardTitle className="text-pink-800 flex items-center gap-2">
                                <FileText className="w-5 h-5" /> 7. Evidencia de Aprendizaje
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4 pt-6">
                            <div className="space-y-2">
                                <Label>Tipo de evidencia</Label>
                                <select
                                    className="w-full p-2 border rounded-md"
                                    value={formData.tipoEvidencia}
                                    onChange={(e) => setFormData({ ...formData, tipoEvidencia: e.target.value })}
                                >
                                    <option value="">Seleccione...</option>
                                    <option value="Imagen">Imagen</option>
                                    <option value="Video corto">Video corto</option>
                                    <option value="Enlace">Enlace</option>
                                    <option value="Documento">Documento</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label>Cantidad requerida</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    value={formData.cantidadEvidencias}
                                    onChange={(e) => setFormData({ ...formData, cantidadEvidencias: parseInt(e.target.value) })}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* 8. COMPETENCIAS ASOCIADAS */}
                    <Card className="border-none shadow-md">
                        <CardHeader className="bg-cyan-50/50 rounded-t-xl border-b border-cyan-100">
                            <CardTitle className="text-cyan-800 flex items-center gap-2">
                                <Target className="w-5 h-5" /> 8. Competencias Asociadas
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                            <div className="space-y-2">
                                <Label className="text-blue-600">Competencias Técnicas</Label>
                                <Textarea
                                    value={formData.competenciasTecnicas}
                                    onChange={(e) => setFormData({ ...formData, competenciasTecnicas: e.target.value })}
                                    placeholder="Técnica 1&#10;Técnica 2"
                                    rows={4}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-purple-600">Competencias Blandas</Label>
                                <Textarea
                                    value={formData.competenciasBlandas}
                                    onChange={(e) => setFormData({ ...formData, competenciasBlandas: e.target.value })}
                                    placeholder="Blanda 1&#10;Blanda 2"
                                    rows={4}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* 9. IMPACTO AUTOMÁTICO */}
                    <Card className="border-none shadow-md">
                        <CardHeader className="bg-orange-50/50 rounded-t-xl border-b border-orange-100">
                            <CardTitle className="text-orange-800 flex items-center gap-2">
                                <Target className="w-5 h-5" /> 9. Impacto Automático
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                            <div className="space-y-2">
                                <Label>Porcentaje de aporte al Hito</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="number"
                                        min="0" max="100"
                                        value={formData.porcentajeAporte}
                                        onChange={(e) => setFormData({ ...formData, porcentajeAporte: parseInt(e.target.value) })}
                                    />
                                    <span className="text-slate-500">%</span>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2 pt-8">
                                <input
                                    type="checkbox"
                                    id="radar"
                                    className="w-4 h-4 text-blue-600 rounded"
                                    checked={formData.actualizaRadar}
                                    onChange={(e) => setFormData({ ...formData, actualizaRadar: e.target.checked })}
                                />
                                <Label htmlFor="radar" className="font-medium cursor-pointer">Actualiza radar de progreso</Label>
                            </div>
                            <div className="flex items-center space-x-2 pt-8">
                                <input
                                    type="checkbox"
                                    id="asistencia"
                                    className="w-4 h-4 text-blue-600 rounded"
                                    checked={formData.regularizaAsistencia}
                                    onChange={(e) => setFormData({ ...formData, regularizaAsistencia: e.target.checked })}
                                />
                                <Label htmlFor="asistencia" className="font-medium cursor-pointer">Regulariza asistencia</Label>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 10. CRITERIOS DE FINALIZACIÓN */}
                    <Card className="border-none shadow-md">
                        <CardHeader className="bg-red-50/50 rounded-t-xl border-b border-red-100">
                            <CardTitle className="text-red-800 flex items-center gap-2">
                                <CheckCircle className="w-5 h-5" /> 10. Criterios de Finalización
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-6 pt-6">
                            <div className="flex items-center space-x-2 bg-slate-50 p-4 rounded-lg border">
                                <input
                                    type="checkbox"
                                    id="crit_evidencia"
                                    checked={formData.criterioEvidencia}
                                    onChange={(e) => setFormData({ ...formData, criterioEvidencia: e.target.checked })}
                                    className="w-5 h-5 text-green-600 rounded"
                                />
                                <Label htmlFor="crit_evidencia" className="font-medium cursor-pointer">Evidencia subida</Label>
                            </div>
                            <div className="flex items-center space-x-2 bg-slate-50 p-4 rounded-lg border">
                                <input
                                    type="checkbox"
                                    id="crit_pasos"
                                    checked={formData.criterioPasos}
                                    onChange={(e) => setFormData({ ...formData, criterioPasos: e.target.checked })}
                                    className="w-5 h-5 text-green-600 rounded"
                                />
                                <Label htmlFor="crit_pasos" className="font-medium cursor-pointer">Pasos completados</Label>
                            </div>
                            <div className="flex items-center space-x-2 bg-slate-50 p-4 rounded-lg border">
                                <input
                                    type="checkbox"
                                    id="crit_tiempo"
                                    checked={formData.criterioTiempo}
                                    onChange={(e) => setFormData({ ...formData, criterioTiempo: e.target.checked })}
                                    className="w-5 h-5 text-green-600 rounded"
                                />
                                <Label htmlFor="crit_tiempo" className="font-medium cursor-pointer">Tiempo mínimo cumplido</Label>
                            </div>
                        </CardContent>
                    </Card>

                    {/* SECCIONES DINÁMICAS */}
                    {dynamicSections.map((section, index) => (
                        <Card key={section.id} className="border-dashed border-2 bg-slate-50/50 animate-in slide-in-from-bottom-5">
                            <CardHeader className="flex flex-row items-center justify-between py-3">
                                <Input
                                    value={section.titulo}
                                    onChange={(e) => updateDynamicSection(section.id, { titulo: e.target.value })}
                                    className="font-bold text-lg bg-transparent border-none shadow-none focus-visible:ring-0 max-w-sm p-0 h-auto"
                                />
                                <Button variant="ghost" size="sm" onClick={() => removeDynamicSection(section.id)} className="text-red-500">
                                    <Trash2 className="w-4 h-4" /> Eliminar Sección
                                </Button>
                            </CardHeader>
                            <CardContent>
                                {section.tipo === 'texto' ? (
                                    <Textarea
                                        value={section.contenido as string}
                                        onChange={(e) => updateDynamicSection(section.id, { contenido: e.target.value })}
                                        placeholder="Contenido de la sección..."
                                        className="bg-white"
                                    />
                                ) : (
                                    <div className="space-y-2">
                                        {(section.contenido as any[]).map((item: any, i: number) => (
                                            <div key={i} className="flex gap-2">
                                                <input type="checkbox" disabled />
                                                <Input
                                                    value={item.texto}
                                                    onChange={(e) => {
                                                        const newContenido = [...(section.contenido as any[])];
                                                        newContenido[i].texto = e.target.value;
                                                        updateDynamicSection(section.id, { contenido: newContenido });
                                                    }}
                                                    className="bg-white"
                                                />
                                                <Button size="icon" variant="ghost" onClick={() => {
                                                    const newContenido = (section.contenido as any[]).filter((_, idx) => idx !== i);
                                                    updateDynamicSection(section.id, { contenido: newContenido });
                                                }}><Trash2 className="w-4 h-4" /></Button>
                                            </div>
                                        ))}
                                        <Button size="sm" variant="outline" onClick={() => {
                                            const newContenido = [...(section.contenido as any[]), { texto: "", completado: false }];
                                            updateDynamicSection(section.id, { contenido: newContenido });
                                        }}>Agregar Item</Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}

                    {/* Add Section Buttons */}
                    <div className="flex gap-4 justify-center py-6 border-t border-slate-200">
                        <Button variant="outline" onClick={() => addDynamicSection('texto')} className="border-dashed">
                            <Plus className="w-4 h-4 mr-2" /> Agregar Sección Texto
                        </Button>
                        <Button variant="outline" onClick={() => addDynamicSection('checklist')} className="border-dashed">
                            <Plus className="w-4 h-4 mr-2" /> Agregar Sección Checklist
                        </Button>
                    </div>

                    {/* Botón Flotante para Guardar en Móvil */}
                    <div className="md:hidden fixed bottom-6 right-6">
                        <Button size="lg" className="rounded-full shadow-xl bg-blue-600 h-14 w-14 p-0" onClick={handleSave}>
                            <Save className="w-6 h-6" />
                        </Button>
                    </div>

                </div>
            </ScrollArea>
            <ImagePickerModal
                isOpen={isPickerOpen}
                onClose={() => setIsPickerOpen(false)}
                onSelect={handleImageSelect}
            />
        </div>
    );
}
