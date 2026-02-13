
import { useEffect, useState } from "react";
import { studentApi } from "@/features/student/services/student.api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Trophy, Star, Target, Zap, Gift, Shield, CheckCircle2, Lock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

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
        <div className="container mx-auto p-4 md:p-8 space-y-8 pb-24 max-w-6xl">
            {/* Header with Stats */}
            <div className="relative p-8 md:p-12 bg-white border border-violet-100 rounded-[3rem] shadow-xl overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Trophy className="w-64 h-64 text-violet-600 transform rotate-12 -mr-12 -mt-12" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="text-center md:text-left space-y-4">
                        <Badge className="bg-violet-100 text-violet-600 border-violet-200 uppercase tracking-widest font-black mb-2">Gamificación</Badge>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tighter uppercase italic">
                            Centro de <span className="text-violet-600">Misiones</span>
                        </h1>
                        <p className="text-slate-500 text-lg font-medium max-w-md">Completa desafíos, reclama recompensas y demuestra que estás listo para subir de nivel.</p>
                    </div>

                    <div className="flex gap-4">
                        <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl text-center min-w-[120px] shadow-sm">
                            <p className="text-xs text-slate-400 uppercase tracking-widest font-black mb-2">Nivel Actual</p>
                            <p className="text-4xl font-black text-slate-800">{stats?.nivelActual || 1}</p>
                        </div>
                        <div className="p-6 bg-violet-600 text-white rounded-3xl text-center min-w-[150px] shadow-lg shadow-violet-200">
                            <p className="text-xs text-violet-200 uppercase tracking-widest font-black mb-2">XP Total</p>
                            <p className="text-4xl font-black">{stats?.totalPoints || 0}</p>
                        </div>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="daily" className="w-full">
                <TabsList className="bg-slate-100 p-1 rounded-2xl w-full max-w-md mx-auto md:mx-0 mb-8">
                    <TabsTrigger
                        value="daily"
                        className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-violet-600 data-[state=active]:shadow-sm font-bold w-1/2 py-3"
                    >
                        Misiones Diarias
                    </TabsTrigger>
                    <TabsTrigger
                        value="campaign"
                        className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-violet-600 data-[state=active]:shadow-sm font-bold w-1/2 py-3"
                    >
                        Campaña Principal
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="daily" className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-amber-100 rounded-xl">
                            <Zap className="w-5 h-5 text-amber-500" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 italic uppercase">Logros Diarios</h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {dailyMissions.length === 0 ? (
                            <div className="col-span-2 text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200">
                                <p className="text-slate-400 font-medium">No hay misiones diarias disponibles por ahora.</p>
                            </div>
                        ) : (
                            dailyMissions.map((mission, idx) => (
                                <motion.div
                                    key={mission.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.1 }}
                                >
                                    <div className={cn(
                                        "relative p-6 rounded-[2rem] border transition-all duration-300 group hover:shadow-lg",
                                        mission.completada
                                            ? "bg-emerald-50 border-emerald-100"
                                            : "bg-white border-slate-100 hover:border-violet-100"
                                    )}>
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="space-y-3 flex-1">
                                                <div className="flex items-center gap-3">
                                                    <Badge variant="outline" className={cn(
                                                        "border-none",
                                                        mission.completada ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-500"
                                                    )}>
                                                        {mission.completada ? "Completada" : "En Progreso"}
                                                    </Badge>
                                                    <h3 className="font-bold text-slate-800 text-lg line-clamp-1">{mission.titulo}</h3>
                                                </div>
                                                <p className="text-slate-500 text-sm leading-relaxed">{mission.descripcion}</p>

                                                {mission.objetivoValor > 1 && (
                                                    <div className="space-y-2 pt-2">
                                                        <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                                                            <span>Progreso</span>
                                                            <span>{mission.progresoActual} / {mission.objetivoValor}</span>
                                                        </div>
                                                        <Progress value={(mission.progresoActual / mission.objetivoValor) * 100} className="h-2 bg-slate-100" />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex flex-col items-end gap-3 min-w-[100px]">
                                                <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-none px-3 py-1 text-xs font-black uppercase tracking-wider">
                                                    +{mission.xpRecompensa} XP
                                                </Badge>

                                                <div className="mt-2">
                                                    {mission.recompensaReclamada ? (
                                                        <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold uppercase tracking-wider">
                                                            <CheckCircle2 className="w-4 h-4" /> Reclamado
                                                        </div>
                                                    ) : mission.completada ? (
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleClaimReward(mission.id)}
                                                            disabled={claiming === mission.id}
                                                            className="bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl shadow-lg shadow-violet-200"
                                                        >
                                                            {claiming === mission.id ? '...' : 'Reclamar'}
                                                        </Button>
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                                                            <Lock className="w-4 h-4 text-slate-300" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="campaign" className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-violet-100 rounded-xl">
                            <Target className="w-5 h-5 text-violet-600" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 italic uppercase">Campaña Principal</h2>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {campaignMissions.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200">
                                <p className="text-slate-400 font-medium">No hay misiones de campaña activas.</p>
                            </div>
                        ) : (
                            campaignMissions.map((mission, idx) => (
                                <motion.div
                                    key={mission.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                >
                                    <div className={cn(
                                        "group bg-white rounded-[2rem] border border-slate-100 p-1 flex flex-col md:flex-row gap-4 hover:border-violet-100 hover:shadow-xl transition-all duration-300",
                                        mission.completada && "opacity-80 bg-slate-50"
                                    )}>
                                        <div className={cn(
                                            "w-full md:w-24 rounded-[1.8rem] flex items-center justify-center p-6 shrink-0 transition-colors",
                                            mission.completada ? "bg-slate-100 text-slate-400" : "bg-violet-50 text-violet-600 group-hover:bg-violet-100"
                                        )}>
                                            {mission.completada ? <CheckCircle2 className="w-8 h-8" /> : <Target className="w-8 h-8" />}
                                        </div>

                                        <div className="flex-1 p-4 md:py-6 md:pr-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                            <div className="space-y-2 flex-1">
                                                <h3 className={cn(
                                                    "font-bold text-xl",
                                                    mission.completada ? "text-slate-500 line-through decoration-2" : "text-slate-800"
                                                )}>{mission.titulo}</h3>
                                                <p className="text-slate-500 leading-relaxed font-medium">{mission.descripcion}</p>

                                                {mission.objetivoValor > 1 && (
                                                    <div className="max-w-xs mt-3">
                                                        <Progress value={(mission.progresoActual / mission.objetivoValor) * 100} className="h-2 bg-slate-100" />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-4 self-end md:self-center">
                                                <div className="text-right hidden md:block">
                                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Recompensa</p>
                                                    <p className="text-violet-600 font-black text-lg">+{mission.xpRecompensa} XP</p>
                                                </div>

                                                {mission.recompensaReclamada ? (
                                                    <Button disabled variant="ghost" className="text-emerald-600 font-bold uppercase tracking-wider text-xs">
                                                        Reclamado
                                                    </Button>
                                                ) : mission.completada ? (
                                                    <Button
                                                        className="bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl shadow-lg shadow-violet-200 px-8"
                                                        onClick={() => handleClaimReward(mission.id)}
                                                        disabled={claiming === mission.id}
                                                    >
                                                        {claiming === mission.id ? '...' : 'RECLAMAR XP'}
                                                    </Button>
                                                ) : (
                                                    <Badge variant="outline" className="border-slate-200 text-slate-400 px-4 py-2">En Progreso</Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </TabsContent>
            </Tabs>

            {/* Rewards Shop Teaser */}
            <div className="mt-16 pt-8 border-t border-slate-100">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                        <Gift className="w-6 h-6 text-pink-500" />
                        <span className="italic uppercase">Recompensas</span>
                    </h2>
                    <Button variant="link" className="text-violet-600 font-bold">Ver Todo <ArrowRight className="w-4 h-4 ml-2" /></Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="group relative bg-white border border-slate-200 rounded-[2rem] p-6 text-center hover:shadow-xl hover:border-violet-100 hover:-translate-y-1 transition-all duration-300">
                            <div className="absolute top-4 right-4">
                                <Lock className="w-4 h-4 text-slate-300 group-hover:text-violet-400 transition-colors" />
                            </div>
                            <div className="w-16 h-16 bg-slate-50 rounded-2xl mx-auto mb-4 flex items-center justify-center group-hover:bg-violet-50 transition-colors">
                                <Shield className="w-8 h-8 text-slate-300 group-hover:text-violet-500 transition-colors" />
                            </div>
                            <p className="font-bold text-slate-700 mb-1 group-hover:text-violet-700">Skin Legendaria</p>
                            <span className="inline-block px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-full group-hover:bg-violet-100 group-hover:text-violet-600 transition-colors">
                                Nivel {i * 5}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

}
