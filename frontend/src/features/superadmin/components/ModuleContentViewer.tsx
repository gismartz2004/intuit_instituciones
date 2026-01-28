import { useState, useEffect } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Eye, FileText, Target, Layers, ArrowLeft } from 'lucide-react';
import { superadminApi, ModuleContent } from '../services/superadmin.api';

interface ModuleContentViewerProps {
    moduleId: number;
    onClose: () => void;
    isInline?: boolean;
}

export function ModuleContentViewer({ moduleId, onClose, isInline = false }: ModuleContentViewerProps) {
    const [content, setContent] = useState<ModuleContent | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadContent();
    }, [moduleId]);

    const loadContent = async () => {
        setLoading(true);
        try {
            const data = await superadminApi.getModuleContent(moduleId);
            setContent(data);
        } catch (error) {
            console.error('Error loading module content:', error);
        } finally {
            setLoading(false);
        }
    };

    const ContentBody = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {isInline && (
                        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                            <ArrowLeft className="w-5 h-5 text-slate-500" />
                        </Button>
                    )}
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">{content?.module.nombreModulo || 'Cargando...'}</h2>
                        <p className="text-sm text-slate-500">Visualización de contenido pedagógico</p>
                    </div>
                </div>
                <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100">
                    <Eye className="w-3 h-3 mr-1" />
                    Solo Lectura
                </Badge>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-24">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0047AB]"></div>
                </div>
            ) : (
                <ScrollArea className={`${isInline ? 'h-full' : 'h-[60vh]'} pr-4`}>
                    <Accordion type="multiple" className="space-y-3">
                        {content?.levels.map((level, idx) => (
                            <AccordionItem
                                value={`level-${level.id}`}
                                key={level.id}
                                className="border-2 border-slate-100 rounded-xl px-4 bg-white overflow-hidden"
                            >
                                <AccordionTrigger className="hover:no-underline py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs">
                                            {idx + 1}
                                        </div>
                                        <span className="font-bold text-slate-700">{level.nombreNivel}</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="pb-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                                        {/* RAG Templates */}
                                        {level.rag && level.rag.length > 0 && (
                                            <Card className="border-slate-100 shadow-sm">
                                                <CardHeader className="pb-2">
                                                    <CardTitle className="text-xs uppercase tracking-wider text-slate-400 flex items-center gap-2">
                                                        <FileText className="w-3 h-3 text-blue-500" />
                                                        RAG ({level.rag.length})
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="space-y-2">
                                                    {level.rag.map((rag: any) => (
                                                        <div key={rag.id} className="p-2 bg-blue-50/50 rounded-lg">
                                                            <p className="font-bold text-xs text-slate-700">{rag.nombreActividad}</p>
                                                            <p className="text-[10px] text-slate-500 mt-0.5">{rag.tipoRag}</p>
                                                        </div>
                                                    ))}
                                                </CardContent>
                                            </Card>
                                        )}

                                        {/* HA Templates */}
                                        {level.ha && level.ha.length > 0 && (
                                            <Card className="border-slate-100 shadow-sm">
                                                <CardHeader className="pb-2">
                                                    <CardTitle className="text-xs uppercase tracking-wider text-slate-400 flex items-center gap-2">
                                                        <Target className="w-3 h-3 text-green-500" />
                                                        HA ({level.ha.length})
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="space-y-2">
                                                    {level.ha.map((ha: any) => (
                                                        <div key={ha.id} className="p-2 bg-green-50/50 rounded-lg">
                                                            <p className="font-bold text-xs text-slate-700">{ha.fase}</p>
                                                            <p className="text-[10px] text-slate-500 mt-0.5 truncate">{ha.objetivo}</p>
                                                        </div>
                                                    ))}
                                                </CardContent>
                                            </Card>
                                        )}

                                        {/* PIM Templates */}
                                        {level.pim && level.pim.length > 0 && (
                                            <Card className="border-slate-100 shadow-sm">
                                                <CardHeader className="pb-2">
                                                    <CardTitle className="text-xs uppercase tracking-wider text-slate-400 flex items-center gap-2">
                                                        <Layers className="w-3 h-3 text-purple-500" />
                                                        PIM ({level.pim.length})
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="space-y-2">
                                                    {level.pim.map((pim: any) => (
                                                        <div key={pim.id} className="p-2 bg-purple-50/50 rounded-lg">
                                                            <p className="font-bold text-xs text-slate-700">{pim.tituloProyecto}</p>
                                                            <p className="text-[10px] text-slate-500 mt-0.5">{pim.anioNivel}</p>
                                                        </div>
                                                    ))}
                                                </CardContent>
                                            </Card>
                                        )}
                                    </div>

                                    {(!level.rag || level.rag.length === 0) &&
                                        (!level.ha || level.ha.length === 0) &&
                                        (!level.pim || level.pim.length === 0) && (
                                            <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                                <p className="text-xs text-slate-400">Sin contenido en este nivel</p>
                                            </div>
                                        )}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </ScrollArea>
            )}
        </div>
    );

    if (isInline) {
        return <ContentBody />;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
                <CardContent className="p-6">
                    <ContentBody />
                </CardContent>
            </Card>
        </div>
    );
}
