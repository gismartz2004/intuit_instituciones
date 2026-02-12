
import { useState } from "react";
import { motion } from "framer-motion";
import {
    Save,
    PlusCircle,
    ArrowLeft,
    Terminal,
    Layout,
    Layers,
    FileText,
    Cpu,
    Target,
    Zap,
    BookOpen,
    Eye,
    Code2,
    Settings,
    Lightbulb
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";

export default function BdEditor() {
    const [location, setLocation] = useLocation();
    const [activeSection, setActiveSection] = useState(0);

    const sections = [
        "Identificación",
        "Propósito",
        "Contenido Clave",
        "Reglas de Diagramación",
        "Ejemplo Modelo",
        "Activador Cognitivo",
        "Actividad Principal",
        "Diseño del Esquema",
        "Configuración de Envío",
        "Checklist de Autonomía",
        "Competencias",
        "Sección Motivacional"
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar Editor Nav */}
            <div className="w-80 bg-white border-r border-slate-200 flex flex-col sticky top-0 h-screen">
                <div className="p-8 border-b border-slate-100">
                    <Link href="/specialist-teach">
                        <Button variant="ghost" className="gap-2 text-slate-500 font-bold mb-4">
                            <ArrowLeft className="w-4 h-4" /> Volver
                        </Button>
                    </Link>
                    <Badge className="bg-indigo-600 mb-2 uppercase text-[9px] font-black">Editor de BD</Badge>
                    <h1 className="text-xl font-black text-slate-900 leading-tight">Constructor de Bloques Técnicos</h1>
                </div>

                <nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
                    {sections.map((section, idx) => (
                        <button
                            key={idx}
                            onClick={() => setActiveSection(idx)}
                            className={cn(
                                "w-full text-left px-6 py-4 rounded-xl text-sm font-bold transition-all flex items-center gap-3",
                                activeSection === idx
                                    ? "bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100"
                                    : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                            )}
                        >
                            <span className={cn(
                                "w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black",
                                activeSection === idx ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400"
                            )}>
                                {idx + 1}
                            </span>
                            {section}
                        </button>
                    ))}
                </nav>

                <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                    <Button className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 rounded-xl font-bold gap-2 shadow-lg shadow-indigo-200">
                        <Save className="w-4 h-4" /> Guardar Bloque
                    </Button>
                </div>
            </div>

            {/* Main Editor Area */}
            <div className="flex-1 p-12 overflow-y-auto">
                <div className="max-w-4xl mx-auto">
                    <header className="mb-12 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Sección {activeSection + 1}</p>
                            <h2 className="text-3xl font-black text-slate-800 tracking-tight">{sections[activeSection]}</h2>
                        </div>
                        <div className="flex gap-4">
                            <Button variant="outline" className="rounded-xl font-bold gap-2">
                                <Eye className="w-4 h-4" /> Vista Previa
                            </Button>
                        </div>
                    </header>

                    {/* Placeholder content for different sections */}
                    <div className="bg-white border border-slate-200 rounded-[2.5rem] p-12 shadow-xl shadow-slate-200/50 space-y-8">
                        {activeSection === 0 ? (
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nombre del Módulo</label>
                                        <input type="text" placeholder="Ej: Diseño de Sistemas" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Semana / Ciclo</label>
                                        <div className="flex gap-2">
                                            <input type="text" placeholder="Semana 1" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all" />
                                            <input type="text" placeholder="Ciclo 1" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all" />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nivel Educativo</label>
                                    <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all appearance-none cursor-pointer">
                                        <option>Educación Básica Superior</option>
                                        <option>Bachillerato Técnico</option>
                                        <option>Nivel Universitario</option>
                                    </select>
                                </div>
                            </div>
                        ) : activeSection === 1 ? (
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Texto del Propósito</label>
                                    <textarea rows={4} placeholder="Describe el objetivo central de este bloque..." className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all resize-none"></textarea>
                                </div>
                                <div className="p-6 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-4">
                                    <Lightbulb className="w-6 h-6 text-amber-500 shrink-0" />
                                    <p className="text-sm text-amber-700 font-medium">Tip: El propósito debe ser claro y motivador para el estudiante. Evita tecnicismos excesivos en este punto.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-100 rounded-[2rem]">
                                <Settings className="w-12 h-12 text-slate-200 animate-spin-slow mb-4" />
                                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Configuración de {sections[activeSection]} - Próximamente</p>
                            </div>
                        )}
                    </div>

                    <footer className="mt-12 flex justify-between">
                        <Button
                            variant="ghost"
                            onClick={() => setActiveSection(prev => Math.max(0, prev - 1))}
                            disabled={activeSection === 0}
                            className="font-bold text-slate-400"
                        >
                            Sección Anterior
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setActiveSection(prev => Math.min(sections.length - 1, prev + 1))}
                            disabled={activeSection === sections.length - 1}
                            className="rounded-xl font-bold bg-white"
                        >
                            Siguiente Sección
                        </Button>
                    </footer>
                </div>
            </div>
        </div>
    );
}
