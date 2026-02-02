
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, Save, ArrowLeft, Layers, Info, Search, PenTool, CheckCircle2, Image as ImageIcon } from "lucide-react";
import { professorApi } from "@/features/professor/services/professor.api";
import { toast } from "@/hooks/use-toast";
import { ImagePickerModal } from "./ImagePickerModal";
import { cn } from "@/lib/utils";

interface PimModule {
    nombreModulo: string;
    enfoqueTecnico: string;
    problemaTecnico: string;
    actividadesInvestigacion: string[];
    formatoSugerido: string[];
    actividadesPractica: string[];
    ejerciciosPracticos: string[];
    aporteTecnico: string[];
}

interface PimFormData {
    tituloProyecto: string;
    anioNivel: string;
    descripcionGeneral: string;
    problematicaGeneral: string;
    contextoProblema: string;
    objetivoProyecto: string;
    imagenUrl?: string;
    modulos: PimModule[];
}

interface PimEditorProps {
    levelId: number;
    moduleId: number;
    initialData?: any;
    onClose: () => void;
}

export default function PimEditor({ levelId, initialData, onClose }: PimEditorProps) {
    const [formData, setFormData] = useState<PimFormData>({
        tituloProyecto: "",
        anioNivel: "Primer Año",
        descripcionGeneral: "",
        problematicaGeneral: "",
        contextoProblema: "",
        objetivoProyecto: "",
        imagenUrl: "",
        modulos: []
    });

    const [loading, setLoading] = useState(false);
    const [isPickerOpen, setIsPickerOpen] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                modulos: typeof initialData.modulos === 'string'
                    ? JSON.parse(initialData.modulos)
                    : (initialData.modulos || [])
            });
        }
    }, [initialData]);

    const handleSave = async () => {
        setLoading(true);
        try {
            const payload = {
                ...formData,
                modulos: JSON.stringify(formData.modulos)
            };
            await professorApi.savePimTemplate(levelId, payload);
            toast({ title: "Plantilla PIM guardada exitosamente" });
            if (onClose) onClose();
        } catch (error) {
            toast({ title: "Error al guardar", description: "No se pudo guardar la plantilla PIM", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const addModule = () => {
        const newModule: PimModule = {
            nombreModulo: "",
            enfoqueTecnico: "",
            problemaTecnico: "",
            actividadesInvestigacion: [""],
            formatoSugerido: ["Lectura corta", "Captura de pantalla"],
            actividadesPractica: [""],
            ejerciciosPracticos: [""],
            aporteTecnico: [""]
        };
        setFormData({ ...formData, modulos: [...formData.modulos, newModule] });
    };

    const updateModule = (index: number, updates: Partial<PimModule>) => {
        const newModulos = [...formData.modulos];
        newModulos[index] = { ...newModulos[index], ...updates };
        setFormData({ ...formData, modulos: newModulos });
    };

    const removeModule = (index: number) => {
        setFormData({ ...formData, modulos: formData.modulos.filter((_, i) => i !== index) });
    };

    const addListItem = (moduleIndex: number, field: keyof PimModule) => {
        const module = formData.modulos[moduleIndex];
        const list = module[field] as string[];
        updateModule(moduleIndex, { [field]: [...list, ""] });
    };

    const updateListItem = (moduleIndex: number, field: keyof PimModule, itemIndex: number, value: string) => {
        const module = formData.modulos[moduleIndex];
        const list = [...(module[field] as string[])];
        list[itemIndex] = value;
        updateModule(moduleIndex, { [field]: list });
    };

    const removeListItem = (moduleIndex: number, field: keyof PimModule, itemIndex: number) => {
        const module = formData.modulos[moduleIndex];
        const list = (module[field] as string[]).filter((_, i) => i !== itemIndex);
        updateModule(moduleIndex, { [field]: list });
    };

    return (
        <div className="fixed inset-0 bg-slate-50 z-50 flex flex-col overflow-hidden animate-in fade-in duration-300">
            {/* Header */}
            <header className="bg-white border-b px-6 py-4 flex items-center justify-between shadow-sm flex-shrink-0">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                        <ArrowLeft className="w-5 h-5 text-slate-600" />
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <Layers className="w-5 h-5 text-indigo-600" />
                            Editor PIM
                        </h1>
                        <p className="text-xs text-slate-500">Proyecto Integrador Modular - Nivel {levelId}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={onClose}>Cancelar</Button>
                    <Button onClick={handleSave} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
                        <Save className="w-4 h-4" /> {loading ? "Guardando..." : "Guardar Proyecto"}
                    </Button>
                </div>
            </header>

            <ScrollArea className="flex-1 p-6">
                <div className="max-w-5xl mx-auto space-y-8 pb-20">

                    {/* Información General */}
                    <Card className="border-none shadow-md">
                        <CardHeader className="bg-indigo-50/50 rounded-t-xl border-b border-indigo-100">
                            <CardTitle className="text-indigo-800 flex items-center gap-2 text-lg">
                                <Info className="w-5 h-5" /> Información General del Proyecto
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Título del Proyecto Integrador</Label>
                                    <Input
                                        value={formData.tituloProyecto}
                                        onChange={e => setFormData({ ...formData, tituloProyecto: e.target.value })}
                                        placeholder="Ej. PlaySafe"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Año / Nivel Académico</Label>
                                    <Input
                                        value={formData.anioNivel}
                                        onChange={e => setFormData({ ...formData, anioNivel: e.target.value })}
                                        placeholder="Ej. Primer Año"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Problemática General</Label>
                                    <Textarea
                                        value={formData.problematicaGeneral}
                                        onChange={e => setFormData({ ...formData, problematicaGeneral: e.target.value })}
                                        placeholder="¿Cuál es el problema principal que se resuelve?"
                                        className="min-h-[100px]"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Contexto del Problema</Label>
                                    <Textarea
                                        value={formData.contextoProblema}
                                        onChange={e => setFormData({ ...formData, contextoProblema: e.target.value })}
                                        placeholder="Contexto o escenario donde ocurre el problema..."
                                        className="min-h-[100px]"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Objetivo del Proyecto</Label>
                                <Textarea
                                    value={formData.objetivoProyecto}
                                    onChange={e => setFormData({ ...formData, objetivoProyecto: e.target.value })}
                                    placeholder="¿Qué se espera lograr con este proyecto?"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Imagen del Proyecto (Opcional)</Label>
                                <div className="flex gap-2">
                                    <Input value={formData.imagenUrl} onChange={e => setFormData({ ...formData, imagenUrl: e.target.value })} placeholder="URL de la imagen" className="flex-1" />
                                    <Button variant="outline" onClick={() => setIsPickerOpen(true)}>
                                        <ImageIcon className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Módulos */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                                <PenTool className="w-6 h-6 text-blue-600" /> Desarrollo Técnico por Módulo
                            </h2>
                            <Button onClick={addModule} variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                                <Plus className="w-4 h-4 mr-2" /> Agregar Módulo
                            </Button>
                        </div>

                        {formData.modulos.length === 0 && (
                            <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-slate-200">
                                <Layers className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                <p className="text-slate-500">No hay módulos configurados. ¡Agrega el primero!</p>
                            </div>
                        )}

                        {formData.modulos.map((module, mIdx) => (
                            <Card key={mIdx} className="border-none shadow-lg overflow-hidden border-l-4 border-l-blue-500">
                                <CardHeader className="bg-slate-50 flex flex-row items-center justify-between py-4">
                                    <div className="flex-1 mr-4">
                                        <Input
                                            value={module.nombreModulo}
                                            onChange={e => updateModule(mIdx, { nombreModulo: e.target.value })}
                                            placeholder="Nombre del Módulo (ej. Módulo 1 - Creador de Videojuegos)"
                                            className="font-bold text-lg bg-transparent border-none shadow-none focus-visible:ring-0 p-0 h-auto"
                                        />
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => removeModule(mIdx)} className="text-red-500">
                                        <Trash2 className="w-4 h-4 mr-2" /> Eliminar Módulo
                                    </Button>
                                </CardHeader>
                                <CardContent className="space-y-8 pt-6">

                                    {/* Enfoque y Problema */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500" /> Enfoque técnico del módulo</Label>
                                            <Textarea
                                                value={module.enfoqueTecnico}
                                                onChange={e => updateModule(mIdx, { enfoqueTecnico: e.target.value })}
                                                placeholder="Ej. Diseñar un videojuego interactivo..."
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-orange-500" /> Problema técnico a trabajar</Label>
                                            <Textarea
                                                value={module.problemaTecnico}
                                                onChange={e => updateModule(mIdx, { problemaTecnico: e.target.value })}
                                                placeholder="Ej. ¿Cómo lograr que un juego reaccione...?"
                                            />
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Investigación y Formato */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <Label className="flex items-center gap-2 text-blue-700 font-bold uppercase text-xs tracking-wider">
                                                <Search className="w-4 h-4" /> Actividades de investigación
                                            </Label>
                                            <div className="space-y-3">
                                                {module.actividadesInvestigacion.map((item, iIdx) => (
                                                    <div key={iIdx} className="flex gap-2">
                                                        <Input value={item} onChange={e => updateListItem(mIdx, 'actividadesInvestigacion', iIdx, e.target.value)} placeholder="Tarea de investigación..." />
                                                        <Button variant="ghost" size="icon" onClick={() => removeListItem(mIdx, 'actividadesInvestigacion', iIdx)}><Trash2 className="w-4 h-4 text-red-300" /></Button>
                                                    </div>
                                                ))}
                                                <Button size="sm" variant="ghost" className="text-blue-600 h-8" onClick={() => addListItem(mIdx, 'actividadesInvestigacion')}>
                                                    <Plus className="w-3 h-3 mr-2" /> Agregar Item
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <Label className="flex items-center gap-2 text-indigo-700 font-bold uppercase text-xs tracking-wider">
                                                Formato sugerido
                                            </Label>
                                            <div className="space-y-3">
                                                {module.formatoSugerido.map((item, fIdx) => (
                                                    <div key={fIdx} className="flex gap-2">
                                                        <Input value={item} onChange={e => updateListItem(mIdx, 'formatoSugerido', fIdx, e.target.value)} placeholder="Ej. Lectura corta..." />
                                                        <Button variant="ghost" size="icon" onClick={() => removeListItem(mIdx, 'formatoSugerido', fIdx)}><Trash2 className="w-4 h-4 text-red-300" /></Button>
                                                    </div>
                                                ))}
                                                <Button size="sm" variant="ghost" className="text-indigo-600 h-8" onClick={() => addListItem(mIdx, 'formatoSugerido')}>
                                                    <Plus className="w-3 h-3 mr-2" /> Agregar Formato
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Práctica y Ejercicios */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <Label className="flex items-center gap-2 text-green-700 font-bold uppercase text-xs tracking-wider">
                                                Actividades de práctica
                                            </Label>
                                            <div className="space-y-3">
                                                {module.actividadesPractica.map((item, pIdx) => (
                                                    <div key={pIdx} className="flex gap-2">
                                                        <Input value={item} onChange={e => updateListItem(mIdx, 'actividadesPractica', pIdx, e.target.value)} placeholder="Práctica..." />
                                                        <Button variant="ghost" size="icon" onClick={() => removeListItem(mIdx, 'actividadesPractica', pIdx)}><Trash2 className="w-4 h-4 text-red-300" /></Button>
                                                    </div>
                                                ))}
                                                <Button size="sm" variant="ghost" className="text-green-600 h-8" onClick={() => addListItem(mIdx, 'actividadesPractica')}>
                                                    <Plus className="w-3 h-3 mr-2" /> Agregar Práctica
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <Label className="flex items-center gap-2 text-emerald-700 font-bold uppercase text-xs tracking-wider">
                                                Ejercicios prácticos
                                            </Label>
                                            <div className="space-y-3">
                                                {module.ejerciciosPracticos.map((item, eIdx) => (
                                                    <div key={eIdx} className="flex gap-2">
                                                        <Input value={item} onChange={e => updateListItem(mIdx, 'ejerciciosPracticos', eIdx, e.target.value)} placeholder="Ejercicio..." />
                                                        <Button variant="ghost" size="icon" onClick={() => removeListItem(mIdx, 'ejerciciosPracticos', eIdx)}><Trash2 className="w-4 h-4 text-red-300" /></Button>
                                                    </div>
                                                ))}
                                                <Button size="sm" variant="ghost" className="text-emerald-600 h-8" onClick={() => addListItem(mIdx, 'ejerciciosPracticos')}>
                                                    <Plus className="w-3 h-3 mr-2" /> Agregar Ejercicio
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Aporte Técnico */}
                                    <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                                        <Label className="flex items-center gap-2 text-blue-900 font-bold uppercase text-xs tracking-wider mb-4">
                                            <CheckCircle2 className="w-4 h-4" /> Aporte técnico al proyecto
                                        </Label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {module.aporteTecnico.map((item, aIdx) => (
                                                <div key={aIdx} className="flex gap-2">
                                                    <Input value={item} onChange={e => updateListItem(mIdx, 'aporteTecnico', aIdx, e.target.value)} placeholder="Aporte..." className="bg-white" />
                                                    <Button variant="ghost" size="icon" onClick={() => removeListItem(mIdx, 'aporteTecnico', aIdx)}><Trash2 className="w-4 h-4 text-red-300" /></Button>
                                                </div>
                                            ))}
                                            <Button size="sm" variant="ghost" className="text-blue-600 h-10 w-fit" onClick={() => addListItem(mIdx, 'aporteTecnico')}>
                                                <Plus className="w-3 h-3 mr-2" /> Agregar Aporte
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="flex justify-center pt-10">
                        <Button size="lg" onClick={handleSave} disabled={loading} className="px-12 h-14 bg-indigo-600 hover:bg-indigo-700 text-lg font-bold shadow-xl gap-2">
                            <Save className="w-5 h-5" /> {loading ? "Guardando..." : "Finalizar y Guardar PIM"}
                        </Button>
                    </div>
                </div>
            </ScrollArea>

            <ImagePickerModal
                isOpen={isPickerOpen}
                onClose={() => setIsPickerOpen(false)}
                onSelect={(url) => setFormData({ ...formData, imagenUrl: url })}
            />
        </div>
    );
}
