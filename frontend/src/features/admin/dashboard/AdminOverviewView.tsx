import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, ClipboardList, TrendingUp, FolderTree, Users, UserCheck } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';
import type { SystemStats } from '../types/admin.types';

interface AdminOverviewViewProps {
  stats: SystemStats | null;
  onOpenImport: () => void;
  onOpenAssign: () => void;
}

export function AdminOverviewView({ stats, onOpenImport, onOpenAssign }: AdminOverviewViewProps) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Módulos Totales", value: stats?.totalModules || 0, icon: FolderTree, color: "text-blue-600", bg: "bg-blue-500/10", border: "border-blue-100" },
          { label: "Estudiantes", value: stats?.totalStudents || 0, icon: Users, color: "text-emerald-600", bg: "bg-emerald-500/10", border: "border-emerald-100" },
          { label: "Profesores", value: stats?.totalProfessors || 0, icon: UserCheck, color: "text-purple-600", bg: "bg-purple-500/10", border: "border-purple-100" },
          { label: "Asignaciones", value: stats?.totalAssignments || 0, icon: ClipboardList, color: "text-orange-600", bg: "bg-orange-500/10", border: "border-orange-100" }
        ].map((stat, i) => (
          <Card key={i} className={cn("glass-effect shadow-xl shadow-slate-200/40 rounded-3xl border overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl", stat.border)}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={cn("p-3 rounded-2xl", stat.bg)}>
                  <stat.icon className={cn("w-6 h-6", stat.color)} />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <p className="text-4xl font-black text-slate-800 tracking-tighter">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="md:col-span-2 glass-effect border-none rounded-3xl p-6 shadow-xl shadow-slate-200/40">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-xl font-black text-slate-800">Actividad del Sistema</CardTitle>
            <CardDescription className="font-bold text-slate-400">Interacciones registradas por día de la semana.</CardDescription>
          </CardHeader>
          <div className="h-75 mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[
                { name: 'Lun', active: 400, usage: 240 },
                { name: 'Mar', active: 600, usage: 380 },
                { name: 'Mie', active: 800, usage: 520 },
                { name: 'Jue', active: 1100, usage: 780 },
                { name: 'Vie', active: 1300, usage: 900 },
                { name: 'Sab', active: 900, usage: 600 },
                { name: 'Dom', active: 700, usage: 450 },
              ]}>
                <defs>
                  <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="active" stroke="#2563eb" strokeWidth={4} fillOpacity={1} fill="url(#colorActive)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="glass-effect border-none rounded-3xl p-8 flex flex-col justify-center items-center text-center relative overflow-hidden bg-linear-to-br from-slate-900 to-slate-800 text-white shadow-2xl">
            <div className="absolute inset-0 bg-blue-500/5 opacity-20" />
            <div className="relative z-10 space-y-6">
              <div className="w-20 h-20 bg-blue-500/20 rounded-3xl flex items-center justify-center mx-auto ring-1 ring-white/10 backdrop-blur-md">
                <TrendingUp className="w-10 h-10 text-blue-400" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-300 mb-2">Cuota de Rendimiento</p>
                <h4 className="text-3xl font-black tracking-tight">92.4%</h4>
                <div className="w-full bg-white/10 h-1.5 rounded-full mt-4 overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: '92.4%' }} />
                </div>
              </div>
              <p className="text-xs text-slate-400 font-bold italic">Nivel de eficiencia optimizado</p>
            </div>
          </Card>

          <Card className="glass-effect border-none rounded-3xl p-8 relative overflow-hidden group bg-white shadow-xl shadow-slate-200/40 border border-blue-50">
            <div className="relative z-10">
              <h4 className="text-lg font-black text-slate-800 mb-4">Acceso Rápido</h4>
              <div className="grid grid-cols-1 gap-3">
                <Button onClick={onOpenImport} variant="outline" className="justify-start h-12 rounded-xl border-slate-100 hover:bg-slate-50 font-bold text-xs uppercase tracking-wider">
                  <FileSpreadsheet className="w-4 h-4 mr-3 text-emerald-500" />
                  Carga Masiva
                </Button>
                <Button onClick={onOpenAssign} variant="outline" className="justify-start h-12 rounded-xl border-slate-100 hover:bg-slate-50 font-bold text-xs uppercase tracking-wider">
                  <ClipboardList className="w-4 h-4 mr-3 text-orange-500" />
                  Nuevas Asignaciones
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
