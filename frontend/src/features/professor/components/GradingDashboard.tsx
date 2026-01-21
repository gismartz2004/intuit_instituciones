
import { useEffect, useState } from "react";
import { professorApi } from "@/features/professor/services/professor.api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, FileText, XCircle, Search, Clock, User } from "lucide-react";

export default function GradingDashboard() {
    const [submissions, setSubmissions] = useState<{ rag: any[], ha: any[] }>({ rag: [], ha: [] });
    const [loading, setLoading] = useState(true);
    const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
    const [grade, setGrade] = useState<number>(0);
    const [feedback, setFeedback] = useState("");
    const [isGradeDialogOpen, setIsGradeDialogOpen] = useState(false);

    // Search/Filter state
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const fetchSubmissions = async () => {
        try {
            const data = await professorApi.getSubmissions();
            setSubmissions(data);
        } catch (error) {
            console.error("Error fetching submissions:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleGradeSubmit = async () => {
        if (!selectedSubmission) return;

        try {
            await professorApi.gradeSubmission(selectedSubmission.id, {
                type: selectedSubmission.type,
                grade,
                feedback
            });
            setIsGradeDialogOpen(false);
            fetchSubmissions(); // Refresh list
        } catch (error) {
            console.error("Error submitting grade:", error);
        }
    };

    const openGradeDialog = (sub: any) => {
        setSelectedSubmission(sub);
        setGrade(sub.validated ? 100 : 0); // Default based on previous status or 0
        setFeedback(sub.comment || "");
        setIsGradeDialogOpen(true);
    };

    const filterSubmissions = (list: any[]) => {
        return list.filter(item =>
            item.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.activityTitle.toLowerCase().includes(searchTerm.toLowerCase())
        );
    };

    if (loading) return <div>Cargando entregas...</div>;

    const ragList = filterSubmissions(submissions.rag);
    const haList = filterSubmissions(submissions.ha);

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Calificaciones y Entregas</h1>
                    <p className="text-muted-foreground">Revisa y califica el progreso de los estudiantes en RAG y Hitos de Aprendizaje.</p>
                </div>
            </div>

            <div className="flex items-center gap-2 mb-6">
                <Search className="w-4 h-4 text-gray-500" />
                <Input
                    placeholder="Buscar por estudiante o actividad..."
                    className="max-w-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <Tabs defaultValue="rag" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                    <TabsTrigger value="rag">RAG ({ragList.length})</TabsTrigger>
                    <TabsTrigger value="ha">Hitos de Aprendizaje ({haList.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="rag" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {ragList.map((item) => (
                            <Card key={`rag-${item.id}`} className="hover:shadow-md transition-shadow">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <Badge variant="outline" className="mb-2 bg-blue-50 text-blue-700 border-blue-200">RAG - Paso {item.stepIndex + 1}</Badge>
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> {new Date(item.submittedAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <CardTitle className="text-lg line-clamp-1">{item.activityTitle}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-3 mb-4 p-2 bg-gray-50 rounded-lg">
                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                            <User className="w-4 h-4 text-gray-500" />
                                        </div>
                                        <span className="font-medium text-sm">{item.studentName}</span>
                                    </div>

                                    <div className="space-y-3">
                                        <p className="text-sm text-gray-600 truncate">
                                            Archivo: <a href={item.fileUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{item.typeArchivo || 'Ver archivo'}</a>
                                        </p>

                                        <Button onClick={() => openGradeDialog({ ...item, type: 'rag' })} className="w-full" variant="secondary">
                                            Calificar / Feedback
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                        {ragList.length === 0 && <p className="text-muted-foreground col-span-full text-center py-8">No hay entregas pendientes.</p>}
                    </div>
                </TabsContent>

                <TabsContent value="ha" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {haList.map((item) => (
                            <Card key={`ha-${item.id}`} className="hover:shadow-md transition-shadow">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <Badge variant="outline" className="mb-2 bg-purple-50 text-purple-700 border-purple-200">Hito de Aprendizaje</Badge>
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> {new Date(item.submittedAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <CardTitle className="text-lg line-clamp-1">{item.activityTitle}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-3 mb-4 p-2 bg-gray-50 rounded-lg">
                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                            <User className="w-4 h-4 text-gray-500" />
                                        </div>
                                        <span className="font-medium text-sm">{item.studentName}</span>
                                    </div>

                                    <div className="space-y-2 mb-4">
                                        {JSON.parse(item.files || '[]').map((url: string, i: number) => (
                                            <a key={i} href={url} target="_blank" rel="noreferrer" className="text-xs flex items-center gap-1 text-blue-600 hover:underline border rounded px-2 py-1">
                                                <FileText className="w-3 h-3" /> Evidencia {i + 1}
                                            </a>
                                        ))}
                                    </div>

                                    {item.comment && (
                                        <div className="mb-4 text-sm bg-yellow-50 p-2 rounded border border-yellow-100 text-yellow-800 italic">
                                            "{item.comment}"
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between gap-2">
                                        {item.validated ?
                                            <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none"><CheckCircle2 className="w-3 h-3 mr-1" /> Aprobado</Badge> :
                                            <Badge variant="secondary">Pendiente</Badge>
                                        }
                                        <Button size="sm" onClick={() => openGradeDialog({ ...item, type: 'ha' })}>
                                            Evaluar
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                        {haList.length === 0 && <p className="text-muted-foreground col-span-full text-center py-8">No hay hitos pendientes.</p>}
                    </div>
                </TabsContent>
            </Tabs>

            <Dialog open={isGradeDialogOpen} onOpenChange={setIsGradeDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Calificar Entrega</DialogTitle>
                        <CardDescription>
                            Evaluando a <strong>{selectedSubmission?.studentName}</strong> en {selectedSubmission?.activityTitle}
                        </CardDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <label htmlFor="grade" className="text-sm font-medium">Calificación (0-100)</label>
                            <Input
                                id="grade"
                                type="number"
                                value={grade}
                                onChange={(e) => setGrade(Number(e.target.value))}
                                min={0}
                                max={100}
                            />
                        </div>
                        <div className="grid gap-2">
                            <label htmlFor="feedback" className="text-sm font-medium">Feedback para el estudiante</label>
                            <Textarea
                                id="feedback"
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                placeholder="Escribe comentarios constructivos..."
                                rows={4}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setIsGradeDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleGradeSubmit}>Guardar Evaluación</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
