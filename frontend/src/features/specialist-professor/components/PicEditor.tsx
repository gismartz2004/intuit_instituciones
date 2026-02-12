import { useState, useEffect } from "react";
import { useRoute, useLocation, Link } from "wouter";
import { Save, ArrowLeft, Rocket, Eye, Plus, Trash2, Target, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import specialistProfessorApi from "../services/specialistProfessor.api";

export default function PicEditor() {
    const [match, params] = useRoute("/specialist-professor/pic/edit/:id");
    const levelId = match && params ? (params as any).id : null;
    const [, setLocation] = useLocation();

    const [loading, setLoading] = useState(true);
    const [template, setTemplate] = useState<any>({
        titulo: "",
        alcance: "",
        objetivos: [{ texto: "" }],
        entregables: [{ nombre: "", descripcion: "" }]
    });

    useEffect(() => {
        if (levelId) {
            loadTemplate();
        }
    }, [levelId]);

    const loadTemplate = async () => {
        try {
            setLoading(true);
            const data = await specialistProfessorApi.getPicTemplate(parseInt(levelId));
            if (data) {
                setTemplate(data);
            }
        } catch (error) {
            console.error("Error loading PIC template", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            await specialistProfessorApi.savePicTemplate(parseInt(levelId), template);
            toast({ title: "Guardado", description: "Proyecto PIC guardado correctamente" });
        } catch (error) {
            toast({ title: "Error", description: "No se pudo guardar el proyecto", variant: "destructive" });
        }
    };

    const addObjetivo = () => {
        setTemplate({
            ...template,
            objetivos: [...template.objetivos, { texto: "" }]
        });
    };

    const addEntregable = () => {
        setTemplate({
            ...template,
            entregables: [...template.entregables, { nombre: "", descripcion: "" }]
        });
    };

    if (loading) return <div className="p-8">Cargando editor PIC...</div>;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <Badge className="bg-emerald-600 mb-1">EDITOR PIC</Badge>
                        <h1 className="text-xl font-black text-slate-800">Diseño de Proyecto Innovación</h1>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="font-bold rounded-xl gap-2"><Eye className="w-4 h-4" /> Vista Previa</Button>
                    <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl gap-2"><Save className="w-4 h-4" /> Guardar Proyecto</Button>
                </div>
            </header>

            <div className="flex-1 p-12 overflow-y-auto">
                <div className="max-w-4xl mx-auto space-y-8">
                    <Card className="rounded-[2.5rem] border-slate-200 shadow-sm overflow-hidden">
                        <CardHeader className="bg-slate-50 border-b border-slate-100 p-8">
                            <CardTitle className="text-2xl font-black text-slate-900">Definición Estratégica</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            <div className="space-y-2">
                                <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Nombre del Proyecto PIC</Label>
                                <Input
                                    className="h-14 rounded-xl text-xl font-black border-slate-200 focus:ring-emerald-500"
                                    placeholder="Ej: Prototipo Autónomo de Monitoreo Global"
                                    value={template.titulo}
                                    onChange={(e) => setTemplate({ ...template, titulo: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Alcance Técnico</Label>
                                <Textarea
                                    className="rounded-xl min-h-[150px] leading-relaxed border-slate-200 focus:ring-emerald-500"
                                    placeholder="Define los límites y el impacto tecnológico esperado de este proyecto..."
                                    value={template.alcance}
                                    onChange={(e) => setTemplate({ ...template, alcance: e.target.value })}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Objetivos */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                                    <Target className="w-5 h-5 text-emerald-600" /> Objetivos
                                </h3>
                                <Button onClick={addObjetivo} variant="ghost" size="sm" className="text-emerald-600 font-bold p-0 h-auto">
                                    <Plus className="w-4 h-4 mr-1" /> Añadir
                                </Button>
                            </div>
                            {template.objetivos.map((obj: any, idx: number) => (
                                <div key={idx} className="flex gap-2">
                                    <Input
                                        className="rounded-xl"
                                        placeholder={`Objetivo ${idx + 1}`}
                                        value={obj.texto}
                                        onChange={(e) => {
                                            const newObjs = [...template.objetivos];
                                            newObjs[idx].texto = e.target.value;
                                            setTemplate({ ...template, objetivos: newObjs });
                                        }}
                                    />
                                    <Button variant="ghost" size="icon" className="text-slate-200 hover:text-red-500">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>

                        {/* Entregables */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                                    <Package className="w-5 h-5 text-emerald-600" /> Entregables
                                </h3>
                                <Button onClick={addEntregable} variant="ghost" size="sm" className="text-emerald-600 font-bold p-0 h-auto">
                                    <Plus className="w-4 h-4 mr-1" /> Añadir
                                </Button>
                            </div>
                            {template.entregables.map((ent: any, idx: number) => (
                                <Card key={idx} className="rounded-2xl border-slate-100 shadow-sm p-4 space-y-2">
                                    <div className="flex justify-between">
                                        <Input
                                            className="border-none p-0 h-auto font-bold focus-visible:ring-0"
                                            placeholder="Nombre del componente/documento"
                                            value={ent.nombre}
                                            onChange={(e) => {
                                                const newEnts = [...template.entregables];
                                                newEnts[idx].nombre = e.target.value;
                                                setTemplate({ ...template, entregables: newEnts });
                                            }}
                                        />
                                        <Button variant="ghost" size="icon" className="p-0 h-auto w-auto text-slate-200">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <Textarea
                                        className="text-xs border-none p-0 min-h-[60px] focus-visible:ring-0 resize-none text-slate-500"
                                        placeholder="Descripción breve del entregable..."
                                        value={ent.descripcion}
                                        onChange={(e) => {
                                            const newEnts = [...template.entregables];
                                            newEnts[idx].descripcion = e.target.value;
                                            setTemplate({ ...template, entregables: newEnts });
                                        }}
                                    />
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
