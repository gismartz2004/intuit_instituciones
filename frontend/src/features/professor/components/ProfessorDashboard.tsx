import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, Upload, Video, FileText, BarChart as BarChartIcon, Users, Settings, BookOpen, UserPlus, Trash2 } from "lucide-react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { toast } from "@/hooks/use-toast";

const RADAR_DATA = [
  { subject: 'Lógica', A: 120, fullMark: 150 },
  { subject: 'Robótica', A: 98, fullMark: 150 },
  { subject: 'Creatividad', A: 86, fullMark: 150 },
  { subject: 'Colaboración', A: 99, fullMark: 150 },
  { subject: 'Matemáticas', A: 85, fullMark: 150 },
  { subject: 'Inglés Tec', A: 65, fullMark: 150 },
];

interface ProfessorDashboardProps {
  user: {
    name: string;
    id: string;
    role: string;
  };
}

export default function ProfessorDashboard({ user }: ProfessorDashboardProps) {
  const [, setLocation] = useLocation();
  const [modules, setModules] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModules();
  }, [user.id]);

  const fetchModules = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/professor/${user.id}/modules`);
      if (res.ok) {
        const data = await res.json();
        setModules(data);
        // Aggregate all unique students from all modules
        const allStudents = data.flatMap((m: any) => m.students || []);
        // Remove duplicates by ID
        const uniqueStudents = Array.from(new Map(allStudents.map((s: any) => [s.id, s])).values());
        setStudents(uniqueStudents as any[]);
      }
    } catch (error) {
      console.error("Error fetching modules:", error);
    } finally {
      setLoading(false);
    }
  };

  const addModule = async () => {
    try {
      const res = await fetch('/api/modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: "Nuevo Módulo",
          description: "Descripción del módulo",
          professorId: user.id
        })
      });

      if (res.ok) {
        const newModule = await res.json();
        setModules([...modules, newModule]);
        toast({ title: "Módulo creado", description: "Configura el contenido ahora." });
        setLocation(`/teach/module/${newModule.id}`);
      }
    } catch (error) {
      toast({ title: "Error", description: "No se pudo crear el módulo.", variant: "destructive" });
    }
  };

  const [selectedModuleId, setSelectedModuleId] = useState<string>("");

  const addStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const moduleId = formData.get("moduleId") as string;

    if (!moduleId) {
      toast({ title: "Error", description: "Debes seleccionar un módulo.", variant: "destructive" });
      return;
    }

    try {
      // 1. Create User and Assign (Unified Endpoint)
      const res = await fetch('http://localhost:3000/api/professor/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          moduleId: parseInt(moduleId)
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Error creating student");
      }

      toast({ title: "Éxito", description: "Estudiante creado y asignado." });
      fetchModules(); // Refresh data
      // Close dialog or reset form? (Optional but good UX)
      // reset form manually or reload page
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "No se pudo realizar la operación.", variant: "destructive" });
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 pb-24">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0047AB]">Panel Docente</h1>
          <p className="text-slate-500">Gestiona tus módulos, contenido y alumnos.</p>
        </div>
        <div className="flex gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <UserPlus className="w-4 h-4" /> Crear Estudiante
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={addStudent}>
                <DialogHeader>
                  <DialogTitle>Nuevo Estudiante</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="moduleId">Asignar al Módulo</Label>
                    <select name="moduleId" className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" required>
                      <option value="">Selecciona un módulo...</option>
                      {modules.map(m => (
                        <option key={m.id} value={m.id}>{m.nombreModulo}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre Completo</Label>
                    <Input id="name" name="name" required placeholder="Ej. Pedro Picapiedra" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" required placeholder="correo@ejemplo.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Contraseña Temporal</Label>
                    <Input id="password" name="password" type="password" required defaultValue="123456" />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Guardar Estudiante</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <Button onClick={addModule} className="bg-[#0047AB] gap-2">
            <Plus className="w-4 h-4" /> Nuevo Módulo
          </Button>
        </div>
      </div>

      <Tabs defaultValue="modules" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="modules">Módulos</TabsTrigger>
          <TabsTrigger value="students">Mis Alumnos</TabsTrigger>
          <TabsTrigger value="radar">Radar</TabsTrigger>
          <TabsTrigger value="methodology">IA Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="modules" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loading ? <p>Cargando módulos...</p> : modules.map((mod) => (
              <Card key={mod.id} className="border-2 border-slate-100 hover:border-blue-100 transition-all cursor-pointer" onClick={() => setLocation(`/teach/module/${mod.id}`)}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                    </div>
                    <CardTitle className="text-lg">{mod.nombreModulo}</CardTitle>
                  </div>
                  <Button variant="ghost" size="icon" className="text-slate-400 hover:text-blue-600">
                    <Settings className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-500 mb-4">{mod.duracionDias ? `${mod.duracionDias} días` : "Sin duración definida"}</p>
                  <Button className="w-full text-xs" variant="secondary">Gestionar Contenido</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="students" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Listado de Estudiantes</CardTitle>
              <CardDescription>Alumnos registrados en tus módulos.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {students.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-4 border rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#0047AB] text-white rounded-full flex items-center justify-center font-bold">
                        {(student.nombre || "?")[0]}
                      </div>
                      <div>
                        <p className="font-bold text-slate-700">{student.nombre || "Sin Nombre"}</p>
                        <p className="text-sm text-slate-500">{student.email}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">Ver Perfil</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="radar" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Radar de Aptitudes</CardTitle>
              <CardDescription>Visualización de competencias promedio del grupo.</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={RADAR_DATA}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={30} domain={[0, 150]} />
                  <Radar
                    name="Grupo A"
                    dataKey="A"
                    stroke="#0047AB"
                    fill="#0047AB"
                    fillOpacity={0.6}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="methodology" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Análisis Metodológico (IA)</CardTitle>
              <CardDescription>Insights sobre el rendimiento de tus clases.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 text-blue-800">
                <p className="font-bold mb-2">💡 Sugerencia de IA</p>
                <p>Los estudiantes muestran mayor participación en los módulos de robótica práctica. Considera aumentar el tiempo de simulación en Tinkercad en un 15%.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
