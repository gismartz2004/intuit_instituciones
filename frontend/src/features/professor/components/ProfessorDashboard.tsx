import { useState, useEffect } from "react";
import professorApi from "@/features/professor/services/professor.api";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Plus, Upload, Video, FileText, BarChart as BarChartIcon, Users, Settings, BookOpen, UserPlus, Trash2, BrainCircuit } from "lucide-react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { toast } from "@/hooks/use-toast";
import AIContentModeler from "./AIContentModeler";

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
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states for Course
  const [newCourseName, setNewCourseName] = useState("");
  const [newCourseDesc, setNewCourseDesc] = useState("");
  const [newCourseImg, setNewCourseImg] = useState("");
  const [isCourseDialogOpen, setIsCourseDialogOpen] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, [user.id]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await professorApi.getCourses(user.id);
      setCourses(data);
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast({ title: "Error", description: "No se pudieron cargar los cursos.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fetchModules = async (courseId: string) => {
    try {
      const data = await professorApi.getCourseModules(courseId);
      setModules(data);
    } catch (error) {
      toast({ title: "Error", description: "No se pudieron cargar los módulos." });
    }
  };

  const fetchStudents = async () => {
    // This would normally fetch all students for the professor
    // For now, let's just refresh modules if a course is selected
    if (selectedCourse) fetchModules(selectedCourse.id);
  };

  const addCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newCourse = await professorApi.createCourse({
        nombre: newCourseName,
        descripcion: newCourseDesc,
        imagenUrl: newCourseImg || "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=2132&auto=format&fit=crop",
        profesorId: user.id
      });
      setCourses([...courses, newCourse]);
      setIsCourseDialogOpen(false);
      setNewCourseName("");
      setNewCourseDesc("");
      setNewCourseImg("");
      toast({ title: "Curso creado", description: `"${newCourseName}" listo para añadir módulos.` });
    } catch (error) {
      toast({ title: "Error", description: "No se pudo crear el curso.", variant: "destructive" });
    }
  };

  const [newModuleName, setNewModuleName] = useState("");
  const [isModuleDialogOpen, setIsModuleDialogOpen] = useState(false);

  const addModule = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newModuleName.trim() || !selectedCourse) return;

    try {
      const newModule = await professorApi.createModule({
        title: newModuleName,
        description: "Módulo creado manualmente",
        professorId: user.id,
        cursoId: selectedCourse.id
      });
      setModules([...modules, newModule]);
      setIsModuleDialogOpen(false);
      setNewModuleName("");
      toast({ title: "Módulo creado", description: `"${newModuleName}" añadido a ${selectedCourse.nombre}.` });
      setLocation(`/teach/module/${newModule.id}`);
    } catch (error) {
      toast({ title: "Error", description: "No se pudo crear el módulo.", variant: "destructive" });
    }
  };

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
      await professorApi.createStudent({
        name,
        email,
        password,
        moduleId
      });

      toast({ title: "Éxito", description: "Estudiante creado y asignado." });
      fetchStudents(); // Refresh data
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "No se pudo realizar la operación.", variant: "destructive" });
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 pb-24">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0047AB]">Panel Docente</h1>
          <p className="text-slate-500">Gestiona tus cursos, módulos y alumnos.</p>
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
          <Dialog open={isCourseDialogOpen} onOpenChange={setIsCourseDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#0047AB] gap-2">
                <Plus className="w-4 h-4" /> Nuevo Curso
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={addCourse}>
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Curso</DialogTitle>
                  <DialogDescription>Los cursos agrupan módulos específicos.</DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="courseName">Nombre del Curso</Label>
                    <Input id="courseName" placeholder="Ej. Robótica 7mo" value={newCourseName} onChange={e => setNewCourseName(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="courseDesc">Descripción</Label>
                    <Input id="courseDesc" placeholder="Resumen del curso" value={newCourseDesc} onChange={e => setNewCourseDesc(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="courseImg">URL de Imagen</Label>
                    <Input id="courseImg" placeholder="https://..." value={newCourseImg} onChange={e => setNewCourseImg(e.target.value)} />
                    {newCourseImg && <img src={newCourseImg} className="h-20 w-full object-cover rounded-md mt-2" alt="Preview" />}
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Crear Curso</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <Button onClick={() => setLocation('/teach/grading')} className="bg-amber-600 hover:bg-amber-700 gap-2">
            <FileText className="w-4 h-4" /> Calificar Entregas
          </Button>
        </div>
      </div>

      <Tabs defaultValue="courses" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="courses">Mis Cursos</TabsTrigger>
          <TabsTrigger value="students">Mis Alumnos</TabsTrigger>
          <TabsTrigger value="radar">Radar</TabsTrigger>
          <TabsTrigger value="methodology">Constructor IA</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="mt-6 space-y-8">
          {selectedCourse ? (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => setSelectedCourse(null)}>← Volver a Cursos</Button>
                <h2 className="text-2xl font-bold">{selectedCourse.nombre}</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {modules.map(mod => (
                  <Card key={mod.id} className="cursor-pointer hover:border-blue-500 transition-all" onClick={() => setLocation(`/teach/module/${mod.id}`)}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-lg font-bold">{mod.nombreModulo}</CardTitle>
                      <BookOpen className="w-5 h-5 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-500 italic">"{mod.descripcion || 'Sin descripción'}"</p>
                    </CardContent>
                  </Card>
                ))}
                <Dialog open={isModuleDialogOpen} onOpenChange={setIsModuleDialogOpen}>
                  <DialogTrigger asChild>
                    <Card className="border-2 border-dashed border-slate-200 hover:border-blue-400 cursor-pointer flex items-center justify-center py-10 transition-all">
                      <Plus className="w-8 h-8 text-slate-300" />
                    </Card>
                  </DialogTrigger>
                  <DialogContent>
                    <form onSubmit={addModule}>
                      <DialogHeader>
                        <DialogTitle>Añadir Módulo a {selectedCourse.nombre}</DialogTitle>
                      </DialogHeader>
                      <div className="py-4">
                        <Input placeholder="Nombre del módulo" value={newModuleName} onChange={e => setNewModuleName(e.target.value)} required />
                      </div>
                      <DialogFooter>
                        <Button type="submit">Crear Módulo</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {courses.map((course) => (
                <Card key={course.id} className="overflow-hidden group hover:shadow-2xl transition-all cursor-pointer border-2"
                  onClick={() => { setSelectedCourse(course); fetchModules(course.id); }}>
                  <div className="h-40 relative">
                    <img src={course.imagenUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={course.nombre} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <Badge className="absolute top-3 right-3 bg-white/20 backdrop-blur-md text-white border-0">Curso</Badge>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">{course.nombre}</CardTitle>
                    <CardDescription className="line-clamp-2">{course.descripcion}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
              {courses.length === 0 && !loading && (
                <div className="col-span-full py-20 text-center border-4 border-dashed rounded-[3rem] border-slate-100 italic text-slate-400">
                  No tienes cursos creados. Comienza con "Nuevo Curso" o usa el "Constructor IA".
                </div>
              )}
            </div>
          )}
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
          <AIContentModeler professorId={user.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
