import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Save, ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Content {
    id: string;
    title: string;
    type: string;
    data: string;
}

interface Level {
    id: string;
    title: string;
    contents: Content[];
}

interface Module {
    id: string;
    title: string;
    description: string;
}

export default function CourseEditor() {
    const [match, params] = useRoute("/teach/module/:id");
    const [, setLocation] = useLocation();
    const [module, setModule] = useState<Module | null>(null);
    const [levels, setLevels] = useState<Level[]>([]);
    const [loading, setLoading] = useState(true);

    // Safe ID access
    const moduleId = match && params ? (params as any).id : null;

    useEffect(() => {
        if (moduleId) {
            fetchModuleData(moduleId);
        }
    }, [moduleId]);

    const fetchModuleData = async (id: string) => {
        try {
            const res = await fetch(`/api/modules/${id}`);
            if (res.ok) {
                const data = await res.json();
                setModule(data);
            }

            const levelsRes = await fetch(`/api/modules/${id}/levels`);
            if (levelsRes.ok) {
                const levelsData = await levelsRes.json();
                const levelsWithContent = await Promise.all(levelsData.map(async (l: any) => {
                    const contentRes = await fetch(`/api/modules/levels/${l.id}/contents`);
                    const contentData = contentRes.ok ? await contentRes.json() : [];
                    return { ...l, contents: contentData };
                }));
                setLevels(levelsWithContent);
            }
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const addLevel = async () => {
        if (!module) return;
        try {
            const res = await fetch(`/api/modules/levels`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: "Nuevo Nivel", moduleId: module.id, order: levels.length })
            });
            if (res.ok) {
                const newLevel = await res.json();
                setLevels([...levels, { ...newLevel, contents: [] }]);
            }
        } catch (e) {
            toast({ title: "Error", description: "Error creando nivel" });
        }
    };

    const addContent = async (levelId: string) => {
        try {
            const res = await fetch(`/api/modules/contents`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: "Nuevo Recurso", type: "link", data: "http://...", levelId })
            });
            if (res.ok) {
                const newContent = await res.json();
                const updatedLevels = levels.map(l => {
                    if (l.id === levelId) {
                        return { ...l, contents: [...(l.contents || []), newContent] };
                    }
                    return l;
                });
                setLevels(updatedLevels);
            }
        } catch (e) {
            toast({ title: "Error", description: "Error creando contenido" });
        }
    };

    if (loading) return <div>Cargando editor...</div>;

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => setLocation("/teach")}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Volver
                </Button>
                <h1 className="text-2xl font-bold">{module?.title}</h1>
            </div>

            <div className="space-y-4">
                {levels.map((level, index) => (
                    <Card key={level.id}>
                        <CardHeader className="flex flex-row items-center justify-between py-3">
                            <CardTitle className="text-lg">Nivel {index + 1}: {level.title}</CardTitle>
                            <Button variant="ghost" size="sm" onClick={() => { }}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {level.contents.map(content => (
                                <div key={content.id} className="flex gap-2 items-center p-2 bg-slate-50 rounded border">
                                    <Input defaultValue={content.title} className="max-w-[200px]" />
                                    <Input defaultValue={content.data} placeholder="URL o Contenido" className="flex-1" />
                                    <Button size="icon" variant="ghost"><Trash2 className="w-4 h-4" /></Button>
                                </div>
                            ))}
                            <Button variant="outline" size="sm" onClick={() => addContent(level.id)}>
                                <Plus className="w-4 h-4 mr-2" /> Agregar Contenido
                            </Button>
                        </CardContent>
                    </Card>
                ))}

                <Button onClick={addLevel} className="w-full border-dashed border-2 bg-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-700">
                    <Plus className="w-4 h-4 mr-2" /> Agregar Nivel
                </Button>
            </div>
        </div>
    );
}
