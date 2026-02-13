import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { Save, ArrowLeft, Layers, Eye, Plus, Trash2, CheckCircle2, AlertCircle, Lightbulb, Target, FileText, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import specialistProfessorApi from "../services/specialistProfessor.api";
import { cn } from "@/lib/utils";

export default function ItEditor() {
    const [match, params] = useRoute("/specialist-professor/it/edit/:id");
    const levelId = match && params ? (params as any).id : null;
    const [, setLocation] = useLocation();

    const [loading, setLoading] = useState(true);
    const [activeSection, setActiveSection] = useState(0);

    const [template, setTemplate] = useState<any>({
        // 1. Identificación General
        codigo: "",
        ciclo: 1,
        semana: 1,
        duracionMinutos: 90,
        nivelBloom: "Analizar → Evaluar",
        modalidad: "Práctica guiada / laboratorio",
        productoAporta: "",

        // 2. Propósito Pedagógico
        objetivosDocente: [],

        // 3. Insumos Obligatorios
        insumosRequeridos: [],

        // 4. Concepto Clave
        conceptoClave: "",

        // 5. Ejemplo Modelo
        ejemploSistema: "",
        ejemploVariable: "",
        ejemploCondicion: "",

        // 6. Actividad Principal
        retoIntegracion: "",
        variablePrincipal: "",
        condicionRegla: "",
        decisionSistema: "",

        // 7. Escenario de Prueba
        escenarioPrueba: "",

        // 8. Evidencia
        tipoEvidencia: "",
        criteriosEvidencia: [],

        // 9. Validación
        criteriosValidacion: [],

        // 10. Competencias
        competenciasTecnicas: [],
        competenciasDigitales: [],
        competenciasTransversales: [],

        // 11. Sección Motivacional
        mensajeMotivacional: ""
    });

    const sections = [
        { id: 0, title: "Identificación General", icon: FileText },
        { id: 1, title: "Propósito Pedagógico", icon: Target },
        { id: 2, title: "Insumos Obligatorios", icon: CheckCircle2 },
        { id: 3, title: "Concepto Clave", icon: Lightbulb },
        { id: 4, title: "Ejemplo Modelo", icon: Zap },
        { id: 5, title: "Actividad Principal", icon: Layers },
        { id: 6, title: "Escenario de Prueba", icon: AlertCircle },
        { id: 7, title: "Evidencia de la IT", icon: FileText },
        { id: 8, title: "Validación", icon: CheckCircle2 },
        { id: 9, title: "Competencias", icon: Target },
        { id: 10, title: "Sección Motivacional", icon: Lightbulb }
    ];

    useEffect(() => {
        if (levelId) {
            loadTemplate();
        }
    }, [levelId]);

    const loadTemplate = async () => {
        try {
            setLoading(true);
            const data = await specialistProfessorApi.getItTemplate(parseInt(levelId));
            if (data) {
                // Merge with default template to ensure all arrays exist
                setTemplate((prev: any) => ({
                    ...prev,
                    ...data,
                    // Explicitly ensure arrays are not undefined
                    objetivosDocente: data.objetivosDocente || [],
                    insumosRequeridos: data.insumosRequeridos || [],
                    criteriosEvidencia: data.criteriosEvidencia || [],
                    criteriosValidacion: data.criteriosValidacion || [],
                    competenciasTecnicas: data.competenciasTecnicas || [],
                    competenciasDigitales: data.competenciasDigitales || [],
                    competenciasTransversales: data.competenciasTransversales || []
                }));
            }
        } catch (error) {
            console.error("Error loading IT template", error);
            toast({ title: "Error", description: "No se pudo cargar la plantilla", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            await specialistProfessorApi.saveItTemplate(parseInt(levelId), template);
            toast({ title: "Guardado", description: "Plantilla IT guardada correctamente" });
        } catch (error) {
            toast({ title: "Error", description: "No se pudo guardar la plantilla", variant: "destructive" });
        }
    };

    const addItem = (field: string) => {
        setTemplate({
            ...template,
            [field]: [...(template[field] || []), ""]
        });
    };

    const updateItem = (field: string, index: number, value: string) => {
        const newArray = [...template[field]];
        newArray[index] = value;
        setTemplate({ ...template, [field]: newArray });
    };

    const removeItem = (field: string, index: number) => {
        const newArray = template[field].filter((_: any, i: number) => i !== index);
        setTemplate({ ...template, [field]: newArray });
    };

    if (loading) return <div className="p-8">Cargando editor IT...</div>;

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar Navigation */}
            <div className="w-80 bg-white border-r border-slate-200 flex flex-col sticky top-0 h-screen">
                <div className="p-8 border-b border-slate-100">
                    <Button variant="ghost" className="gap-2 text-slate-500 font-bold mb-4" onClick={() => window.history.back()}>
                        <ArrowLeft className="w-4 h-4" /> Volver
                    </Button>
                    <Badge className="bg-violet-600 mb-2 uppercase text-[9px] font-black">EDITOR IT</Badge>
                    <h1 className="text-xl font-black text-slate-900 leading-tight">Diseño de Iteración</h1>
                </div>

                <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                    {sections.map((section) => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={cn(
                                "w-full text-left px-6 py-4 rounded-xl text-sm font-bold transition-all flex items-center gap-3",
                                activeSection === section.id
                                    ? "bg-violet-50 text-violet-700 shadow-sm border border-violet-100"
                                    : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                            )}
                        >
                            <span className={cn(
                                "w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black",
                                activeSection === section.id ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-400"
                            )}>
                                {section.id + 1}
                            </span>
                            {section.title}
                        </button>
                    ))}
                </nav>

                <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                    <Button onClick={handleSave} className="w-full bg-violet-600 hover:bg-violet-700 h-12 rounded-xl font-bold gap-2 shadow-lg shadow-violet-200">
                        <Save className="w-4 h-4" /> Guardar IT
                    </Button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-12 overflow-y-auto">
                <div className="max-w-4xl mx-auto">
                    <header className="mb-12">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">SECCIÓN {activeSection + 1}</p>
                        <h2 className="text-3xl font-black text-slate-800 tracking-tight">{sections[activeSection].title}</h2>
                    </header>

                    {/* Section 0: Identificación General */}
                    {activeSection === 0 && (
                        <div className="space-y-6">
                            <Card className="rounded-3xl border-slate-200">
                                <CardContent className="p-8 space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-black text-slate-400 uppercase">Código IT</Label>
                                            <Input
                                                placeholder="Ej: IT–01"
                                                value={template.codigo}
                                                onChange={(e) => setTemplate({ ...template, codigo: e.target.value })}
                                                className="rounded-xl h-12"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-black text-slate-400 uppercase">Ciclo</Label>
                                            <Input
                                                type="number"
                                                value={template.ciclo}
                                                onChange={(e) => setTemplate({ ...template, ciclo: parseInt(e.target.value) })}
                                                className="rounded-xl h-12"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-black text-slate-400 uppercase">Semana</Label>
                                            <Input
                                                type="number"
                                                value={template.semana}
                                                onChange={(e) => setTemplate({ ...template, semana: parseInt(e.target.value) })}
                                                className="rounded-xl h-12"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-black text-slate-400 uppercase">Duración (min)</Label>
                                            <Input
                                                type="number"
                                                value={template.duracionMinutos}
                                                onChange={(e) => setTemplate({ ...template, duracionMinutos: parseInt(e.target.value) })}
                                                className="rounded-xl h-12"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-black text-slate-400 uppercase">Nivel Bloom</Label>
                                            <Input
                                                value={template.nivelBloom}
                                                onChange={(e) => setTemplate({ ...template, nivelBloom: e.target.value })}
                                                className="rounded-xl h-12"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black text-slate-400 uppercase">Modalidad</Label>
                                        <Input
                                            value={template.modalidad}
                                            onChange={(e) => setTemplate({ ...template, modalidad: e.target.value })}
                                            className="rounded-xl h-12"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black text-slate-400 uppercase">Producto al que aporta (PIC)</Label>
                                        <Input
                                            placeholder="Ej: PIC – Sistema de Decisión Basado en Datos"
                                            value={template.productoAporta}
                                            onChange={(e) => setTemplate({ ...template, productoAporta: e.target.value })}
                                            className="rounded-xl h-12"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Section 1: Propósito Pedagógico */}
                    {activeSection === 1 && (
                        <div className="space-y-6">
                            <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 flex gap-4">
                                <Lightbulb className="w-6 h-6 text-amber-600 shrink-0" />
                                <div>
                                    <p className="font-bold text-amber-900 mb-1">Para el docente</p>
                                    <p className="text-sm text-amber-700">Define qué debe lograr el estudiante al integrar conocimientos previos.</p>
                                </div>
                            </div>
                            <Card className="rounded-3xl border-slate-200">
                                <CardHeader className="p-6 border-b border-slate-100">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg font-black">Objetivos para guiar al estudiante</CardTitle>
                                        <Button onClick={() => addItem('objetivosDocente')} variant="ghost" size="sm" className="text-violet-600">
                                            <Plus className="w-4 h-4 mr-1" /> Añadir
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6 space-y-3">
                                    {template.objetivosDocente.map((obj: string, idx: number) => (
                                        <div key={idx} className="flex gap-2">
                                            <Input
                                                placeholder={`Objetivo ${idx + 1}`}
                                                value={obj}
                                                onChange={(e) => updateItem('objetivosDocente', idx, e.target.value)}
                                                className="rounded-xl"
                                            />
                                            <Button onClick={() => removeItem('objetivosDocente', idx)} variant="ghost" size="icon" className="text-slate-300 hover:text-red-500">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Section 2: Insumos Obligatorios */}
                    {activeSection === 2 && (
                        <div className="space-y-6">
                            <div className="bg-red-50 p-6 rounded-3xl border border-red-100 flex gap-4">
                                <AlertCircle className="w-6 h-6 text-red-600 shrink-0" />
                                <div>
                                    <p className="font-bold text-red-900 mb-1">Verificación obligatoria</p>
                                    <p className="text-sm text-red-700">El estudiante debe tener estos elementos antes de iniciar la IT.</p>
                                </div>
                            </div>
                            <Card className="rounded-3xl border-slate-200">
                                <CardHeader className="p-6 border-b border-slate-100">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg font-black">Insumos requeridos</CardTitle>
                                        <Button onClick={() => addItem('insumosRequeridos')} variant="ghost" size="sm" className="text-violet-600">
                                            <Plus className="w-4 h-4 mr-1" /> Añadir
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6 space-y-3">
                                    {template.insumosRequeridos.map((insumo: string, idx: number) => (
                                        <div key={idx} className="flex gap-2 items-center">
                                            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                                            <Input
                                                placeholder="Ej: Sistema definido (entradas, procesos, salidas)"
                                                value={insumo}
                                                onChange={(e) => updateItem('insumosRequeridos', idx, e.target.value)}
                                                className="rounded-xl"
                                            />
                                            <Button onClick={() => removeItem('insumosRequeridos', idx)} variant="ghost" size="icon" className="text-slate-300 hover:text-red-500">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Section 3: Concepto Clave */}
                    {activeSection === 3 && (
                        <div className="space-y-6">
                            <Card className="rounded-3xl border-slate-200">
                                <CardHeader className="p-6 bg-slate-50 border-b border-slate-100">
                                    <CardTitle className="text-lg font-black">Concepto clave a reforzar</CardTitle>
                                    <p className="text-sm text-slate-500 mt-1">Mensaje que el docente debe repetir (lenguaje estudiante)</p>
                                </CardHeader>
                                <CardContent className="p-8">
                                    <Textarea
                                        placeholder="Ej: Un sistema toma decisiones cuando usa datos para cambiar su comportamiento."
                                        value={template.conceptoClave}
                                        onChange={(e) => setTemplate({ ...template, conceptoClave: e.target.value })}
                                        className="rounded-xl min-h-[120px] text-lg leading-relaxed"
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Section 4: Ejemplo Modelo */}
                    {activeSection === 4 && (
                        <div className="space-y-6">
                            <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 flex gap-4">
                                <Zap className="w-6 h-6 text-blue-600 shrink-0" />
                                <div>
                                    <p className="font-bold text-blue-900 mb-1">Ejemplo referencial</p>
                                    <p className="text-sm text-blue-700">No copiable, solo para que entiendan la lógica.</p>
                                </div>
                            </div>
                            <Card className="rounded-3xl border-slate-200">
                                <CardContent className="p-8 space-y-6">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black text-slate-400 uppercase">Sistema</Label>
                                        <Input
                                            placeholder="Ej: Control de asistencia"
                                            value={template.ejemploSistema}
                                            onChange={(e) => setTemplate({ ...template, ejemploSistema: e.target.value })}
                                            className="rounded-xl h-12"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black text-slate-400 uppercase">Variable</Label>
                                        <Input
                                            placeholder="Ej: número de ausencias"
                                            value={template.ejemploVariable}
                                            onChange={(e) => setTemplate({ ...template, ejemploVariable: e.target.value })}
                                            className="rounded-xl h-12"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black text-slate-400 uppercase">Condición</Label>
                                        <Textarea
                                            placeholder="Ej: Si ausencias ≥ 3 → generar alerta"
                                            value={template.ejemploCondicion}
                                            onChange={(e) => setTemplate({ ...template, ejemploCondicion: e.target.value })}
                                            className="rounded-xl min-h-[100px]"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Section 5: Actividad Principal */}
                    {activeSection === 5 && (
                        <div className="space-y-6">
                            <Card className="rounded-3xl border-violet-200 border-2">
                                <CardHeader className="p-6 bg-violet-50 border-b border-violet-100">
                                    <CardTitle className="text-lg font-black text-violet-900">🔧 Reto de Integración</CardTitle>
                                    <p className="text-sm text-violet-700 mt-1">Núcleo de la IT - Lo que el estudiante debe hacer</p>
                                </CardHeader>
                                <CardContent className="p-8 space-y-6">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black text-slate-400 uppercase">Descripción del reto</Label>
                                        <Textarea
                                            placeholder="Ej: Ajusta tu sistema para que una o más variables influyan directamente en una decisión."
                                            value={template.retoIntegracion}
                                            onChange={(e) => setTemplate({ ...template, retoIntegracion: e.target.value })}
                                            className="rounded-xl min-h-[100px]"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black text-slate-400 uppercase">1️⃣ Variable principal</Label>
                                        <Input
                                            placeholder="Variable que influye en la decisión"
                                            value={template.variablePrincipal}
                                            onChange={(e) => setTemplate({ ...template, variablePrincipal: e.target.value })}
                                            className="rounded-xl h-12"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black text-slate-400 uppercase">2️⃣ Condición o regla</Label>
                                        <Textarea
                                            placeholder="Ej: Si ___ es mayor que ___"
                                            value={template.condicionRegla}
                                            onChange={(e) => setTemplate({ ...template, condicionRegla: e.target.value })}
                                            className="rounded-xl min-h-[80px]"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black text-slate-400 uppercase">3️⃣ Decisión del sistema</Label>
                                        <Input
                                            placeholder="Ej: Generar alerta, Cambiar estado, Mostrar mensaje"
                                            value={template.decisionSistema}
                                            onChange={(e) => setTemplate({ ...template, decisionSistema: e.target.value })}
                                            className="rounded-xl h-12"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Section 6: Escenario de Prueba */}
                    {activeSection === 6 && (
                        <div className="space-y-6">
                            <Card className="rounded-3xl border-slate-200">
                                <CardHeader className="p-6 bg-slate-50 border-b border-slate-100">
                                    <CardTitle className="text-lg font-black">🧪 Prueba de funcionamiento</CardTitle>
                                    <p className="text-sm text-slate-500 mt-1">Escenario donde el estudiante demuestra comprensión real</p>
                                </CardHeader>
                                <CardContent className="p-8">
                                    <Textarea
                                        placeholder="Describe un escenario donde el valor de la variable cambie y el sistema tome una decisión diferente."
                                        value={template.escenarioPrueba}
                                        onChange={(e) => setTemplate({ ...template, escenarioPrueba: e.target.value })}
                                        className="rounded-xl min-h-[150px] leading-relaxed"
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Section 7: Evidencia */}
                    {activeSection === 7 && (
                        <div className="space-y-6">
                            <Card className="rounded-3xl border-slate-200">
                                <CardHeader className="p-6 border-b border-slate-100">
                                    <CardTitle className="text-lg font-black">Evidencia integrada</CardTitle>
                                </CardHeader>
                                <CardContent className="p-8 space-y-6">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black text-slate-400 uppercase">Tipo de evidencia</Label>
                                        <Input
                                            placeholder="Ej: Diagrama del sistema ajustado + Documento explicativo"
                                            value={template.tipoEvidencia}
                                            onChange={(e) => setTemplate({ ...template, tipoEvidencia: e.target.value })}
                                            className="rounded-xl h-12"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black text-slate-400 uppercase">Criterios de evidencia</Label>
                                        <Button onClick={() => addItem('criteriosEvidencia')} variant="outline" size="sm" className="mb-3">
                                            <Plus className="w-4 h-4 mr-1" /> Añadir criterio
                                        </Button>
                                        {template.criteriosEvidencia.map((criterio: string, idx: number) => (
                                            <div key={idx} className="flex gap-2">
                                                <Input
                                                    placeholder="Ej: Variable usada claramente identificada"
                                                    value={criterio}
                                                    onChange={(e) => updateItem('criteriosEvidencia', idx, e.target.value)}
                                                    className="rounded-xl"
                                                />
                                                <Button onClick={() => removeItem('criteriosEvidencia', idx)} variant="ghost" size="icon" className="text-slate-300 hover:text-red-500">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Section 8: Validación */}
                    {activeSection === 8 && (
                        <div className="space-y-6">
                            <div className="bg-green-50 p-6 rounded-3xl border border-green-100">
                                <p className="font-bold text-green-900 mb-2">La IT se considera LOGRADA si:</p>
                            </div>
                            <Card className="rounded-3xl border-slate-200">
                                <CardHeader className="p-6 border-b border-slate-100">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg font-black">Criterios de validación</CardTitle>
                                        <Button onClick={() => addItem('criteriosValidacion')} variant="ghost" size="sm" className="text-violet-600">
                                            <Plus className="w-4 h-4 mr-1" /> Añadir
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6 space-y-3">
                                    {template.criteriosValidacion.map((criterio: string, idx: number) => (
                                        <div key={idx} className="flex gap-2 items-center">
                                            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                                            <Input
                                                placeholder="Ej: Existe relación clara entre variable y decisión"
                                                value={criterio}
                                                onChange={(e) => updateItem('criteriosValidacion', idx, e.target.value)}
                                                className="rounded-xl"
                                            />
                                            <Button onClick={() => removeItem('criteriosValidacion', idx)} variant="ghost" size="icon" className="text-slate-300 hover:text-red-500">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Section 9: Competencias */}
                    {activeSection === 9 && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 gap-6">
                                {/* Técnicas */}
                                <Card className="rounded-3xl border-blue-200">
                                    <CardHeader className="p-6 bg-blue-50 border-b border-blue-100">
                                        <CardTitle className="text-lg font-black text-blue-900">🧠 Competencias Técnicas</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6 space-y-3">
                                        <Button onClick={() => addItem('competenciasTecnicas')} variant="outline" size="sm" className="mb-2">
                                            <Plus className="w-4 h-4 mr-1" /> Añadir
                                        </Button>
                                        {template.competenciasTecnicas.map((comp: string, idx: number) => (
                                            <div key={idx} className="flex gap-2">
                                                <Input
                                                    placeholder="Ej: Integración de sistemas con datos"
                                                    value={comp}
                                                    onChange={(e) => updateItem('competenciasTecnicas', idx, e.target.value)}
                                                    className="rounded-xl"
                                                />
                                                <Button onClick={() => removeItem('competenciasTecnicas', idx)} variant="ghost" size="icon" className="text-slate-300 hover:text-red-500">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>

                                {/* Digitales */}
                                <Card className="rounded-3xl border-violet-200">
                                    <CardHeader className="p-6 bg-violet-50 border-b border-violet-100">
                                        <CardTitle className="text-lg font-black text-violet-900">💻 Competencias Digitales</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6 space-y-3">
                                        <Button onClick={() => addItem('competenciasDigitales')} variant="outline" size="sm" className="mb-2">
                                            <Plus className="w-4 h-4 mr-1" /> Añadir
                                        </Button>
                                        {template.competenciasDigitales.map((comp: string, idx: number) => (
                                            <div key={idx} className="flex gap-2">
                                                <Input
                                                    placeholder="Ej: Pensamiento computacional"
                                                    value={comp}
                                                    onChange={(e) => updateItem('competenciasDigitales', idx, e.target.value)}
                                                    className="rounded-xl"
                                                />
                                                <Button onClick={() => removeItem('competenciasDigitales', idx)} variant="ghost" size="icon" className="text-slate-300 hover:text-red-500">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>

                                {/* Transversales */}
                                <Card className="rounded-3xl border-emerald-200">
                                    <CardHeader className="p-6 bg-emerald-50 border-b border-emerald-100">
                                        <CardTitle className="text-lg font-black text-emerald-900">🌱 Competencias Transversales</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6 space-y-3">
                                        <Button onClick={() => addItem('competenciasTransversales')} variant="outline" size="sm" className="mb-2">
                                            <Plus className="w-4 h-4 mr-1" /> Añadir
                                        </Button>
                                        {template.competenciasTransversales.map((comp: string, idx: number) => (
                                            <div key={idx} className="flex gap-2">
                                                <Input
                                                    placeholder="Ej: Pensamiento crítico"
                                                    value={comp}
                                                    onChange={(e) => updateItem('competenciasTransversales', idx, e.target.value)}
                                                    className="rounded-xl"
                                                />
                                                <Button onClick={() => removeItem('competenciasTransversales', idx)} variant="ghost" size="icon" className="text-slate-300 hover:text-red-500">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}

                    {/* Section 10: Motivacional */}
                    {activeSection === 10 && (
                        <div className="space-y-6">
                            <Card className="rounded-3xl border-amber-200 border-2">
                                <CardHeader className="p-6 bg-amber-50 border-b border-amber-100">
                                    <CardTitle className="text-lg font-black text-amber-900">💡 Mensaje visible en plataforma</CardTitle>
                                    <p className="text-sm text-amber-700 mt-1">Este mensaje inspirará al estudiante</p>
                                </CardHeader>
                                <CardContent className="p-8">
                                    <Textarea
                                        placeholder="Ej: Cuando un sistema toma decisiones con datos, deja de ser una idea y empieza a ser una solución inteligente."
                                        value={template.mensajeMotivacional}
                                        onChange={(e) => setTemplate({ ...template, mensajeMotivacional: e.target.value })}
                                        className="rounded-xl min-h-[120px] text-lg leading-relaxed font-medium"
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Navigation Footer */}
                    <footer className="mt-12 flex justify-between pt-8 border-t border-slate-200">
                        <Button
                            variant="ghost"
                            onClick={() => setActiveSection(prev => Math.max(0, prev - 1))}
                            disabled={activeSection === 0}
                            className="font-bold text-slate-400"
                        >
                            Sección Anterior
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setActiveSection(prev => Math.min(sections.length - 1, prev + 1))}
                            disabled={activeSection === sections.length - 1}
                            className="rounded-xl font-bold bg-white"
                        >
                            Siguiente Sección
                        </Button>
                    </footer>
                </div>
            </div>
        </div>
    );
}
