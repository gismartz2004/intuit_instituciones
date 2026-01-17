import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, FileText, Video, Link as LinkIcon, Code, Play, Download, ExternalLink, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { studentApi } from "../services/student.api";

interface Content {
    id: number;
    tipo: string;
    urlRecurso: string;
    tituloEjercicio?: string;
    descripcionEjercicio?: string;
    codigoInicial?: string;
    lenguaje?: string;
}

export default function LevelViewer() {
    const [match, params] = useRoute("/level/:levelId");
    const [, setLocation] = useLocation();
    const [contents, setContents] = useState<Content[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedContent, setSelectedContent] = useState<Content | null>(null);
    const [userCode, setUserCode] = useState("");

    const levelId = match && params ? (params as any).levelId : null;

    useEffect(() => {
        if (levelId) {
            fetchLevelContents();
        }
    }, [levelId]);

    const fetchLevelContents = async () => {
        try {
            const data = await studentApi.getLevelContents(levelId);
            // Map API response to Component State (Content)
            // Map API response to Component State (Content)
            const mappedData: Content[] = data.map((item: any) => {
                const rawType = item.tipoContenido || item.tipo || 'unknown';
                const lowerType = String(rawType).toLowerCase();

                console.log('Processing item:', { id: item.id, rawType, lowerType, content: item });

                let normalizedType = 'unknown';

                // Normalize content types (Order matters!)
                if (lowerType.includes('pdf')) normalizedType = 'pdf';
                else if (lowerType.includes('video') || lowerType.includes('mp4') || lowerType.includes('mov')) normalizedType = 'video';
                else if (lowerType.includes('image') || lowerType.includes('jpg') || lowerType.includes('png') || lowerType.includes('jpeg') || lowerType.includes('gif')) normalizedType = 'image';
                else if (lowerType.includes('link') || lowerType.startsWith('http')) normalizedType = 'link';
                else if (lowerType.includes('code') || lowerType.includes('lab') || lowerType.includes('ejercicio')) normalizedType = 'codigo_lab';

                // Fallback: If we couldn't normalize but we have a raw type, use it (might be 'file' or similar)
                if (normalizedType === 'unknown' && rawType !== 'unknown') {
                    normalizedType = rawType;
                }

                return {
                    id: item.id,
                    tipo: normalizedType,
                    urlRecurso: item.contenido || item.urlRecurso,
                    tituloEjercicio: item.titulo || item.tituloEjercicio || 'Sin Título',
                    descripcionEjercicio: item.descripcion || item.descripcionEjercicio || '',
                    codigoInicial: item.codigoInicial,
                    lenguaje: item.lenguaje
                };
            });

            setContents(mappedData);
            if (mappedData.length > 0) {
                setSelectedContent(mappedData[0]);
                if (mappedData[0].codigoInicial) {
                    setUserCode(mappedData[0].codigoInicial);
                }
            }
            setLoading(false);
        } catch (error) {
            console.error("Error fetching level contents:", error);
            setLoading(false);
        }
    };

    const getContentIcon = (tipo: string) => {
        switch (tipo) {
            case 'pdf': return <FileText className="w-5 h-5" />;
            case 'video': return <Video className="w-5 h-5" />;
            case 'link': return <LinkIcon className="w-5 h-5" />;
            case 'codigo_lab': return <Code className="w-5 h-5" />;
            default: return <FileText className="w-5 h-5" />;
        }
    };

    const getContentColor = (tipo: string) => {
        switch (tipo) {
            case 'pdf': return 'from-red-500 to-pink-500';
            case 'video': return 'from-purple-500 to-blue-500';
            case 'link': return 'from-blue-500 to-cyan-500';
            case 'codigo_lab': return 'from-green-500 to-emerald-500';
            default: return 'from-slate-500 to-gray-500';
        }
    };

    const renderContentViewer = () => {
        if (!selectedContent) return (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200">
                <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                    <FileText className="w-8 h-8 text-slate-300" />
                </div>
                <p>Selecciona un contenido del menú lateral para visualizarlo.</p>
            </div>
        );

        // Special RAG View Handling
        if (selectedContent.tipo === 'rag') {
            return (
                <div className="h-full overflow-y-auto p-4 custom-scrollbar">
                    <RagViewer levelId={levelId} />
                </div>
            );
        }

        switch (selectedContent.tipo?.toLowerCase()) {
            case 'video':
                return (
                    <div className="space-y-4">
                        <div className="aspect-video bg-slate-900 rounded-2xl overflow-hidden shadow-2xl">
                            <iframe
                                src={selectedContent.urlRecurso}
                                className="w-full h-full"
                                allowFullScreen
                            />
                        </div>
                    </div>
                );

            case 'pdf':
                return (
                    <div className="h-full flex flex-col gap-2">
                        {/* Simulation of reading progress */}
                        <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
                            <motion.div
                                className="bg-green-500 h-2 rounded-full"
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 10, ease: "linear" }}
                            />
                        </div>
                        <div className="text-right text-xs text-slate-500 mb-2">
                            Leído 100%
                        </div>

                        <div className="w-full bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 shadow-sm" style={{ height: '80vh' }}>
                            <iframe
                                src={`${selectedContent.urlRecurso}#toolbar=0&navpanes=0&scrollbar=1`}
                                className="w-full h-full border-0"
                                title="PDF Viewer"
                            />
                        </div>
                    </div>
                );

            case 'link':
                return (
                    <div className="space-y-4">
                        <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-slate-200">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center">
                                    <LinkIcon className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800">Recurso Externo</h3>
                                    <p className="text-slate-500 text-sm break-all">{selectedContent.urlRecurso}</p>
                                </div>
                            </div>
                            <Button
                                onClick={() => window.open(selectedContent.urlRecurso, '_blank')}
                                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                            >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Abrir Enlace
                            </Button>
                        </div>
                    </div>
                );

            case 'image':
                return (
                    <div className="h-full flex flex-col justify-center items-center bg-slate-900 rounded-2xl p-4">
                        <img
                            src={selectedContent.urlRecurso}
                            alt={selectedContent.tituloEjercicio || "Recurso de imagen"}
                            className="max-h-full max-w-full object-contain rounded-lg shadow-2xl"
                        />
                    </div>
                );

            case 'codigo_lab':
                return (
                    <div className="space-y-4">
                        <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                                        <Code className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-2xl">{selectedContent.tituloEjercicio}</CardTitle>
                                        <Badge className="mt-1 bg-green-600">{selectedContent.lenguaje?.toUpperCase()}</Badge>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="bg-white rounded-xl p-4 border-2 border-green-200">
                                    <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                                        <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">📝</span>
                                        Instrucciones
                                    </h4>
                                    <p className="text-slate-600 whitespace-pre-wrap">{selectedContent.descripcionEjercicio}</p>
                                </div>

                                <div>
                                    <Label className="text-sm font-bold text-slate-700 mb-2 block">Tu Código:</Label>
                                    <textarea
                                        value={userCode}
                                        onChange={(e) => setUserCode(e.target.value)}
                                        className="w-full h-64 p-4 font-mono text-sm bg-slate-900 text-green-400 rounded-xl border-2 border-green-300 focus:border-green-500 focus:outline-none resize-none"
                                        placeholder="// Escribe tu código aquí..."
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                                        onClick={() => {
                                            // Aquí iría la lógica para ejecutar/validar el código
                                            alert("Funcionalidad de ejecución de código en desarrollo");
                                        }}
                                    >
                                        <Play className="w-4 h-4 mr-2" />
                                        Ejecutar Código
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setUserCode(selectedContent.codigoInicial || "")}
                                    >
                                        Reiniciar
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                );

            default:
                return (
                    <div className="text-center py-12 text-slate-400">
                        Tipo de contenido no soportado
                    </div>
                );
        }
    };

    if (loading) {
        return <div className="p-8">Cargando contenido...</div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 pb-20">
            <div className="max-w-7xl mx-auto p-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Button variant="ghost" onClick={() => setLocation("/dashboard")}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Volver al Dashboard
                    </Button>
                </div>

                {contents.length === 0 ? (
                    <Card className="border-2">
                        <CardContent className="py-12 text-center">
                            <p className="text-slate-400 text-lg">No hay contenido disponible en este nivel aún</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Left Sidebar - Content List */}
                        <div className="lg:col-span-1">
                            <Card className="sticky top-4">
                                <CardHeader>
                                    <CardTitle className="text-lg">Contenidos del Nivel</CardTitle>
                                    <p className="text-sm text-slate-500">{contents.length} recurso(s)</p>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {contents.map((content, idx) => (
                                        <motion.div
                                            key={content.id}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <Card
                                                className={cn(
                                                    "cursor-pointer transition-all border-2",
                                                    selectedContent?.id === content.id
                                                        ? "border-blue-500 bg-blue-50"
                                                        : "border-slate-200 hover:border-slate-300"
                                                )}
                                                onClick={() => {
                                                    setSelectedContent(content);
                                                    if (content.codigoInicial) {
                                                        setUserCode(content.codigoInicial);
                                                    }
                                                }}
                                            >
                                                <CardContent className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={cn(
                                                            "w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br",
                                                            getContentColor(content.tipo)
                                                        )}>
                                                            <div className="text-white">
                                                                {getContentIcon(content.tipo)}
                                                            </div>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-bold text-sm truncate">
                                                                {content.tituloEjercicio || (content.tipo ? content.tipo.toUpperCase() : 'RECURSO')}
                                                            </p>
                                                            <p className="text-xs text-slate-500">
                                                                {content.tipo === 'codigo_lab' ? 'Ejercicio' : 'Recurso'}
                                                            </p>
                                                        </div>
                                                        {selectedContent?.id === content.id && (
                                                            <CheckCircle className="w-5 h-5 text-blue-500" />
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Main Content Area */}
                        <div className="lg:col-span-3">
                            <motion.div
                                key={selectedContent?.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                {renderContentViewer()}
                            </motion.div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
    return <label className={className}>{children}</label>;
}
