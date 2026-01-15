import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, ArrowLeft, FileText, Video, Link as LinkIcon, Code, Upload, File } from "lucide-react";
import { toast } from "@/hooks/use-toast";

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
    contents: Content[];
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

    // Content form states
    const [contentType, setContentType] = useState("link");
    const [contentUrl, setContentUrl] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

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
            const modRes = await fetch(`http://localhost:3000/api/modulos/${moduleId}`);
            if (modRes.ok) {
                const modData = await modRes.json();
                setModuleName(modData.nombreModulo);
            }

            const levelsRes = await fetch(`http://localhost:3000/api/professor/modules/${moduleId}/levels`);
            if (levelsRes.ok) {
                const levelsData = await levelsRes.json();
                setLevels(levelsData);
            }
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
            const res = await fetch(`http://localhost:3000/api/professor/modules/${moduleId}/levels`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tituloNivel: newLevelTitle,
                    orden: levels.length + 1
                })
            });

            if (res.ok) {
                toast({ title: "Éxito", description: "Nivel creado correctamente" });
                setNewLevelTitle("");
                setShowLevelDialog(false);
                fetchModuleData();
            }
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
            tipo: contentType
        };

        if (contentType === "codigo_lab") {
            // Code exercise
            if (!exerciseTitle || !exerciseDescription || !starterCode) {
                toast({ title: "Error", description: "Completa todos los campos del ejercicio", variant: "destructive" });
                return;
            }
            payload = {
                ...payload,
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
            const res = await fetch(`http://localhost:3000/api/professor/levels/${selectedLevel}/contents`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                toast({ title: "Éxito", description: "Contenido agregado correctamente" });
                resetContentForm();
                fetchModuleData();
            }
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
            const res = await fetch(`http://localhost:3000/api/professor/contents/${contentId}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                toast({ title: "Éxito", description: "Contenido eliminado" });
                fetchModuleData();
            }
        } catch (error) {
            toast({ title: "Error", description: "No se pudo eliminar", variant: "destructive" });
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (confirm('¿Estás seguro de eliminar este nivel y todo su contenido?')) {
                                                            // Call delete function (needs to be implemented in component body first, but for now assuming it exists or doing fetch directly)
                                                            fetch(`http://localhost:3000/api/professor/levels/${level.id}`, { method: 'DELETE' })
                                                                .then(res => {
                                                                    if (res.ok) {
                                                                        toast({ title: "Nivel eliminado" });
                                                                        fetchModuleData();
                                                                    }
                                                                });
                                                        }
                                                    }}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                            <p className="text-sm text-slate-500">
                                                {level.contents?.length || 0} contenido(s)
                                            </p>
                                            {level.contents && level.contents.length > 0 && (
                                                <div className="mt-3 space-y-2">
                                                    {level.contents.map((content) => (
                                                        <div key={content.id} className="flex items-center justify-between bg-white p-2 rounded border">
                                                            <div className="flex items-center gap-2">
                                                                {getContentIcon(content.tipo)}
                                                                <span className="text-sm">
                                                                    {content.tituloEjercicio || content.tipo.toUpperCase()}
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
                                        <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 bg-slate-50 mt-2">
                                            <p className="text-sm text-slate-500 text-center mb-4">Selecciona un archivo previamente subido</p>
                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    // Here we would ideally open a dialog to select file
                                                    // For MVP, letting them paste the URL or ID from FileSystem page
                                                    const url = prompt("Ingresa la URL del recurso (Cópiala desde 'Sistema de Archivos'):");
                                                    if (url) {
                                                        const isPdf = url.includes('.pdf');
                                                        // Correctly creating a File object mock for the UI state
                                                        // We use a simple object that mimics the File interface property effectively needed here
                                                        const mockFile = {
                                                            name: url.split('/').pop() || "archivo-recurso",
                                                            type: isPdf ? 'application/pdf' : 'application/octet-stream',
                                                            size: 0,
                                                            manualUrl: url
                                                        };

                                                        // Using 'as any' to bypass the strict File type requirement for this specific UI state hack
                                                        setSelectedFile(mockFile as any);
                                                        setContentUrl(url);
                                                    }
                                                }}
                                                className="w-full"
                                            >
                                                <FileText className="w-4 h-4 mr-2" />
                                                Ingresar URL de Recurso
                                            </Button>
                                            {contentUrl && (
                                                <p className="text-sm text-green-600 mt-2 text-center">
                                                    Recurso seleccionado: {contentUrl.split('/').pop()}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <Button onClick={() => {
                                        // Custom addContent logic for library files
                                        if (!contentUrl) {
                                            toast({ title: "Error", description: "Selecciona un recurso", variant: "destructive" });
                                            return;
                                        }
                                        // Reuse addContent but ensure type matches
                                        contentType === 'file' ? setContentType(contentUrl.includes('.pdf') ? 'pdf' : 'file') : null;
                                        setTimeout(addContent, 100);
                                    }} className="w-full">
                                        <Upload className="w-4 h-4 mr-2" />
                                        Asignar Archivo
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
