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
import { Search, Plus, Download, Filter } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const USERS = [
  { id: 1, name: "Ana García", email: "ana@example.com", role: "Estudiante", plan: "Pro", progress: 85, status: "Activo" },
  { id: 2, name: "Carlos López", email: "carlos@example.com", role: "Estudiante", plan: "Digital", progress: 32, status: "Activo" },
  { id: 3, name: "María Rodriguez", email: "maria@example.com", role: "Profesor", plan: "N/A", progress: 0, status: "Activo" },
  { id: 4, name: "Pedro Martinez", email: "pedro@example.com", role: "Estudiante", plan: "Plata", progress: 64, status: "Inactivo" },
  { id: 5, name: "Lucía Fernández", email: "lucia@example.com", role: "Estudiante", plan: "Digital", progress: 12, status: "Activo" },
];

const TRAFFIC_DATA = [
  { name: 'Lun', visits: 4000 },
  { name: 'Mar', visits: 3000 },
  { name: 'Mie', visits: 2000 },
  { name: 'Jue', visits: 2780 },
  { name: 'Vie', visits: 1890 },
  { name: 'Sab', visits: 2390 },
  { name: 'Dom', visits: 3490 },
];

export default function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-3xl font-extrabold text-[#0047AB]">Panel de Administración</h1>
           <p className="text-slate-500">Gestiona usuarios, planes y métricas.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" /> Exportar
          </Button>
          <Button className="bg-[#0047AB] gap-2">
            <Plus className="w-4 h-4" /> Nuevo Usuario
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Usuarios Totales</CardTitle>
            <div className="text-4xl font-extrabold text-[#0047AB]">1,245</div>
          </CardHeader>
          <CardContent>
            <span className="text-green-500 font-bold text-sm">↑ 12%</span> <span className="text-slate-400 text-sm">vs mes anterior</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Suscripciones Pro</CardTitle>
            <div className="text-4xl font-extrabold text-[#00FFFF] text-shadow-sm" style={{ textShadow: "0 0 10px rgba(0,255,255,0.3)" }}>432</div>
          </CardHeader>
          <CardContent>
             <span className="text-green-500 font-bold text-sm">↑ 8%</span> <span className="text-slate-400 text-sm">vs mes anterior</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Tasa de Finalización</CardTitle>
            <div className="text-4xl font-extrabold text-slate-800">78%</div>
          </CardHeader>
          <CardContent>
             <span className="text-red-500 font-bold text-sm">↓ 2%</span> <span className="text-slate-400 text-sm">vs mes anterior</span>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Gestión de Usuarios y Planes</CardTitle>
            <CardDescription>Administra los roles y niveles de suscripción de los estudiantes.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Buscar por nombre o email..." 
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline"><Filter className="w-4 h-4" /></Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Plan (Nivel)</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {USERS.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="font-bold text-slate-700">{user.name}</div>
                      <div className="text-xs text-slate-400">{user.email}</div>
                    </TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>
                      {user.role === "Estudiante" ? (
                        <Select defaultValue={user.plan}>
                          <SelectTrigger className="w-[120px] h-8">
                            <SelectValue placeholder="Plan" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Digital">Digital</SelectItem>
                            <SelectItem value="Plata">Plata</SelectItem>
                            <SelectItem value="Pro">Pro</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.status === "Activo" ? "default" : "secondary"}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">Editar</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tráfico Semanal</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={TRAFFIC_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  cursor={{ fill: 'transparent' }}
                />
                <Bar dataKey="visits" fill="#0047AB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
