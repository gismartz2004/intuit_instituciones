
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
    const [progress, setProgress] = useState<any>(null);

    useEffect(() => {
        // Determine student ID (mock or from auth)
        const userStr = localStorage.getItem('arg_user');
        const studentId = userStr ? JSON.parse(userStr).id : 1;

        studentApi.getProgress(studentId)
            .then(data => setProgress(data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const missions = [
        { title: "Primeros Pasos", description: "Completa tu primer nivel", reward: 100, icon: <Star className="w-5 h-5 text-yellow-500" />, completed: (progress?.completedLevels || 0) > 0 },
        { title: "Racha de Fuego", description: "Ingresa 3 días seguidos", reward: 50, icon: <Zap className="w-5 h-5 text-orange-500" />, completed: true },
        { title: "Explorador RAG", description: "Completa una guía RAG", reward: 200, icon: <Target className="w-5 h-5 text-blue-500" />, completed: false },
        { title: "Maestro de Hitos", description: "Aprueba un Hito de Aprendizaje", reward: 300, icon: <Trophy className="w-5 h-5 text-purple-500" />, completed: false },
    ];

    const dailyMissions = [
        { title: "Login Diario", description: "Ingresa a la plataforma", reward: 10, completed: true },
        { title: "Revisar un recurso", description: "Abre un material de lectura", reward: 20, completed: false },
    ];

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
                                <p className="text-3xl font-black">{progress?.completedLevels || 1}</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-white/10 border-white/20 text-white backdrop-blur-sm">
                            <CardContent className="p-4 text-center">
                                <p className="text-sm text-indigo-200 uppercase tracking-wider font-bold">XP Total</p>
                                <p className="text-3xl font-black text-yellow-300">{progress?.totalPoints || 0}</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="daily" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-[400px] mb-6">
                    <TabsTrigger value="daily">Diarias</TabsTrigger>
                    <TabsTrigger value="campaign">Campaña</TabsTrigger>
                </TabsList>

                <TabsContent value="daily" className="space-y-4">
                    <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Zap className="w-6 h-6 text-orange-500" /> Misiones Diarias
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {dailyMissions.map((mission, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <Card className={`border-l-4 ${mission.completed ? 'border-l-green-500 bg-green-50/50' : 'border-l-slate-300'}`}>
                                    <CardContent className="p-6 flex justify-between items-center">
                                        <div>
                                            <h3 className="font-bold text-lg text-slate-800">{mission.title}</h3>
                                            <p className="text-slate-600">{mission.description}</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">+{mission.reward} XP</Badge>
                                            {mission.completed ?
                                                <Badge className="bg-green-500 text-white"><CheckCircle2 className="w-3 h-3 mr-1" /> Completado</Badge> :
                                                <Button size="sm" variant="outline">Ir</Button>
                                            }
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="campaign" className="space-y-4">
                    <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Target className="w-6 h-6 text-indigo-500" /> Misiones de Campaña
                    </h2>
                    <div className="grid grid-cols-1 gap-4">
                        {missions.map((mission, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <Card className={`overflow-hidden transition-all ${mission.completed ? 'opacity-70 bg-slate-50' : 'hover:shadow-md'}`}>
                                    <div className="flex flex-col md:flex-row">
                                        <div className={`w-full md:w-24 flex items-center justify-center p-6 ${mission.completed ? 'bg-slate-200' : 'bg-indigo-100'}`}>
                                            {mission.completed ? <CheckCircle2 className="w-10 h-10 text-slate-400" /> : mission.icon}
                                        </div>
                                        <CardContent className="p-6 flex-1 flex justify-between items-center">
                                            <div>
                                                <h3 className={`font-bold text-xl ${mission.completed ? 'text-slate-500 line-through' : 'text-slate-800'}`}>{mission.title}</h3>
                                                <p className="text-slate-600 mb-2">{mission.description}</p>
                                                <div className="flex gap-2">
                                                    <Badge variant="outline" className="border-indigo-200 text-indigo-700">Recompensa: {mission.reward} XP</Badge>
                                                </div>
                                            </div>

                                            <div>
                                                {mission.completed ?
                                                    <Button disabled variant="ghost">Reclamado</Button> :
                                                    <Button className="bg-indigo-600 hover:bg-indigo-700">Completar</Button>
                                                }
                                            </div>
                                        </CardContent>
                                    </div>
                                    {!mission.completed && (
                                        <div className="h-1 w-full bg-indigo-100">
                                            <div className="h-full bg-indigo-500" style={{ width: '0%' }} />
                                        </div>
                                    )}
                                </Card>
                            </motion.div>
                        ))}
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
