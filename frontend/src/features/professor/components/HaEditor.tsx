
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, Save, ArrowLeft, CheckCircle, FileText, Target, Milestone, ListTodo, MessageSquare } from "lucide-react";
import professorApi from "@/features/professor/services/professor.api";
import { toast } from "@/hooks/use-toast";
import { ImagePickerModal } from "./ImagePickerModal";
import { Image as ImageIcon, Camera } from "lucide-react";

interface HaEditorProps {
    levelId: number;
    moduleId: number;
    initialData?: any;
    onClose: () => void;
}

interface DynamicSection {
    id: string;
    titulo: string;
    tipo: 'texto' | 'checklist';
    contenido: string | { texto: string, completado: boolean }[];
}

export default function HaEditor({ levelId, moduleId, initialData, onClose }: HaEditorProps) {
    const [formData, setFormData] = useState({
        fase: "",
        objetivoSemana: "",
        conceptoClave: "",
        resultadoEsperado: "",
        evidenciaDescripcion: "",
        preguntaReflexion: "",
        evidenciaTipos: [] as string[] // Checkbox list
    });

    const [pasosGuiados, setPasosGuiados] = useState<{ paso: string }[]>([{ paso: "" }]);

    // Dynamic Sections State
    const [dynamicSections, setDynamicSections] = useState<DynamicSection[]>([]);

    const [loading, setLoading] = useState(false);

    // Image Picker State
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [pickerTarget, setPickerTarget] = useState<{ type: 'step' | 'clave' | 'general', index?: number } | null>(null);

    // Initial Data Load
    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                evidenciaTipos: typeof initialData.evidenciaTipos === 'string'
                    ? JSON.parse(initialData.evidenciaTipos)
                    : initialData.evidenciaTipos || []
            });

            if (initialData.pasosGuiados) {
                try {
                    setPasosGuiados(typeof initialData.pasosGuiados === 'string'
                        ? JSON.parse(initialData.pasosGuiados)
                        : initialData.pasosGuiados);
                } catch (e) { console.error(e); }
            }

            if (initialData.seccionesDinamicas) {
                try {
                    setDynamicSections(typeof initialData.seccionesDinamicas === 'string'
                        ? JSON.parse(initialData.seccionesDinamicas)
                        : initialData.seccionesDinamicas);
                } catch (e) { console.error(e); }
            }
        }
    }, [initialData]);

    const handleSave = async () => {
        setLoading(true);
        try {
            const payload = {
                ...formData,
                nivelId: levelId,
                pasosGuiados: JSON.stringify(pasosGuiados),
                evidenciaTipos: JSON.stringify(formData.evidenciaTipos),
                seccionesDinamicas: JSON.stringify(dynamicSections)
            };

            await professorApi.saveHaTemplate(levelId, payload);
            toast({ title: "Plantilla HA guardada exitosamente" });
            if (onClose) onClose();
        } catch (error) {
            toast({ title: "Error al guardar", description: "No se pudo guardar la plantilla HA", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const toggleEvidenciaType = (type: string) => {
        const current = formData.evidenciaTipos;
        if (current.includes(type)) {
            setFormData({ ...formData, evidenciaTipos: current.filter(t => t !== type) });
        } else {
            setFormData({ ...formData, evidenciaTipos: [...current, type] });
        }
    };

    // Dynamic Section Handlers
    const addDynamicSection = (tipo: 'texto' | 'checklist') => {
        const newSection: DynamicSection = {
            id: Date.now().toString(),
            titulo: "Nueva Sección",
            tipo,
            contenido: tipo === 'texto' ? "" : [{ texto: "", completado: false }]
        };
        setDynamicSections([...dynamicSections, newSection]);
    };

    const updateDynamicSection = (id: string, updates: Partial<DynamicSection>) => {
        setDynamicSections(dynamicSections.map(s => s.id === id ? { ...s, ...updates } : s));
    };

    const removeDynamicSection = (id: string) => {
        setDynamicSections(dynamicSections.filter(s => s.id !== id));
    };

    const handleImageSelect = (url: string) => {
        if (!pickerTarget) return;

        if (pickerTarget.type === 'clave') {
            setFormData({ ...formData, ...({ conceptoClaveImagen: url } as any) });
        } else if (pickerTarget.type === 'step' && pickerTarget.index !== undefined) {
            const newSteps = [...pasosGuiados];
            (newSteps[pickerTarget.index] as any).imagenUrl = url;
            setPasosGuiados(newSteps);
        }
    };

    const openPicker = (type: 'step' | 'clave' | 'general', index?: number) => {
        setPickerTarget({ type, index });
        setIsPickerOpen(true);
    };

    return (
        <div className="fixed inset-0 bg-slate-50 z-50 flex flex-col overflow-hidden animate-in fade-in duration-300">
            {/* Header */}
            <header className="bg-white border-b px-6 py-4 flex items-center justify-between shadow-sm flex-shrink-0">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-slate-100">
                        <ArrowLeft className="w-5 h-5 text-slate-600" />
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <Milestone className="w-5 h-5 text-cyan-600" />
                            Editor HA (Hito de Aprendizaje)
                        </h1>
                        <p className="text-xs text-slate-500">Plantilla Oficial • Nivel {levelId}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={onClose}>Cancelar</Button>
                    <Button onClick={handleSave} className="bg-cyan-600 hover:bg-cyan-700 gap-2">
                        <Save className="w-4 h-4" /> Guardar HA
                    </Button>
                </div>
            </header>

            <ScrollArea className="flex-1 p-6">
                <div className="max-w-4xl mx-auto space-y-8 pb-20">

                    {/* 1. Fase */}
                    <Card className="border-none shadow-md">
                        <CardHeader className="bg-slate-100/50 rounded-t-xl border-b border-slate-200">
                            <CardTitle className="text-slate-800 flex items-center gap-2">
                                <Target className="w-5 h-5" /> Fase & Objetivo
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            <div className="space-y-2">
                                <Label>Fase (1️⃣)</Label>
                                <Input
                                    value={formData.fase}
                                    onChange={e => setFormData({ ...formData, fase: e.target.value })}
                                    placeholder="Ej. Inmersión"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Objetivo de la semana (1️⃣)</Label>
                                <Textarea
                                    value={formData.objetivoSemana}
                                    onChange={e => setFormData({ ...formData, objetivoSemana: e.target.value })}
                                    placeholder="Objetivo principal..."
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* 2. Concepto Clave */}
                    <Card className="border-none shadow-md">
                        <CardHeader className="bg-amber-50/50 rounded-t-xl border-b border-amber-100">
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-amber-800 flex items-center gap-2">
                                    <FileText className="w-5 h-5" /> 2️⃣ Concepto Clave
                                </CardTitle>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openPicker('clave')}
                                    className={(formData as any).conceptoClaveImagen ? "text-blue-600 border-blue-200" : ""}
                                >
                                    <ImageIcon className="w-4 h-4 mr-2" />
                                    {(formData as any).conceptoClaveImagen ? "Cambiar Imagen" : "Agregar Imagen"}
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <Textarea
                                value={formData.conceptoClave}
                                onChange={e => setFormData({ ...formData, conceptoClave: e.target.value })}
                                className="min-h-[100px]"
                                placeholder="Explica el concepto clave..."
                            />
                            {(formData as any).conceptoClaveImagen && (
                                <div className="relative w-full max-w-sm aspect-video rounded-lg overflow-hidden border">
                                    <img src={(formData as any).conceptoClaveImagen} className="w-full h-full object-cover" />
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-2 right-2 h-8 w-8"
                                        onClick={() => setFormData({ ...formData, ...({ conceptoClaveImagen: undefined } as any) })}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* 3. Pasos Guiados */}
                    <Card className="border-none shadow-md">
                        <CardHeader className="bg-blue-50/50 rounded-t-xl border-b border-blue-100">
                            <CardTitle className="text-blue-800 flex items-center gap-2">
                                <ListTodo className="w-5 h-5" /> 3️⃣ Pasos Guiados (Checklist)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-3">
                            {pasosGuiados.map((item, index) => (
                                <div key={index} className="flex flex-col gap-2 p-3 bg-slate-50 rounded-lg border">
                                    <div className="flex gap-2 items-center">
                                        <input type="checkbox" disabled className="w-4 h-4 rounded text-blue-500" />
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
                                            variant="outline"
                                            size="icon"
                                            className={(item as any).imagenUrl ? "text-blue-600 border-blue-200" : "text-slate-400"}
                                            onClick={() => openPicker('step', index)}
                                        >
                                            <ImageIcon className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => setPasosGuiados(pasosGuiados.filter((_, i) => i !== index))}>
                                            <Trash2 className="w-4 h-4 text-slate-400" />
                                        </Button>
                                    </div>
                                    {(item as any).imagenUrl && (
                                        <div className="relative w-40 aspect-video rounded border bg-white overflow-hidden ml-6">
                                            <img src={(item as any).imagenUrl} className="w-full h-full object-cover" />
                                            <button
                                                className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-bl"
                                                onClick={() => {
                                                    const n = [...pasosGuiados];
                                                    delete (n[index] as any).imagenUrl;
                                                    setPasosGuiados(n);
                                                }}
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                            <Button size="sm" variant="outline" onClick={() => setPasosGuiados([...pasosGuiados, { paso: "" }])}>
                                <Plus className="w-4 h-4 mr-2" /> Agregar Paso
                            </Button>
                        </CardContent>
                    </Card>

                    {/* 4. Resultado Esperado */}
                    <Card className="border-none shadow-md">
                        <CardHeader className="bg-green-50/50 rounded-t-xl border-b border-green-100">
                            <CardTitle className="text-green-800 flex items-center gap-2">
                                <Target className="w-5 h-5" /> 4️⃣ Resultado Esperado
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <Label className="mb-2 block">Descripción del Resultado</Label>
                            <Textarea
                                value={formData.resultadoEsperado}
                                onChange={e => setFormData({ ...formData, resultadoEsperado: e.target.value })}
                                placeholder="Qué se espera que logre el estudiante..."
                            />
                            <div className="mt-4 p-4 bg-slate-50 rounded border text-sm text-slate-500">
                                ℹ️ El estudiante verá opciones de estado: "Logrado", "En proceso", "No logrado"
                            </div>
                        </CardContent>
                    </Card>

                    {/* 5. Evidencia */}
                    <Card className="border-none shadow-md">
                        <CardHeader className="bg-purple-50/50 rounded-t-xl border-b border-purple-100">
                            <CardTitle className="text-purple-800 flex items-center gap-2">
                                <FileText className="w-5 h-5" /> 5️⃣ Evidencia a subir
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div className="flex flex-wrap gap-4">
                                {['Imagen', 'Video', 'Archivo', 'Enlace'].map(type => (
                                    <div key={type} className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id={`ev-${type}`}
                                            checked={formData.evidenciaTipos.includes(type)}
                                            onChange={() => toggleEvidenciaType(type)}
                                            className="w-4 h-4 rounded text-purple-600"
                                        />
                                        <Label htmlFor={`ev-${type}`}>{type}</Label>
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-2">
                                <Label>Descripción de la evidencia</Label>
                                <Textarea
                                    value={formData.evidenciaDescripcion}
                                    onChange={e => setFormData({ ...formData, evidenciaDescripcion: e.target.value })}
                                    placeholder="Instrucciones para la evidencia..."
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* 6. Pregunta Reflexión */}
                    <Card className="border-none shadow-md">
                        <CardHeader className="bg-indigo-50/50 rounded-t-xl border-b border-indigo-100">
                            <CardTitle className="text-indigo-800 flex items-center gap-2">
                                <MessageSquare className="w-5 h-5" /> 6️⃣ Pregunta de Reflexión
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <Textarea
                                value={formData.preguntaReflexion}
                                onChange={e => setFormData({ ...formData, preguntaReflexion: e.target.value })}
                                placeholder="Escribe la pregunta para el estudiante..."
                            />
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
