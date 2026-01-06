import { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, UserPlus, Shield, Activity, Monitor, Layout, Box, Users } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const INITIAL_USERS = [
  { id: 1, name: "Ana García", email: "ana@example.com", role: "Estudiante", plan: "Pro", modules: ["Python 101"], status: "Activo" },
  { id: 2, name: "Carlos López", email: "carlos@example.com", role: "Estudiante", plan: "Digital", modules: ["Lógica"], status: "Activo" },
  { id: 3, name: "María Rodriguez", email: "maria@example.com", role: "Profesor", plan: "N/A", modules: ["All"], status: "Activo" },
];

const PERFORMANCE_DATA = [
  { name: 'Sem 1', active: 400, usage: 240 },
  { name: 'Sem 2', active: 600, usage: 380 },
  { name: 'Sem 3', active: 800, usage: 520 },
  { name: 'Sem 4', active: 1100, usage: 780 },
];

export default function AdminDashboard() {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [searchTerm, setSearchTerm] = useState("");

  const createUser = () => {
    const newUser = {
      id: Date.now(),
      name: "Nuevo Usuario",
      email: "user@example.com",
      role: "Estudiante",
      plan: "Digital",
      modules: [],
      status: "Activo"
    };
    setUsers([...users, newUser]);
    toast({ title: "Usuario creado", description: "Se ha añadido un nuevo usuario al sistema." });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 pb-24">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-[#0047AB] p-3 rounded-2xl shadow-lg shadow-blue-200">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div>
             <h1 className="text-3xl font-black text-slate-800 tracking-tight">System Authority</h1>
             <p className="text-slate-500 font-medium">Control global del ecosistema educativo.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={createUser} className="bg-[#0047AB] hover:bg-blue-700 btn-gamified h-12 px-6">
            <UserPlus className="w-5 h-5 mr-2" /> Crear Usuario
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Uptime", value: "99.9%", icon: Activity, color: "text-green-500" },
          { label: "Servidores", value: "8/8", icon: Monitor, color: "text-blue-500" },
          { label: "Usuarios Online", value: "142", icon: Users, color: "text-[#00FFFF]" },
          { label: "Carga Sistema", value: "14%", icon: Layout, color: "text-purple-500" }
        ].map((stat, i) => (
          <Card key={i} className="border-none bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className={cn("text-2xl font-black", stat.color)}>{stat.value}</p>
              </div>
              <stat.icon className={cn("w-10 h-10 opacity-20", stat.color)} />
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="management" className="space-y-6">
        <TabsList className="bg-slate-100/50 p-1 border-2 border-slate-100 rounded-xl">
          <TabsTrigger value="management" className="rounded-lg font-bold">Gestión de Usuarios</TabsTrigger>
          <TabsTrigger value="monitoring" className="rounded-lg font-bold">Monitoreo Real-time</TabsTrigger>
          <TabsTrigger value="modules" className="rounded-lg font-bold">Asignación de Módulos</TabsTrigger>
        </TabsList>

        <TabsContent value="management">
          <Card className="border-2 border-slate-100 shadow-xl shadow-slate-200/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Directorio de Usuarios</CardTitle>
                  <CardDescription>Control total sobre roles, planes y accesos.</CardDescription>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input 
                    placeholder="Filtrar sistema..." 
                    className="pl-9 bg-slate-50 border-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-slate-100">
                    <TableHead className="font-bold text-slate-700">Identidad</TableHead>
                    <TableHead className="font-bold text-slate-700">Rol</TableHead>
                    <TableHead className="font-bold text-slate-700">Suscripción</TableHead>
                    <TableHead className="font-bold text-slate-700">Módulos</TableHead>
                    <TableHead className="text-right font-bold text-slate-700">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} className="border-slate-50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center font-bold text-[#0047AB]">
                            {user.name[0]}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">{user.name}</p>
                            <p className="text-xs text-slate-400 font-medium">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="rounded-md border-slate-200 bg-slate-50 text-slate-600">
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Select defaultValue={user.plan}>
                          <SelectTrigger className="w-[110px] h-8 font-bold text-xs border-slate-100 bg-slate-50">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Digital">Digital</SelectItem>
                            <SelectItem value="Plata">Plata</SelectItem>
                            <SelectItem value="Pro">Pro</SelectItem>
                            <SelectItem value="N/A">N/A</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap max-w-[200px]">
                          {user.modules.length > 0 ? user.modules.map((m, i) => (
                            <Badge key={i} className="bg-blue-50 text-blue-600 border-none text-[10px]">{m}</Badge>
                          )) : <span className="text-slate-300 italic text-xs">Sin módulos</span>}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="hover:bg-blue-50 hover:text-blue-600 font-bold">
                          Configurar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-2 border-slate-100">
              <CardHeader>
                <CardTitle>Actividad del Sistema</CardTitle>
                <CardDescription>Interacciones de usuarios por semana.</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={PERFORMANCE_DATA}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                    <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                    <Line type="monotone" dataKey="active" stroke="#0047AB" strokeWidth={3} dot={{r: 6, fill: '#0047AB', strokeWidth: 0}} />
                    <Line type="monotone" dataKey="usage" stroke="#00FFFF" strokeWidth={3} dot={{r: 6, fill: '#00FFFF', strokeWidth: 0}} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-2 border-slate-100">
              <CardHeader>
                <CardTitle>Salud del Servidor</CardTitle>
                <CardDescription>Monitoreo de latencia y tráfico de paquetes.</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <Box className="w-16 h-16 text-blue-100 mx-auto animate-bounce" />
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Todos los sistemas operativos</p>
                  <div className="flex gap-2 justify-center">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse delay-75" />
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse delay-150" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
