import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Trophy, Plus, Trash2 } from 'lucide-react';
import type { Premio } from '../types/admin.types';

interface AdminPrizesViewProps {
  prizes: Premio[];
  prizeSearch: string;
  onPrizeSearchChange: (value: string) => void;
  onCreatePrize: () => void;
  onDeletePrize: (id: number) => void;
}

export function AdminPrizesView({
  prizes,
  prizeSearch,
  onPrizeSearchChange,
  onCreatePrize,
  onDeletePrize,
}: AdminPrizesViewProps) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
      <div className="flex justify-end mb-6">
        <Button onClick={onCreatePrize} className="bg-pink-600 hover:bg-pink-700 text-white rounded-xl h-12 px-6 shadow-lg shadow-pink-500/20 font-bold">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Premio
        </Button>
      </div>

      <Card className="glass-effect border-none p-6 rounded-3xl">
        <CardHeader className="px-0 pt-0 pb-6 border-b border-slate-100 mb-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-black text-slate-800">Catálogo</CardTitle>
            <div className="relative w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Buscar premios..."
                value={prizeSearch}
                onChange={(e) => onPrizeSearchChange(e.target.value)}
                className="pl-11 h-11 rounded-xl bg-white border-slate-200"
              />
            </div>
          </div>
        </CardHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {prizes
            .filter(p => p.nombre.toLowerCase().includes(prizeSearch.toLowerCase()))
            .map((prize) => (
              <Card key={prize.id} className="relative group overflow-hidden border-2 hover:border-pink-200 transition-all rounded-2xl">
                <div className="h-40 bg-slate-50 flex items-center justify-center relative">
                  {prize.imagenUrl ? (
                    <img src={prize.imagenUrl} alt={prize.nombre} className="w-full h-full object-cover" />
                  ) : (
                    <Trophy className="w-16 h-16 text-slate-200" />
                  )}
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all scale-90"
                    onClick={() => onDeletePrize(prize.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <CardHeader className="text-center pt-4 pb-6">
                  <CardTitle className="text-sm font-bold truncate mb-1">{prize.nombre}</CardTitle>
                  <Badge className="bg-pink-100 text-pink-700 hover:bg-pink-200 border-none px-3 py-1">
                    {prize.costoPuntos} Puntos
                  </Badge>
                </CardHeader>
              </Card>
            ))}
        </div>
      </Card>
    </div>
  );
}
