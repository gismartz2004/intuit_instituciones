import { useState, useEffect } from "react";
import professorApi from "@/features/professor/services/professor.api";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, ArrowLeft, FileText, Video, Link as LinkIcon, Code, Upload, File, Lock, Unlock, Save, Clock, UserCheck } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";

import RagEditor from "./RagEditor";

import HaEditor from "./HaEditor";
import PimEditor from "./PimEditor";
import { AttendanceManager } from "./AttendanceManager";

interface Content {
    id: number;
    tipo: string;
    urlRecurso: string;
    tituloEjercicio?: string;
    descripcionEjercicio?: string;
    codigoInicial?: string;
    lenguaje?: string;
}

interface Level {
    id: number;
    tituloNivel: string;
    orden: number;
    bloqueadoManual?: boolean;
    diasParaDesbloquear?: number;
    contents: Content[];
    ragTemplate?: any; // To check if exists
    haTemplate?: any; // To check if exists
}

export default function CourseEditor() {
    const [match, params] = useRoute("/teach/module/:id");
    const [, setLocation] = useLocation();
    const [moduleName, setModuleName] = useState("");
    const [levels, setLevels] = useState<Level[]>([]);
    const [loading, setLoading] = useState(true);
    const [newLevelTitle, setNewLevelTitle] = useState("");
    const [showLevelDialog, setShowLevelDialog] = useState(false);
    const [selectedLevel, setSelectedLevel] = useState<number | null>(null);

    // RAG Editor State
    const [editingRagLevelId, setEditingRagLevelId] = useState<number | null>(null);
    const [ragInitialData, setRagInitialData] = useState<any>(null);

    // HA Editor State
    const [editingHaLevelId, setEditingHaLevelId] = useState<number | null>(null);
    const [haInitialData, setHaInitialData] = useState<any>(null);

    // PIM Editor State
    const [editingPimLevelId, setEditingPimLevelId] = useState<number | null>(null);
    const [pimInitialData, setPimInitialData] = useState<any>(null);

    // Attendance State
    const [editingAttendanceLevelId, setEditingAttendanceLevelId] = useState<number | null>(null);

    useEffect(() => {
        if (editingRagLevelId) {
            // Fetch existing RAG if any
            professorApi.getRagTemplate(editingRagLevelId).then(data => {
                if (data) setRagInitialData(data);
                else setRagInitialData(null);
            });
        }
    }, [editingRagLevelId]);

    useEffect(() => {
        if (editingHaLevelId) {
            professorApi.getHaTemplate(editingHaLevelId).then(data => {
                if (data) setHaInitialData(data);
                else setHaInitialData(null);
            })
        }
    }, [editingHaLevelId]);

    useEffect(() => {
        if (editingPimLevelId) {
            // Reusing studentApi.getPimTemplate as it's the same endpoint
            professorApi.getPimTemplate(editingPimLevelId).then(data => {
                if (data) setPimInitialData(data);
                else setPimInitialData(null);
            });
        }
    }, [editingPimLevelId]);

    // Content form states
    const [contentType, setContentType] = useState("link");
    const [contentUrl, setContentUrl] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // Resources for file picker
    const [resources, setResources] = useState<any[]>([]);
    const [resourcesLoading, setResourcesLoading] = useState(false);

    useEffect(() => {
        const loadResources = async () => {
            try {
                setResourcesLoading(true);
                const data = await professorApi.getResources();
                setResources(data);
            } catch (err) {
                console.error("Error loading resources", err);
            } finally {
                setResourcesLoading(false);
            }
        };
        loadResources();
    }, []);

    // Code exercise states
    const [exerciseTitle, setExerciseTitle] = useState("");
    const [exerciseDescription, setExerciseDescription] = useState("");
    const [starterCode, setStarterCode] = useState("");
    const [expectedCode, setExpectedCode] = useState("");
    const [language, setLanguage] = useState("javascript");

    const moduleId = match && params ? (params as any).id : null;

    useEffect(() => {
        if (moduleId) {
            fetchModuleData();
        }
    }, [moduleId]);

    const fetchModuleData = async () => {
        try {
            const modData = await professorApi.getModule(moduleId);
            setModuleName(modData.nombreModulo);

            const levelsData = await professorApi.getModuleLevels(moduleId);
            console.log("[COURSE EDITOR] Loaded Levels:", levelsData);
            setLevels(levelsData);

            setLoading(false);
        } catch (error) {
            console.error("Error fetching module data:", error);
            setLoading(false);
        }
    };

    const addLevel = async () => {
        if (!newLevelTitle.trim()) {
            toast({ title: "Error", description: "El título del nivel es requerido", variant: "destructive" });
            return;
        }

        try {
            await professorApi.createLevel(moduleId, {
                tituloNivel: newLevelTitle, // Corrected from 'titulo' to 'tituloNivel' to match backend DTO
                orden: levels.length + 1
            });

            toast({ title: "Éxito", description: "Nivel creado correctamente" });
            setNewLevelTitle("");
            setShowLevelDialog(false);
            fetchModuleData();
        } catch (error) {
            toast({ title: "Error", description: "No se pudo crear el nivel", variant: "destructive" });
        }
    };

    const addContent = async () => {
        if (!selectedLevel) {
            toast({ title: "Error", description: "Selecciona un nivel primero", variant: "destructive" });
            return;
        }

        let payload: any = {
            titulo: "Nuevo Contenido", // Default title if not provided
            tipo: contentType, // Corrected to match backend expected Body: { tipo, urlRecurso }
            urlRecurso: contentUrl,      // Corrected to match backend expected Body
            orden: 1,                   // Default order
            // Extra fields for code exercises
            tituloEjercicio: undefined,
            descripcionEjercicio: undefined,
            codigoInicial: undefined,
            codigoEsperado: undefined,
            lenguaje: undefined
        };

        if (contentType === "codigo_lab") {
            // Code exercise
            if (!exerciseTitle || !exerciseDescription || !starterCode) {
                toast({ title: "Error", description: "Completa todos los campos del ejercicio", variant: "destructive" });
                return;
            }
            payload = {
                ...payload,
                titulo: exerciseTitle,
                tituloEjercicio: exerciseTitle,
                descripcionEjercicio: exerciseDescription,
                codigoInicial: starterCode,
                codigoEsperado: expectedCode,
                lenguaje: language,
                urlRecurso: "" // Not used for code exercises
            };
        } else if (contentType === "file" || contentType === "pdf") {
            // File from library
            if (!contentUrl) {
                toast({ title: "Error", description: "No se ha seleccionado un recurso", variant: "destructive" });
                return;
            }

            payload.urlRecurso = contentUrl;
            payload.tipo = contentUrl.includes('.pdf') ? 'pdf' : 'file';
        } else {
            // Link
            if (!contentUrl.trim()) {
                toast({ title: "Error", description: "La URL es requerida", variant: "destructive" });
                return;
            }
            payload.urlRecurso = contentUrl;
        }

        try {
            // Note: createContent expects (levelId, payload)
            // Payload needs to match CreateContentPayload interface in api
            // interface CreateContentPayload { titulo: string; tipoContenido: string; contenido: string; orden: number; }

            await professorApi.createContent(selectedLevel, payload);

            toast({ title: "Éxito", description: "Contenido agregado correctamente" });
            resetContentForm();
            fetchModuleData();
        } catch (error) {
            toast({ title: "Error", description: "No se pudo agregar el contenido", variant: "destructive" });
        }
    };

    const resetContentForm = () => {
        setContentUrl("");
        setSelectedFile(null);
        setExerciseTitle("");
        setExerciseDescription("");
        setStarterCode("");
        setExpectedCode("");
        setLanguage("javascript");
    };

    const deleteContent = async (contentId: number) => {
        try {
            await professorApi.deleteContent(contentId);

            toast({ title: "Éxito", description: "Contenido eliminado" });
            fetchModuleData();
        } catch (error) {
            toast({ title: "Error", description: "No se pudo eliminar", variant: "destructive" });
        }
    };

    const updateLevelSettings = async (levelId: number, settings: { bloqueadoManual: boolean, diasParaDesbloquear: number }) => {
        try {
            await professorApi.updateLevel(levelId, settings);
            toast({ title: "Ajustes Guardados", description: "El acceso al nivel ha sido actualizado." });
            fetchModuleData();
        } catch (error) {
            toast({ title: "Error", description: "No se pudieron guardar los ajustes", variant: "destructive" });
        }
    };

    const getContentIcon = (tipo: string) => {
        switch (tipo) {
            case 'pdf': return <FileText className="w-4 h-4" />;
            case 'video': return <Video className="w-4 h-4" />;
            case 'link': return <LinkIcon className="w-4 h-4" />;
            case 'codigo_lab': return <Code className="w-4 h-4" />;
            default: return <File className="w-4 h-4" />;
        }
    };

    if (loading) {
        return <div className="p-8">Cargando...</div>;
    }

    if (editingRagLevelId) {
        return <RagEditor
            levelId={editingRagLevelId}
            moduleId={Number(moduleId)}
            initialData={ragInitialData}
            onClose={() => setEditingRagLevelId(null)}
        />;
    }

    if (editingHaLevelId) {
        return <HaEditor
            levelId={editingHaLevelId}
            moduleId={Number(moduleId)}
            initialData={haInitialData}
            onClose={() => setEditingHaLevelId(null)}
        />;
    }

    if (editingPimLevelId) {
        return <PimEditor
            levelId={editingPimLevelId}
            moduleId={Number(moduleId)}
            initialData={pimInitialData}
            onClose={() => setEditingPimLevelId(null)}
        />;
    }

    if (editingAttendanceLevelId) {
        return (
            <div className="p-8 max-w-4xl mx-auto">
                <Button variant="ghost" onClick={() => setEditingAttendanceLevelId(null)} className="mb-4">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver al Editor
                </Button>
                <AttendanceManager
                    levelId={editingAttendanceLevelId}
                    levelName={levels.find(l => l.id === editingAttendanceLevelId)?.tituloNivel || "Nivel"}
                />
            </div>
        );
    }

    return (
        <div className="p-8 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" onClick={() => setLocation("/teach")}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver
                </Button>
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">{moduleName}</h1>
                    <p className="text-slate-500">Editor de Contenido</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-8">
                {/* Left: Levels List */}
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle>Niveles del Módulo</CardTitle>
                            <Dialog open={showLevelDialog} onOpenChange={setShowLevelDialog}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Nuevo Nivel
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Crear Nuevo Nivel</DialogTitle>
                                        <div className="text-sm text-slate-500">
                                            Ingresa el nombre del nuevo nivel para agregarlo al módulo.
                                        </div>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div>
                                            <Label>Título del Nivel</Label>
                                            <Input
                                                value={newLevelTitle}
                                                onChange={(e) => setNewLevelTitle(e.target.value)}
                                                placeholder="Ej: Introducción a Variables"
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setShowLevelDialog(false)}>Cancelar</Button>
                                        <Button onClick={addLevel}>Crear Nivel</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {levels.length === 0 ? (
                            <p className="text-slate-400 text-center py-8">No hay niveles creados</p>
                        ) : (
                            <div className="space-y-4">
                                {levels.map((level) => (
                                    <Card
                                        key={level.id}
                                        className={`cursor-pointer transition-all ${selectedLevel === level.id ? 'border-blue-500 bg-blue-50' : 'hover:border-slate-300'}`}
                                        onClick={() => setSelectedLevel(level.id)}
                                    >
                                        <CardContent className="pt-4">
                                            <div className="flex justify-between items-center mb-2">
                                                <h3 className="font-bold text-lg">{level.tituloNivel}</h3>
                                                <div className="flex items-center gap-2">
                                                    {level.bloqueadoManual && <Lock className="w-4 h-4 text-red-500" />}
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (confirm('¿Estás seguro de eliminar este nivel y todo su contenido?')) {
                                                                professorApi.deleteLevel(level.id)
                                                                    .then(() => {
                                                                        toast({ title: "Nivel eliminado" });
                                                                        fetchModuleData();
                                                                    })
                                                                    .catch(() => {
                                                                        toast({ title: "Error", description: "No se pudo eliminar the level", variant: "destructive" });
                                                                    });
                                                            }
                                                        }}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Access Controls - 3-State Logic */}
                                            <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 mb-3" onClick={(e) => e.stopPropagation()}>
                                                <Tabs
                                                    defaultValue={level.bloqueadoManual === true ? "locked" : (level.bloqueadoManual === false ? "unlocked" : "auto")}
                                                    className="w-full"
                                                    onValueChange={(val) => {
                                                        let newMode: boolean | null = null;
                                                        if (val === "locked") newMode = true;
                                                        else if (val === "unlocked") newMode = false;

                                                        updateLevelSettings(level.id, {
                                                            bloqueadoManual: newMode as any,
                                                            diasParaDesbloquear: level.diasParaDesbloquear ?? 7
                                                        });
                                                    }}
                                                >
                                                    <TabsList className="grid w-full grid-cols-3 h-8 p-1">
                                                        <TabsTrigger value="locked" className="text-[10px] font-bold py-0 h-6">
                                                            <Lock className="w-3 h-3 mr-1" /> LOCK
                                                        </TabsTrigger>
                                                        <TabsTrigger value="auto" className="text-[10px] font-bold py-0 h-6">
                                                            <Clock className="w-3 h-3 mr-1" /> AUTO
                                                        </TabsTrigger>
                                                        <TabsTrigger value="unlocked" className="text-[10px] font-bold py-0 h-6">
                                                            <Unlock className="w-3 h-3 mr-1" /> OPEN
                                                        </TabsTrigger>
                                                    </TabsList>

                                                    <TabsContent value="auto" className="mt-2 pt-0">
                                                        <div className="flex items-center justify-center gap-2 px-2">
                                                            <span className="text-[9px] font-black text-slate-400 uppercase">Se abre el día</span>
                                                            <Input
                                                                type="number"
                                                                value={level.diasParaDesbloquear ?? 7}
                                                                className="w-14 h-6 text-[11px] px-1 text-center font-bold"
                                                                min={0}
                                                                onChange={(e) => {
                                                                    const val = parseInt(e.target.value);
                                                                    if (!isNaN(val)) {
                                                                        const newLevels = [...levels];
                                                                        const l = newLevels.find(nl => nl.id === level.id);
                                                                        if (l) l.diasParaDesbloquear = val;
                                                                        setLevels(newLevels);
                                                                    }
                                                                }}
                                                                onBlur={() => updateLevelSettings(level.id, {
                                                                    bloqueadoManual: level.bloqueadoManual as any,
                                                                    diasParaDesbloquear: level.diasParaDesbloquear ?? 7
                                                                })}
                                                            />
                                                        </div>
                                                    </TabsContent>
                                                    <TabsContent value="locked" className="mt-2 text-center">
                                                        <p className="text-[9px] font-bold text-red-500 uppercase">Bloqueado para todos</p>
                                                    </TabsContent>
                                                    <TabsContent value="unlocked" className="mt-2 text-center">
                                                        <p className="text-[9px] font-bold text-emerald-600 uppercase">Disponible ahora</p>
                                                    </TabsContent>
                                                </Tabs>
                                            </div>

                                            <div className="flex flex-wrap items-center justify-between gap-4 mt-2">
                                                <p className="text-sm text-slate-500 font-medium">
                                                    {level.contents?.length || 0} contenido(s)
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-xs h-7 border-blue-200 text-blue-700 hover:bg-blue-50"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setEditingRagLevelId(level.id);
                                                        }}
                                                    >
                                                        Guía RAG
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-xs h-7 border-cyan-200 text-cyan-700 hover:bg-cyan-50"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setEditingHaLevelId(level.id);
                                                        }}
                                                    >
                                                        Hito HA
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-xs h-7 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setEditingPimLevelId(level.id);
                                                        }}
                                                    >
                                                        Proy PIM
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-xs h-7 border-green-200 text-green-700 hover:bg-green-50"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setEditingAttendanceLevelId(level.id);
                                                        }}
                                                    >
                                                        <UserCheck className="w-3 h-3 mr-1" /> Asistencia
                                                    </Button>
                                                </div>
                                            </div>

                                            {level.contents && level.contents.length > 0 && (
                                                <div className="mt-3 space-y-2">
                                                    {level.contents.map((content) => (
                                                        <div key={content.id} className="flex items-center justify-between bg-white p-2 rounded border">
                                                            <div className="flex items-center gap-2">
                                                                {getContentIcon(content.tipo)}
                                                                <span className="text-sm">
                                                                    {content.tituloEjercicio || (content.tipo ? content.tipo.toUpperCase() : 'CONTENIDO')}
                                                                </span>
                                                            </div>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    deleteContent(content.id);
                                                                }}
                                                            >
                                                                <Trash2 className="w-4 h-4 text-red-500" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Right: Add Content */}
                <Card>
                    <CardHeader>
                        <CardTitle>Agregar Contenido</CardTitle>
                        {selectedLevel && (
                            <p className="text-sm text-slate-500">
                                Nivel seleccionado: {levels.find(l => l.id === selectedLevel)?.tituloNivel}
                            </p>
                        )}
                    </CardHeader>
                    <CardContent>
                        {!selectedLevel ? (
                            <p className="text-slate-400 text-center py-8">Selecciona un nivel para agregar contenido</p>
                        ) : (
                            <Tabs value={contentType} onValueChange={setContentType}>
                                <TabsList className="grid w-full grid-cols-3">
                                    <TabsTrigger value="link">
                                        <LinkIcon className="w-4 h-4 mr-2" />
                                        Enlace
                                    </TabsTrigger>
                                    <TabsTrigger value="file">
                                        <Upload className="w-4 h-4 mr-2" />
                                        Archivo
                                    </TabsTrigger>
                                    <TabsTrigger value="codigo_lab">
                                        <Code className="w-4 h-4 mr-2" />
                                        Código
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="link" className="space-y-4">
                                    <div>
                                        <Label>Tipo de Recurso</Label>
                                        <Select value={contentType} onValueChange={setContentType}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="link">Enlace Web</SelectItem>
                                                <SelectItem value="video">Video (YouTube, etc)</SelectItem>
                                                <SelectItem value="pdf">PDF (URL)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>URL del Recurso</Label>
                                        <Input
                                            value={contentUrl}
                                            onChange={(e) => setContentUrl(e.target.value)}
                                            placeholder="https://..."
                                        />
                                    </div>
                                    <Button onClick={addContent} className="w-full">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Agregar Enlace
                                    </Button>
                                </TabsContent>

                                <TabsContent value="file" className="space-y-4">
                                    <div>
                                        <Label>Seleccionar de Biblioteca</Label>
                                        <div className="mt-2">
                                            {resourcesLoading ? (
                                                <p className="text-sm text-slate-400">Cargando recursos...</p>
                                            ) : (
                                                <Select
                                                    value={contentUrl}
                                                    onValueChange={(val) => {
                                                        const res = resources.find(r => r.url === val);
                                                        if (res) {
                                                            setContentUrl(res.url);
                                                            // Normalize type detection
                                                            const typeLower = (res.tipo || '').toLowerCase();
                                                            const urlLower = res.url.toLowerCase();

                                                            const isPdf = urlLower.endsWith('.pdf') || typeLower.includes('pdf');
                                                            const isVideo = urlLower.endsWith('.mp4') || typeLower.includes('video');
                                                            const isImage = /\.(jpg|jpeg|png|gif|webp)$/.test(urlLower) || typeLower.includes('image');

                                                            // Update tab selection based on type
                                                            if (isPdf) setContentType('pdf'); // Note: This might need to be 'file' depending on tab logic, but usually we want specific type
                                                            else if (isVideo) setContentType('video'); // If you have a video tab
                                                            else if (isImage) setContentType('image'); // If you have image support
                                                            else setContentType('file');
                                                        }
                                                    }}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecciona un archivo..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {resources.length === 0 ? (
                                                            <SelectItem value="none" disabled>No hay archivos subidos</SelectItem>
                                                        ) : (
                                                            resources.map((r: any) => (
                                                                <SelectItem key={r.id} value={r.url}>
                                                                    {r.nombre || r.url.split('/').pop()}
                                                                </SelectItem>
                                                            ))
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            )}

                                            <div className="mt-4 p-4 bg-slate-50 rounded border border-slate-100">
                                                <p className="text-sm text-slate-500 mb-2">¿No encuentras el archivo?</p>
                                                <Button variant="outline" size="sm" onClick={() => setLocation("/files")} className="w-full">
                                                    Ir al Gestor de Archivos (Subir Nuevo)
                                                </Button>
                                            </div>

                                            {contentUrl && (
                                                <p className="text-sm text-green-600 mt-2 text-center break-all">
                                                    Seleccionado: {contentUrl.split('/').pop()}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <Button onClick={() => {
                                        if (!contentUrl) {
                                            toast({ title: "Error", description: "Selecciona un recurso", variant: "destructive" });
                                            return;
                                        }
                                        addContent();
                                    }} className="w-full">
                                        <Upload className="w-4 h-4 mr-2" />
                                        Asignar Archivo Seleccionado
                                    </Button>
                                </TabsContent>

                                <TabsContent value="codigo_lab" className="space-y-4">
                                    <div>
                                        <Label>Título del Ejercicio</Label>
                                        <Input
                                            value={exerciseTitle}
                                            onChange={(e) => setExerciseTitle(e.target.value)}
                                            placeholder="Ej: Crear una función que sume dos números"
                                        />
                                    </div>
                                    <div>
                                        <Label>Descripción/Instrucciones</Label>
                                        <Textarea
                                            value={exerciseDescription}
                                            onChange={(e) => setExerciseDescription(e.target.value)}
                                            placeholder="Explica qué debe hacer el estudiante..."
                                            rows={3}
                                        />
                                    </div>
                                    <div>
                                        <Label>Lenguaje de Programación</Label>
                                        <Select value={language} onValueChange={setLanguage}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="javascript">JavaScript</SelectItem>
                                                <SelectItem value="python">Python</SelectItem>
                                                <SelectItem value="java">Java</SelectItem>
                                                <SelectItem value="cpp">C++</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>Código Inicial (Starter Code)</Label>
                                        <Textarea
                                            value={starterCode}
                                            onChange={(e) => setStarterCode(e.target.value)}
                                            placeholder="// Código que verá el estudiante al iniciar"
                                            rows={6}
                                            className="font-mono text-sm"
                                        />
                                    </div>
                                    <div>
                                        <Label>Código Esperado (Solución de Referencia)</Label>
                                        <Textarea
                                            value={expectedCode}
                                            onChange={(e) => setExpectedCode(e.target.value)}
                                            placeholder="// Solución de referencia (opcional)"
                                            rows={6}
                                            className="font-mono text-sm"
                                        />
                                    </div>
                                    <Button onClick={addContent} className="w-full">
                                        <Code className="w-4 h-4 mr-2" />
                                        Crear Ejercicio de Código
                                    </Button>
                                </TabsContent>
                            </Tabs>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
