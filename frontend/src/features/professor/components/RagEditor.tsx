
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
import { professorApi } from "@/features/professor/services/professor.api";
import { toast } from "@/hooks/use-toast";

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
        porcentajeAporte: 0,
        competenciasTecnicas: "", // Stored as simple text for now, could be JSON
        competenciasBlandas: ""
    });

    // Dynamic Lists
    const [contenidoClave, setContenidoClave] = useState<{ titulo: string, descripcion: string }[]>([
        { titulo: "", descripcion: "" }
    ]);
    const [pasosGuiados, setPasosGuiados] = useState<{ paso: string }[]>([
        { paso: "" }
    ]);
    const [pistas, setPistas] = useState<string[]>([""]);

    useEffect(() => {
        if (initialData) {
            setFormData({ ...initialData });
            if (initialData.contenidoClave) setContenidoClave(JSON.parse(initialData.contenidoClave));
            if (initialData.pasosGuiados) setPasosGuiados(JSON.parse(initialData.pasosGuiados));
            if (initialData.pistas) setPistas(JSON.parse(initialData.pistas));
        }
    }, [initialData]);

    const handleSave = async () => {
        try {
            const payload = {
                ...formData,
                nivelId: levelId,
                contenidoClave: JSON.stringify(contenidoClave),
                pasosGuiados: JSON.stringify(pasosGuiados),
                pistas: JSON.stringify(pistas)
            };

            await professorApi.saveRagTemplate(levelId, payload);
            toast({ title: "Plantilla RAG Guardada", description: "La guía de aprendizaje se ha actualizado correctamente." });
            onClose();
        } catch (e) {
            toast({ title: "Error", description: "No se pudo guardar la plantilla", variant: "destructive" });
        }
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

                    {/* Sección 3: Contenido Clave */}
                    <Card className="border-none shadow-md">
                        <CardHeader className="bg-amber-50/50 rounded-t-xl border-b border-amber-100">
                            <CardTitle className="text-amber-800 flex items-center gap-2">
                                <FileText className="w-5 h-5" /> 3. Contenido Clave (Micro-Aprendizaje)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-6">
                            {contenidoClave.map((item, index) => (
                                <div key={index} className="flex gap-4 items-start p-4 bg-slate-50 rounded-lg border border-slate-100">
                                    <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0 font-bold">
                                        {index + 1}
                                    </div>
                                    <div className="flex-1 space-y-3">
                                        <Input
                                            placeholder="Título del Concepto"
                                            className="font-semibold"
                                            value={item.titulo}
                                            onChange={(e) => {
                                                const newItems = [...contenidoClave];
                                                newItems[index].titulo = e.target.value;
                                                setContenidoClave(newItems);
                                            }}
                                        />
                                        <Textarea
                                            placeholder="Descripción breve..."
                                            value={item.descripcion}
                                            onChange={(e) => {
                                                const newItems = [...contenidoClave];
                                                newItems[index].descripcion = e.target.value;
                                                setContenidoClave(newItems);
                                            }}
                                        />
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-red-400 hover:text-red-600"
                                        onClick={() => setContenidoClave(contenidoClave.filter((_, i) => i !== index))}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                            <Button
                                variant="outline"
                                className="w-full border-dashed border-2 text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50"
                                onClick={() => setContenidoClave([...contenidoClave, { titulo: "", descripcion: "" }])}
                            >
                                <Plus className="w-4 h-4 mr-2" /> Agregar Concepto Clave
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Sección 4: Actividad Autónoma */}
                    <Card className="border-none shadow-md">
                        <CardHeader className="bg-green-50/50 rounded-t-xl border-b border-green-100">
                            <CardTitle className="text-green-800 flex items-center gap-2">
                                <Award className="w-5 h-5" /> 4. Actividad Autónoma Guiada
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
                                {pasosGuiados.map((item, index) => (
                                    <div key={index} className="flex gap-2 items-center">
                                        <CheckCircle className="w-5 h-5 text-slate-300" />
                                        <Input
                                            value={item.paso}
                                            onChange={(e) => {
                                                const newItems = [...pasosGuiados];
                                                newItems[index].paso = e.target.value;
                                                setPasosGuiados(newItems);
                                            }}
                                            placeholder={`Paso ${index + 1}`}
                                        />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-slate-400 hover:text-red-500"
                                            onClick={() => setPasosGuiados(pasosGuiados.filter((_, i) => i !== index))}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    className="mt-2"
                                    onClick={() => setPasosGuiados([...pasosGuiados, { paso: "" }])}
                                >
                                    <Plus className="w-4 h-4 mr-2" /> Agregar Paso
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Botón Flotante para Guardar en Móvil */}
                    <div className="md:hidden fixed bottom-6 right-6">
                        <Button size="lg" className="rounded-full shadow-xl bg-blue-600 h-14 w-14 p-0" onClick={handleSave}>
                            <Save className="w-6 h-6" />
                        </Button>
                    </div>

                </div>
            </ScrollArea>
        </div>
    );
}
