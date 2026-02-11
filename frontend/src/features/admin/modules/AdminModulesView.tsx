import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { ModuleWithStats } from '../types/admin.types';

interface AdminModulesViewProps {
  modules: ModuleWithStats[];
  moduleSearch: string;
  onModuleSearchChange: (value: string) => void;
  onSelectModule: (moduleId: number) => void;
}

export function AdminModulesView({
  modules,
  moduleSearch,
  onModuleSearchChange,
  onSelectModule,
}: AdminModulesViewProps) {
  const filteredModules = useMemo(() => {
    const term = moduleSearch.toLowerCase();
    return modules.filter(m => m.nombreModulo.toLowerCase().includes(term));
  }, [modules, moduleSearch]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 space-y-6">
      <Card className="glass-effect border-none p-6 rounded-3xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <CardTitle className="text-xl font-black text-slate-800">Repositorio Académico</CardTitle>
            <CardDescription className="font-bold text-slate-400">Explora todos los módulos, niveles y contenidos.</CardDescription>
          </div>
          <div className="relative w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Filtrar módulos..."
              value={moduleSearch}
              onChange={(e) => onModuleSearchChange(e.target.value)}
              className="pl-11 h-12 rounded-xl border-slate-200 bg-white/50 focus:bg-white transition-all font-medium"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModules.map((module) => (
            <Card key={module.id} className="group hover:shadow-xl transition-all duration-300 border-none bg-white rounded-2xl overflow-hidden shadow-sm">
              <div className="h-32 bg-linear-to-br from-blue-600 to-purple-700 relative p-6 flex flex-col justify-between">
                <div className="absolute inset-0 bg-white/5 opacity-10" />
                <div className="relative z-10 flex justify-between items-start">
                  <Badge className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-md">
                    {module.levelCount} Niveles
                  </Badge>
                </div>
                <h4 className="relative z-10 text-xl font-black text-white leading-tight">{module.nombreModulo}</h4>
              </div>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 font-bold">Estudiantes</span>
                    <span className="text-slate-800 font-black">{module.studentCount}</span>
                  </div>
                  <div className="flex flex-col gap-1 text-sm">
                    <span className="text-slate-500 font-bold">Docentes</span>
                    <div className="flex flex-wrap gap-1">
                      {module.professors && module.professors.length > 0 ? (
                        module.professors.map((p, idx) => (
                          <Badge key={idx} variant="secondary" className="bg-slate-100 text-slate-700 text-[10px] font-bold py-0 h-5">
                            {p.nombre}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-slate-400 italic text-[10px]">Sin asignar</span>
                      )}
                    </div>
                  </div>

                  <Button
                    onClick={() => onSelectModule(module.id)}
                    className="w-full mt-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold border border-slate-200"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Inspeccionar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
}
