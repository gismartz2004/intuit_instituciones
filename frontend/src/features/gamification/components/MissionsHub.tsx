
import { useEffect, useState } from "react";
import { studentApi } from "@/features/student/services/student.api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Trophy, Star, Target, Zap, Gift, Shield, CheckCircle2, Lock } from "lucide-react";
import { motion } from "framer-motion";

export default function MissionsHub() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);
    const [missions, setMissions] = useState<any[]>([]);
    const [claiming, setClaiming] = useState<number | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const userStr = localStorage.getItem('edu_user');
            let studentId = 1;
            if (userStr) {
                try {
                    const user = JSON.parse(userStr);
                    studentId = user.id || user.user?.id || 1;
                } catch {
                    studentId = 1;
                }
            }

            // Load gamification stats and missions in parallel
            const [statsData, missionsData] = await Promise.all([
                studentApi.getGamificationStats(studentId),
                studentApi.getAllMissions(studentId)
            ]);

            setStats(statsData);
            setMissions(missionsData || []);
        } catch (err) {
            console.error('Error loading gamification data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleClaimReward = async (missionId: number) => {
        try {
            setClaiming(missionId);
            const userStr = localStorage.getItem('edu_user');
            let studentId = 1;
            if (userStr) {
                try {
                    const user = JSON.parse(userStr);
                    studentId = user.id || user.user?.id || 1;
                } catch {
                    studentId = 1;
                }
            }

            const result = await studentApi.claimMissionReward(studentId, missionId);

            if (result.success) {
                // Reload data to reflect changes
                await loadData();
                // Could show a toast notification here
                console.log(`¡Recompensa reclamada! +${result.xpAwarded} XP`);
            }
        } catch (err) {
            console.error('Error claiming mission reward:', err);
        } finally {
            setClaiming(null);
        }
    };

    // Separate missions by type
    const dailyMissions = missions.filter(m => m.esDiaria);
    const campaignMissions = missions.filter(m => !m.esDiaria);

    if (loading) {
        return <div className="container mx-auto p-8 text-center">Cargando misiones...</div>;
    }

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-8 pb-24">
            {/* Header with Stats */}
            <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-center md:text-left">
                        <h1 className="text-4xl font-black mb-2 flex items-center gap-3 justify-center md:justify-start">
                            <Trophy className="w-10 h-10 text-yellow-400" /> Centro de Misiones
                        </h1>
                        <p className="text-indigo-200 text-lg">Completa desafíos para ganar XP y subir de nivel.</p>
                    </div>

                    <div className="flex gap-4">
                        <Card className="bg-white/10 border-white/20 text-white backdrop-blur-sm">
                            <CardContent className="p-4 text-center">
                                <p className="text-sm text-indigo-200 uppercase tracking-wider font-bold">Nivel Actual</p>
                                <p className="text-3xl font-black">{stats?.nivelActual || 1}</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-white/10 border-white/20 text-white backdrop-blur-sm">
                            <CardContent className="p-4 text-center">
                                <p className="text-sm text-indigo-200 uppercase tracking-wider font-bold">XP Total</p>
                                <p className="text-3xl font-black text-yellow-300">{stats?.totalPoints || 0}</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="daily" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-[400px] mb-6 mx-auto md:mx-0">
                    <TabsTrigger value="daily">Diarias</TabsTrigger>
                    <TabsTrigger value="campaign">Campaña</TabsTrigger>
                </TabsList>

                <TabsContent value="daily" className="space-y-4">
                    <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Zap className="w-6 h-6 text-orange-500" /> Misiones Diarias
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {dailyMissions.length === 0 ? (
                            <p className="text-slate-500 col-span-2">No hay misiones diarias disponibles</p>
                        ) : (
                            dailyMissions.map((mission, idx) => (
                                <motion.div
                                    key={mission.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                >
                                    <Card className={`border-l-4 ${mission.completada ? 'border-l-green-500 bg-green-50/50' : 'border-l-slate-300'}`}>
                                        <CardContent className="p-4 md:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                            <div className="flex-1">
                                                <h3 className="font-bold text-lg text-slate-800">{mission.titulo}</h3>
                                                <p className="text-slate-600 text-sm">{mission.descripcion}</p>
                                                {mission.objetivoValor > 1 && (
                                                    <div className="mt-2">
                                                        <Progress value={(mission.progresoActual / mission.objetivoValor) * 100} className="h-2" />
                                                        <p className="text-xs text-slate-500 mt-1">{mission.progresoActual} / {mission.objetivoValor}</p>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">+{mission.xpRecompensa} XP</Badge>
                                                {mission.recompensaReclamada ? (
                                                    <Badge className="bg-green-500 text-white"><CheckCircle2 className="w-3 h-3 mr-1" /> Reclamado</Badge>
                                                ) : mission.completada ? (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleClaimReward(mission.id)}
                                                        disabled={claiming === mission.id}
                                                    >
                                                        {claiming === mission.id ? 'Reclamando...' : 'Reclamar'}
                                                    </Button>
                                                ) : (
                                                    <Badge variant="outline">En progreso</Badge>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="campaign" className="space-y-4">
                    <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Target className="w-6 h-6 text-indigo-500" /> Misiones de Campaña
                    </h2>
                    <div className="grid grid-cols-1 gap-4">
                        {campaignMissions.length === 0 ? (
                            <p className="text-slate-500">No hay misiones de campaña disponibles</p>
                        ) : (
                            campaignMissions.map((mission, idx) => (
                                <motion.div
                                    key={mission.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                >
                                    <Card className={`overflow-hidden transition-all ${mission.completada ? 'opacity-70 bg-slate-50' : 'hover:shadow-md'}`}>
                                        <div className="flex flex-col md:flex-row">
                                            <div className={`w-full md:w-24 flex items-center justify-center p-6 ${mission.completada ? 'bg-slate-200' : 'bg-indigo-100'}`}>
                                                {mission.completada ? <CheckCircle2 className="w-10 h-10 text-slate-400" /> : <Target className="w-10 h-10 text-indigo-600" />}
                                            </div>
                                            <CardContent className="p-6 flex-1 flex justify-between items-center">
                                                <div className="flex-1">
                                                    <h3 className={`font-bold text-xl ${mission.completada ? 'text-slate-500 line-through' : 'text-slate-800'}`}>{mission.titulo}</h3>
                                                    <p className="text-slate-600 mb-2">{mission.descripcion}</p>
                                                    {mission.objetivoValor > 1 && (
                                                        <div className="mt-2 max-w-md">
                                                            <Progress value={(mission.progresoActual / mission.objetivoValor) * 100} className="h-2" />
                                                            <p className="text-xs text-slate-500 mt-1">{mission.progresoActual} / {mission.objetivoValor}</p>
                                                        </div>
                                                    )}
                                                    <div className="flex gap-2 mt-2">
                                                        <Badge variant="outline" className="border-indigo-200 text-indigo-700">Recompensa: {mission.xpRecompensa} XP</Badge>
                                                    </div>
                                                </div>

                                                <div>
                                                    {mission.recompensaReclamada ? (
                                                        <Button disabled variant="ghost">Reclamado</Button>
                                                    ) : mission.completada ? (
                                                        <Button
                                                            className="bg-indigo-600 hover:bg-indigo-700"
                                                            onClick={() => handleClaimReward(mission.id)}
                                                            disabled={claiming === mission.id}
                                                        >
                                                            {claiming === mission.id ? 'Reclamando...' : 'Reclamar'}
                                                        </Button>
                                                    ) : (
                                                        <Badge variant="outline">En progreso</Badge>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </div>
                                        {!mission.completada && mission.objetivoValor > 1 && (
                                            <div className="h-1 w-full bg-indigo-100">
                                                <div className="h-full bg-indigo-500" style={{ width: `${(mission.progresoActual / mission.objetivoValor) * 100}%` }} />
                                            </div>
                                        )}
                                    </Card>
                                </motion.div>
                            ))
                        )}
                    </div>
                </TabsContent>
            </Tabs>

            {/* Rewards Shop Teaser */}
            <div className="mt-12">
                <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <Gift className="w-6 h-6 text-pink-500" /> Recompensas Desbloqueables
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Card key={i} className="group relative overflow-hidden border-dashed border-2">
                            <div className="absolute inset-0 bg-slate-100/80 backdrop-blur-[1px] z-10 flex items-center justify-center opacity-100 group-hover:opacity-0 transition-opacity">
                                <Lock className="w-8 h-8 text-slate-400" />
                            </div>
                            <CardContent className="p-6 text-center">
                                <Shield className="w-12 h-12 mx-auto text-purple-400 mb-2" />
                                <p className="font-bold text-slate-700">Skin Exclusiva</p>
                                <p className="text-xs text-slate-500">Nivel {i * 5} requerido</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
