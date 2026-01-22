import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  User,
  Settings as SettingsIcon,
  Bell,
  Lock,
  Palette,
  Trophy,
  Zap,
  BookOpen,
  Loader2,
  Sparkles,
  Flame,
  ChevronRight
} from "lucide-react";
import { studentApi } from "@/features/student/services/student.api";

interface ProfileProps {
  user: { name: string; role: string; id: string; plan?: string };
}

export default function Profile({ user }: ProfileProps) {
  const [curriculum, setCurriculum] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCurriculum();
  }, [user.id]);

  const loadCurriculum = async () => {
    try {
      setLoading(true);
      const studentId = parseInt(user.id);
      if (!isNaN(studentId)) {
        const data = await studentApi.getCurriculum(studentId);
        setCurriculum(data);
      }
    } catch (error) {
      console.error("Error fetching curriculum:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6 md:space-y-8 pb-24">
      <div className="flex items-center gap-6">
        <div className="w-24 h-24 bg-gradient-to-br from-[#0047AB] to-blue-600 rounded-3xl flex items-center justify-center text-white text-4xl font-black shadow-xl shadow-blue-200 relative overflow-hidden">
          {user.name[0]}
          <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px]" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">{user.name}</h1>
          <div className="flex gap-2 mt-2">
            <Badge className="bg-blue-100 text-[#0047AB] border-none uppercase tracking-widest text-[10px] font-bold">{user.role}</Badge>
            {user.plan && (
              <Badge className="bg-yellow-100 text-yellow-700 border-none uppercase tracking-widest text-[10px] font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Genio {user.plan === '3' ? 'Pro' : user.plan}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-slate-100/50 p-1 border-2 border-slate-100 rounded-xl w-full justify-start overflow-x-auto custom-scrollbar">
          <TabsTrigger value="profile" className="rounded-lg font-bold gap-2">
            <User className="w-4 h-4" /> Perfil
          </TabsTrigger>
          <TabsTrigger value="curriculum" className="rounded-lg font-bold gap-2">
            <BookOpen className="w-4 h-4" /> Currículo Digital
          </TabsTrigger>
          <TabsTrigger value="settings" className="rounded-lg font-bold gap-2">
            <SettingsIcon className="w-4 h-4" /> Ajustes
          </TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-lg font-bold gap-2">
            <Bell className="w-4 h-4" /> Notificaciones
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="border-2 border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <CardTitle>Información Personal</CardTitle>
              <CardDescription>Datos básicos de tu cuenta en ARG Academy.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">Nombre Completo</Label>
                  <Input defaultValue={user.name} className="bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl h-11" />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">Email</Label>
                  <Input defaultValue={`${user.name.toLowerCase().replace(" ", ".")}@arg-academy.com`} className="bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl h-11" />
                </div>
              </div>
              <Button className="bg-[#0047AB] hover:bg-blue-700 shadow-lg shadow-blue-500/20 px-8 h-12 rounded-xl font-bold transition-all hover:scale-[1.02] active:scale-[0.98]">
                Guardar Cambios
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="curriculum" className="space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
              <p className="text-slate-400 font-bold animate-pulse">Generando currículo digital...</p>
            </div>
          ) : (
            <>
              {/* Quick Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-none shadow-xl shadow-blue-500/20 overflow-hidden group">
                  <CardContent className="p-6 relative">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12 blur-2xl group-hover:bg-white/20 transition-colors" />
                    <div className="flex justify-between items-start relative z-10">
                      <div>
                        <p className="text-blue-100 text-[10px] font-black uppercase tracking-widest pb-1">XP ACUMULADO</p>
                        <h3 className="text-4xl font-black">{curriculum?.stats?.xpTotal || 0}</h3>
                      </div>
                      <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                        <Trophy className="w-6 h-6 text-yellow-300 fill-yellow-300/20" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border-2 border-slate-100 shadow-sm overflow-hidden group">
                  <CardContent className="p-6 relative">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest pb-1">NIVEL ACTUAL</p>
                        <h3 className="text-4xl font-black text-slate-800">{curriculum?.stats?.nivelActual || 1}</h3>
                      </div>
                      <div className="p-3 bg-indigo-50 rounded-2xl">
                        <Zap className="w-6 h-6 text-indigo-600 fill-indigo-600/10" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border-2 border-slate-100 shadow-sm overflow-hidden group">
                  <CardContent className="p-6 relative">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest pb-1">RACHA MÁS LARGA</p>
                        <h3 className="text-4xl font-black text-slate-800">{curriculum?.stats?.rachaDias || 0}d</h3>
                      </div>
                      <div className="p-3 bg-orange-50 rounded-2xl">
                        <Flame className="w-6 h-6 text-orange-500 fill-orange-500/10" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Modules Progress */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-2 border-slate-100 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <BookOpen className="w-5 h-5 text-blue-600" />
                      </div>
                      <span className="text-xl font-black text-slate-800">Módulos en Curso</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {curriculum?.modules?.length > 0 ? curriculum.modules.map((mod: any) => (
                      <div key={mod.moduloId} className="space-y-3 group cursor-pointer">
                        <div className="flex justify-between items-end">
                          <div>
                            <h4 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{mod.nombreModulo}</h4>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                              {mod.completedLevels} DE {mod.totalLevels} NIVELES COMPLETADOS
                            </p>
                          </div>
                          <Badge className="bg-blue-50 text-blue-700 border-none font-black">{mod.percentage}%</Badge>
                        </div>
                        <div className="relative h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="absolute top-0 left-0 h-full bg-blue-600 rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${mod.percentage}%` }}
                          />
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-8 text-slate-400">
                        <p className="font-bold">No tienes módulos asignados aún.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Recent Activity Timeline */}
                <Card className="border-2 border-slate-100 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 bg-purple-50 rounded-lg">
                        <Sparkles className="w-5 h-5 text-purple-600" />
                      </div>
                      <span className="text-xl font-black text-slate-800">Actividad Reciente</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {curriculum?.activity?.length > 0 ? curriculum.activity.map((act: any, idx: number) => (
                        <div key={idx} className="flex gap-4 items-start relative pb-6 group">
                          {idx < curriculum.activity.length - 1 && (
                            <div className="absolute left-2.5 top-7 bottom-0 w-[2px] bg-slate-100 group-hover:bg-blue-100 transition-colors" />
                          )}
                          <div className={`mt-1.5 w-5 h-5 rounded-full border-4 border-white shadow-md shrink-0 z-10 transition-transform group-hover:scale-125 ${act.tipo === 'RAG' ? 'bg-blue-500' : 'bg-purple-500'
                            }`} />
                          <div className="flex-1 bg-slate-50/50 p-3 rounded-2xl group-hover:bg-slate-50 transition-colors border border-transparent group-hover:border-slate-100">
                            <div className="flex justify-between items-start">
                              <div>
                                <h5 className="font-bold text-slate-700 text-sm leading-tight">{act.titulo}</h5>
                                <div className="flex gap-2 mt-1">
                                  <Badge className={`text-[8px] h-4 px-1.5 font-black uppercase tracking-widest ${act.tipo === 'RAG' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                                    } border-none`}>
                                    {act.tipo}
                                  </Badge>
                                </div>
                              </div>
                              <span className="text-[10px] font-bold text-slate-400">{new Date(act.fecha).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      )) : (
                        <div className="text-center py-12 text-slate-400">
                          <Zap className="w-10 h-10 mx-auto mb-2 opacity-20" />
                          <p className="font-bold">¡Empieza a aprender para ver tu actividad!</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Points/Skills Radar Teaser */}
              <Card className="bg-slate-900 border-none shadow-2xl relative overflow-hidden text-white">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20" />
                <CardContent className="p-8 relative z-10 flex flex-col md:flex-row items-center gap-8">
                  <div className="flex-1 text-center md:text-left">
                    <h2 className="text-3xl font-black mb-4">Competencias Genios</h2>
                    <p className="text-slate-300 font-medium">
                      Has obtenido puntos en {curriculum?.pointsHistory?.length || 0} actividades diferentes.
                      Tu rendimiento actual destaca en **Lógica** y **Creatividad**.
                    </p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-6">
                      <span className="p-2 bg-white/10 rounded-xl backdrop-blur-sm px-4 text-xs font-bold border border-white/10">Pensamiento Crítico</span>
                      <span className="p-2 bg-white/10 rounded-xl backdrop-blur-sm px-4 text-xs font-bold border border-white/10">Resolución de Problemas</span>
                      <span className="p-2 bg-white/10 rounded-xl backdrop-blur-sm px-4 text-xs font-bold border border-white/10">Proactividad</span>
                    </div>
                  </div>
                  <div className="w-48 h-48 bg-white/5 rounded-3xl backdrop-blur-xl border border-white/10 flex items-center justify-center p-4">
                    <div className="w-full h-full border-2 border-dashed border-blue-400/30 rounded-2xl flex items-center justify-center">
                      <Sparkles className="w-12 h-12 text-blue-400 animate-pulse" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="settings">
          <Card className="border-2 border-slate-100 shadow-sm">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <CardTitle>Seguridad y Apariencia</CardTitle>
              <CardDescription>Personaliza tu experiencia de aprendizaje.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Lock className="text-slate-400" />
                  <div>
                    <p className="font-bold text-slate-700">Cambiar Contraseña</p>
                    <p className="text-xs text-slate-400">Último cambio hace 3 meses</p>
                  </div>
                </div>
                <Button variant="outline">Actualizar</Button>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Palette className="text-slate-400" />
                  <div>
                    <p className="font-bold text-slate-700">Modo de Interfaz</p>
                    <p className="text-xs text-slate-400">Actual: Claro</p>
                  </div>
                </div>
                <Button variant="outline">Cambiar a Oscuro</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
