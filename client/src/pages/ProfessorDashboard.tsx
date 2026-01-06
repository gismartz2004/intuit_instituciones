import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Upload, Video, FileText, BarChart as BarChartIcon, Users, Settings } from "lucide-react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

const RADAR_DATA = [
  { subject: 'Lógica', A: 120, fullMark: 150 },
  { subject: 'Robótica', A: 98, fullMark: 150 },
  { subject: 'Creatividad', A: 86, fullMark: 150 },
  { subject: 'Colaboración', A: 99, fullMark: 150 },
  { subject: 'Matemáticas', A: 85, fullMark: 150 },
  { subject: 'Inglés Tec', A: 65, fullMark: 150 },
];

export default function ProfessorDashboard() {
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 pb-24">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-3xl font-extrabold text-[#0047AB]">Panel Docente</h1>
           <p className="text-slate-500">Gestiona tus clases y recursos educativos.</p>
        </div>
        <Button className="bg-[#0047AB] gap-2">
          <Plus className="w-4 h-4" /> Nuevo Recurso
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-700 text-white border-none shadow-lg">
          <CardContent className="pt-6">
            <div className="text-3xl font-extrabold mb-1">24</div>
            <div className="text-sm font-medium opacity-80">Alumnos Activos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-extrabold mb-1 text-slate-800">12</div>
            <div className="text-sm font-medium text-slate-500">Cursos Publicados</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-extrabold mb-1 text-yellow-500">4.8</div>
            <div className="text-sm font-medium text-slate-500">Calificación Promedio</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-extrabold mb-1 text-green-500">92%</div>
            <div className="text-sm font-medium text-slate-500">Tasa de Aprobación</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="content" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="content">Contenido</TabsTrigger>
          <TabsTrigger value="radar">Radar de Aptitudes</TabsTrigger>
          <TabsTrigger value="methodology">Metodología</TabsTrigger>
        </TabsList>
        
        <TabsContent value="content" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Biblioteca de Recursos</CardTitle>
              <CardDescription>Sube PDFs, vídeos y enlaces para tus alumnos.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center gap-4 hover:bg-slate-50 transition-colors cursor-pointer">
                <div className="bg-blue-100 p-4 rounded-full">
                  <Upload className="w-8 h-8 text-[#0047AB]" />
                </div>
                <div className="text-center">
                  <p className="font-bold text-slate-700">Arrastra archivos aquí o haz clic para subir</p>
                  <p className="text-sm text-slate-400">Soporta PDF, MP4, PPTX</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <Badge variant="secondary" className="mb-2">Python Básico</Badge>
                    <Button variant="ghost" size="icon" className="h-6 w-6"><Settings className="w-4 h-4" /></Button>
                  </div>
                  <CardTitle className="text-lg">Introducción a Variables</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                    <Video className="w-4 h-4" />
                    <span>Video • 12 min</span>
                  </div>
                  <Button variant="outline" className="w-full">Editar</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="radar">
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
        
        <TabsContent value="methodology">
           <Card>
             <CardHeader>
               <CardTitle>Análisis Metodológico</CardTitle>
               <CardDescription>Insights basados en IA sobre el rendimiento de las clases.</CardDescription>
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
