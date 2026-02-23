import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Trophy, Medal, Star, Flame, Target } from "lucide-react";
import { cn } from "@/lib/utils";

const RANKING_DATA = [
  { id: 1, name: "Lucas Ferreira", xp: 12450, level: 42, streak: 15, avatar: "LF" },
  { id: 2, name: "Sofía Martínez", xp: 11200, level: 38, streak: 24, avatar: "SM" },
  { id: 3, name: "Mateo Rossi", xp: 9800, level: 35, streak: 8, avatar: "MR" },
  { id: 4, name: "Valentina Paz", xp: 8500, level: 31, streak: 12, avatar: "VP" },
  { id: 5, name: "Tú", xp: 7200, level: 28, streak: 5, isUser: true, avatar: "ME" },
  { id: 6, name: "Joaquín Díaz", xp: 6900, level: 25, streak: 3, avatar: "JD" },
];

export default function Leaderboard() {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 pb-24">
      <div className="text-center space-y-2">
        <div className="inline-block bg-yellow-100 p-3 rounded-2xl mb-2">
          <Trophy className="w-10 h-10 text-yellow-600" />
        </div>
        <h1 className="text-4xl font-black text-slate-800 tracking-tight">Intuit Excellence</h1>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Cuadro de Honor • Temporada 2026</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {RANKING_DATA.map((player, index) => (
          <div
            key={player.id}
            className={cn(
              "flex items-center gap-4 p-4 rounded-2xl border-2 transition-all hover:scale-[1.01]",
              player.isUser ? "bg-purple-50 border-purple-600 shadow-lg shadow-purple-100" : "bg-white border-slate-100"
            )}
          >
            <div className="w-12 text-2xl font-black text-slate-300 flex justify-center">
              {index + 1 === 1 && <Medal className="w-8 h-8 text-yellow-400" />}
              {index + 1 === 2 && <Medal className="w-8 h-8 text-slate-400" />}
              {index + 1 === 3 && <Medal className="w-8 h-8 text-amber-600" />}
              {index + 1 > 3 && <span>{index + 1}</span>}
            </div>

            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 border-2 border-white shadow-sm">
              {player.avatar}
            </div>

            <div className="flex-1">
              <p className={cn("font-bold text-lg", player.isUser ? "text-purple-600" : "text-slate-700")}>
                {player.name} {player.isUser && <span className="text-xs bg-purple-200 px-2 py-0.5 rounded-full ml-2 text-purple-700">TÚ</span>}
              </p>
              <div className="flex items-center gap-4 mt-1">
                <span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-500 fill-current" /> Nivel {player.level}
                </span>
                <span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1">
                  <Flame className="w-3 h-3 text-orange-500 fill-current" /> {player.streak} Días
                </span>
              </div>
            </div>

            <div className="text-right">
              <p className="text-xl font-black text-slate-800">{player.xp.toLocaleString()}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">PUNTOS XP</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
