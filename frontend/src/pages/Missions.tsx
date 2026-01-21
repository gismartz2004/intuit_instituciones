import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Target, Flag, ArrowLeft, Play, MapPin, Loader2, AlertCircle } from "lucide-react";
import { studentApi } from "@/features/student/services/student.api";

export default function Missions() {
    const [missions, setMissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const getStudentId = () => {
        const userStr = localStorage.getItem('arg_user');
        if (userStr) {
            try { return JSON.parse(userStr).id; } catch { return 1; }
        }
        return 1;
    };

    useEffect(() => {
        const fetchMissions = async () => {
            try {
                const studentId = getStudentId();
                const data = await studentApi.getMissions(studentId);
                setMissions(data);
            } catch (err) {
                console.error("Error fetching missions", err);
                setError("No se pudieron cargar las misiones. Inténtalo más tarde.");
            } finally {
                setLoading(false);
            }
        };

        fetchMissions();
    }, []);

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="text-center space-y-4">
                <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
                <p className="text-slate-500">Cargando misiones...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 pb-20 p-8">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/dashboard">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="w-6 h-6" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
                            <Target className="w-8 h-8 text-red-500" /> Centro de Misiones
                        </h1>
                        <p className="text-slate-500">Completa misiones para ganar XP y subir de rango.</p>
                    </div>
                </div>

                {/* Error State */}
                {error && (
                    <Card className="bg-red-50 border-red-200">
                        <CardContent className="p-6 flex items-center gap-4 text-red-700">
                            <AlertCircle className="w-6 h-6" />
                            <p>{error}</p>
                        </CardContent>
                    </Card>
                )}

                {/* Empty State */}
                {!loading && !error && missions.length === 0 && (
                    <Card className="bg-slate-100 border-dashed">
                        <CardContent className="p-12 text-center text-slate-500">
                            <Flag className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p>No tienes misiones disponibles por el momento.</p>
                        </CardContent>
                    </Card>
                )}

                {/* Mission List */}
                <div className="grid gap-6">
                    {missions.map((mission) => (
                        <Card key={mission.id} className={`border-2 transition-all ${mission.status === 'locked' ? 'opacity-60 bg-slate-100 border-slate-200' :
                            mission.status === 'active' ? 'border-primary shadow-lg scale-[1.01]' : 'border-green-200 bg-green-50'
                            }`}>
                            <CardContent className="p-6 flex items-start gap-6">

                                {/* Icon */}
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${mission.status === 'locked' ? 'bg-slate-200 text-slate-400' :
                                    mission.status === 'active' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                                    }`}>
                                    <Flag className="w-8 h-8" fill={mission.status === 'completed' ? "currentColor" : "none"} />
                                </div>

                                <div className="flex-1 space-y-2">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-800">{mission.title}</h3>
                                            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mt-1">
                                                <MapPin className="w-3 h-3" /> {mission.location}
                                            </div>
                                        </div>
                                        <Badge variant={
                                            mission.status === 'locked' ? 'secondary' :
                                                mission.status === 'active' ? 'default' : 'outline'
                                        } className="uppercase tracking-wider">
                                            {mission.status === 'active' ? 'En Curso' : mission.status === 'locked' ? 'Bloqueada' : 'Completada'}
                                        </Badge>
                                    </div>

                                    <p className="text-slate-600">{mission.description}</p>

                                    <div className="flex items-center gap-4 pt-2">
                                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-none">
                                            +{mission.xp} XP
                                        </Badge>
                                        <Badge variant="outline" className="border-slate-300 text-slate-500">
                                            Tipo: {mission.type}
                                        </Badge>
                                    </div>
                                </div>

                                {/* Action */}
                                <div className="self-center">
                                    {mission.status !== 'locked' && (
                                        <Link href={`/learn/module/1/level/${mission.id}`}>
                                            <Button size="lg" disabled={mission.status === 'completed'} className={
                                                mission.status === 'active' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                                            }>
                                                {mission.status === 'active' ? (
                                                    <>Continuar <Play className="w-4 h-4 ml-2 fill-current" /></>
                                                ) : (
                                                    <>Repasar</>
                                                )}
                                            </Button>
                                        </Link>
                                    )}
                                </div>

                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
