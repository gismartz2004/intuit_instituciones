import { useState } from "react";
import { Link } from "wouter";
import { Star, Lock, Check, Zap, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

// Mock Data for the Learning Path
const UNITS = [
  {
    id: 1,
    title: "Unidad 1: Fundamentos de IA",
    description: "Aprende los conceptos básicos de la Inteligencia Artificial.",
    color: "bg-[#58CC02]", // Green
    lessons: [
      { id: 1, type: "star", status: "completed", x: 0 },
      { id: 2, type: "book", status: "completed", x: -40 },
      { id: 3, type: "star", status: "active", x: 40 },
      { id: 4, type: "trophy", status: "locked", x: 0 },
    ],
  },
  {
    id: 2,
    title: "Unidad 2: Lógica de Programación",
    description: "Domina las estructuras de control y variables.",
    color: "bg-[#CE82FF]", // Purple
    lessons: [
      { id: 5, type: "star", status: "locked", x: 0 },
      { id: 6, type: "book", status: "locked", x: -40 },
      { id: 7, type: "star", status: "locked", x: 40 },
      { id: 8, type: "trophy", status: "locked", x: 0 },
    ],
  },
];

export default function StudentDashboard() {
  return (
    <div className="flex justify-center pb-20 pt-8">
      <div className="w-full max-w-[600px] px-4">
        {UNITS.map((unit) => (
          <div key={unit.id} className="mb-12">
            {/* Unit Header */}
            <div className={cn("rounded-2xl p-6 mb-8 text-white flex justify-between items-center shadow-lg", unit.color)}>
              <div>
                <h2 className="text-2xl font-extrabold">{unit.title}</h2>
                <p className="opacity-90 font-medium">{unit.description}</p>
              </div>
              <Link href="/unit-details">
                <button className="bg-black/20 hover:bg-black/30 text-white font-bold py-3 px-6 rounded-xl transition-all border-2 border-transparent">
                  GUÍA
                </button>
              </Link>
            </div>

            {/* Path */}
            <div className="flex flex-col items-center gap-6 relative">
              {unit.lessons.map((lesson, idx) => (
                <LessonNode key={lesson.id} lesson={lesson} index={idx} />
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {/* Right Sidebar Stats (Desktop Only) */}
      <div className="hidden xl:block w-[350px] pl-8 fixed right-0 top-0 pt-8 pr-8">
        <div className="flex gap-4 mb-8">
          <div className="flex items-center gap-2">
            <img src="https://d35aaqx5ub95lt.cloudfront.net/images/icons/9044c53d5e2361d904f85e33d0615555.svg" className="w-8 h-8" />
            <span className="font-bold text-[#FF9600]">2</span>
          </div>
          <div className="flex items-center gap-2">
            <img src="https://d35aaqx5ub95lt.cloudfront.net/images/icons/f2a361596e10787e9c5f4039803158c5.svg" className="w-8 h-8" />
            <span className="font-bold text-[#1CB0F6]">450</span>
          </div>
          <div className="flex items-center gap-2">
             <div className="bg-rose-500 rounded-full w-8 h-8 flex items-center justify-center text-white font-bold">
               <span className="text-xs">❤</span>
             </div>
            <span className="font-bold text-rose-500">5</span>
          </div>
        </div>

        <div className="border-2 border-slate-200 rounded-2xl p-6 mb-6">
          <h3 className="font-bold text-slate-700 text-lg mb-4">Ranking de Liga</h3>
          <div className="flex items-center gap-4 mb-4">
             <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center font-bold text-white">#1</div>
             <div className="flex-1">
               <p className="font-bold text-slate-700">Juan Pérez</p>
               <p className="text-slate-400 text-sm">1200 XP</p>
             </div>
          </div>
          <div className="w-full h-[1px] bg-slate-200 my-4"></div>
          <Link href="/leaderboard" className="text-[#1CB0F6] font-bold uppercase tracking-wider text-sm hover:underline">
            Ver Liga
          </Link>
        </div>

        <div className="border-2 border-slate-200 rounded-2xl p-6">
          <h3 className="font-bold text-slate-700 text-lg mb-4">Misiones Diarias</h3>
          <div className="space-y-4">
             <div className="flex items-center gap-4">
               <Zap className="w-8 h-8 text-yellow-500 fill-current" />
               <div className="flex-1">
                 <p className="font-bold text-slate-700">Gana 50 XP</p>
                 <div className="w-full h-3 bg-slate-200 rounded-full mt-2 overflow-hidden">
                   <div className="h-full bg-yellow-500 w-[70%] rounded-full"></div>
                 </div>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LessonNode({ lesson, index }: { lesson: any; index: number }) {
  const isLocked = lesson.status === "locked";
  const isActive = lesson.status === "active";
  
  return (
    <div 
      className="relative z-10"
      style={{ transform: `translateX(${lesson.x}px)` }}
    >
      <Link href={isLocked ? "#" : "/lab"}>
        <div className="group relative cursor-pointer">
          {/* Shadow/Depth */}
          <div 
            className={cn(
              "absolute top-2 left-0 w-full h-full rounded-full transition-all",
              isLocked ? "bg-slate-300" : "bg-blue-700",
              isActive && "animate-pulse"
            )} 
          />
          
          {/* Main Button */}
          <div 
            className={cn(
              "w-20 h-20 rounded-full flex items-center justify-center relative transition-transform active:translate-y-2 border-4 z-10",
              isLocked 
                ? "bg-slate-200 border-slate-300 text-slate-400" 
                : isActive 
                  ? "bg-[#0047AB] border-blue-400 text-white shadow-[0_0_20px_rgba(0,71,171,0.6)]" 
                  : "bg-blue-500 border-blue-600 text-white"
            )}
          >
            {lesson.type === "star" && <Star className="w-8 h-8 fill-current" />}
            {lesson.type === "book" && <Check className="w-8 h-8 stroke-[4]" />}
            {lesson.type === "trophy" && <div className="text-2xl">🏆</div>}
            
            {isActive && (
              <div className="absolute -top-4 bg-white text-[#0047AB] px-3 py-1 rounded-lg font-bold text-xs uppercase animate-bounce border-2 border-slate-200 shadow-sm">
                Empezar
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
