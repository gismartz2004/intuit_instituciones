
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

                    {/* Content for different sections */}
                    <div className="bg-white border border-slate-200 rounded-[2.5rem] p-12 shadow-xl shadow-slate-200/50 space-y-8">
                        {/* Section 0: Identificación */}
                        {activeSection === 0 && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nombre del Módulo</label>
                                        <input type="text" defaultValue="Diseño, Análisis y Diagramación de Sistemas" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Semana / Ciclo</label>
                                        <div className="flex gap-2">
                                            <input type="text" defaultValue="1" placeholder="Semana" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all" />
                                            <input type="text" defaultValue="1" placeholder="Ciclo" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all" />
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nivel Educativo</label>
                                        <select defaultValue="basica" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all appearance-none cursor-pointer">
                                            <option value="basica">Educación Básica Superior</option>
                                            <option value="bachillerato">Bachillerato Técnico</option>
                                            <option value="universitario">Nivel Universitario</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nivel Bloom</label>
                                        <input type="text" defaultValue="Comprender → Aplicar" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Duración Sugerida (minutos)</label>
                                    <input type="number" defaultValue="90" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all" />
                                </div>
                            </div>
                        )}

                        {/* Section 1: Propósito */}
                        {activeSection === 1 && (
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Texto del Propósito (visible para el estudiante)</label>
                                    <textarea rows={4} defaultValue="Comprender qué es un sistema, identificar sus componentes y representarlo mediante un esquema simple para resolver un problema real." className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all resize-none"></textarea>
                                </div>
                                <div className="p-6 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-4">
                                    <Lightbulb className="w-6 h-6 text-amber-500 shrink-0" />
                                    <p className="text-sm text-amber-700 font-medium">📌 Este BD es la base de todo el ciclo. El propósito debe ser claro y motivador.</p>
                                </div>
                            </div>
                        )}

                        {/* Section 2: Contenido Clave */}
                        {activeSection === 2 && (
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">¿Qué es un sistema?</label>
                                    <textarea rows={3} defaultValue="Un sistema es un conjunto de elementos organizados que trabajan juntos para resolver un problema, recibiendo información (entradas), transformándola (procesos) y generando un resultado (salidas)." className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all resize-none"></textarea>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Componentes básicos de un sistema</label>
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-3">
                                            <span className="font-black text-indigo-600">•</span>
                                            <div className="flex-1">
                                                <p className="font-bold text-sm text-slate-700 mb-1">Entradas:</p>
                                                <input type="text" defaultValue="datos o información que ingresa al sistema" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm" />
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <span className="font-black text-indigo-600">•</span>
                                            <div className="flex-1">
                                                <p className="font-bold text-sm text-slate-700 mb-1">Procesos:</p>
                                                <input type="text" defaultValue="acciones que transforman las entradas" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm" />
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <span className="font-black text-indigo-600">•</span>
                                            <div className="flex-1">
                                                <p className="font-bold text-sm text-slate-700 mb-1">Salidas:</p>
                                                <input type="text" defaultValue="resultados que produce el sistema" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Section 3: Reglas de Diagramación */}
                        {activeSection === 3 && (
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">¿Qué es un esquema o diagrama de sistema?</label>
                                    <textarea rows={2} defaultValue="Un esquema del sistema es una representación visual simple que muestra cómo funciona un sistema." className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all resize-none"></textarea>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Forma básica de representación</label>
                                    <div className="bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-mono text-sm">
                                        [ Entradas ] → [ Procesos ] → [ Salidas ]
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Reglas claras para el estudiante</label>
                                    <div className="space-y-2">
                                        {["No se usa UML", "No se evalúa estética", "Puede hacerse a mano o digital", "Si se entiende, está bien hecho"].map((rule, i) => (
                                            <div key={i} className="flex items-center gap-3 p-3 bg-green-50 border border-green-100 rounded-xl">
                                                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-black">✓</div>
                                                <span className="text-sm font-medium text-green-700">{rule}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Section 4: Ejemplo Modelo */}
                        {activeSection === 4 && (
                            <div className="space-y-6">
                                <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                                    <p className="text-xs font-bold text-blue-700 mb-2">📌 El ejemplo no se copia, solo se comprende</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sistema de Ejemplo</label>
                                    <input type="text" defaultValue="Control de asistencia" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4" />
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-600">Entradas</label>
                                        <input type="text" defaultValue="datos de estudiantes" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-600">Procesos</label>
                                        <input type="text" defaultValue="registro y validación de asistencia" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-600">Salidas</label>
                                        <input type="text" defaultValue="reporte de asistencia" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Esquema Visual del Ejemplo</label>
                                    <div className="bg-slate-800 text-green-400 font-mono text-sm p-6 rounded-2xl">
                                        <pre>{`[ Datos de estudiantes ]
           ↓
[ Registro de asistencia ]
           ↓
[ Reporte ]`}</pre>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Section 5: Activador Cognitivo */}
                        {activeSection === 5 && (
                            <div className="space-y-6">
                                <div className="p-6 bg-purple-50 border border-purple-100 rounded-2xl">
                                    <p className="text-sm font-bold text-purple-700 mb-2">💡 El objetivo es que el estudiante piense, no que memorice</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Pregunta Guía (Activador)</label>
                                    <textarea rows={3} defaultValue="¿Cómo se organiza un problema de la vida real para que funcione sin desorden?" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all resize-none"></textarea>
                                </div>
                            </div>
                        )}

                        {/* Section 6: Actividad Principal */}
                        {activeSection === 6 && (
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Título del Reto</label>
                                    <input type="text" defaultValue="Identifica un problema real y define el sistema que lo resolvería" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4" />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Campos que debe completar el estudiante</label>
                                    <div className="space-y-2">
                                        {[
                                            "Problema real a resolver",
                                            "Nombre del sistema",
                                            "Entradas del sistema",
                                            "Procesos del sistema",
                                            "Salidas del sistema"
                                        ].map((field, i) => (
                                            <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                                                <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-black">{i + 1}</span>
                                                <span className="text-sm font-medium text-slate-700">{field}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Section 7: Diseño del Esquema */}
                        {activeSection === 7 && (
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Instrucciones para el Esquema</label>
                                    <textarea rows={2} defaultValue="El estudiante debe representar su sistema mediante un esquema simple." className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 resize-none"></textarea>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Opciones válidas de envío</label>
                                    <div className="space-y-2">
                                        {[
                                            "📷 Dibujo a mano (foto del cuaderno)",
                                            "💻 Esquema digital (Canva, PowerPoint, Draw.io, etc.)",
                                            "🔗 Enlace al diagrama",
                                            "📝 Esquema en texto (opcional)"
                                        ].map((option, i) => (
                                            <div key={i} className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                                                <span className="text-sm font-medium text-blue-700">{option}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                                    <p className="text-sm font-medium text-amber-700">📌 No se exige software especializado</p>
                                </div>
                            </div>
                        )}

                        {/* Section 8: Configuración de Envío */}
                        {activeSection === 8 && (
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Título de la Sección de Envío</label>
                                    <input type="text" defaultValue="MI ESQUEMA DEL SISTEMA" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tipos de archivo permitidos</label>
                                    <div className="flex gap-2 flex-wrap">
                                        {["Imagen/Foto", "Enlace", "Texto"].map((type, i) => (
                                            <div key={i} className="px-4 py-2 bg-indigo-50 border border-indigo-200 rounded-xl text-sm font-bold text-indigo-700">
                                                {type}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Mensaje visible para el estudiante</label>
                                    <textarea rows={2} defaultValue="No se evalúa el diseño gráfico, se evalúa la claridad del sistema." className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 resize-none"></textarea>
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-100 rounded-2xl">
                                    <input type="checkbox" defaultChecked className="w-5 h-5" />
                                    <span className="text-sm font-medium text-green-700">👀 Mostrar vista previa del esquema</span>
                                </div>
                            </div>
                        )}

                        {/* Section 9: Checklist de Autonomía */}
                        {activeSection === 9 && (
                            <div className="space-y-6">
                                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl">
                                    <p className="text-sm font-bold text-red-700">📌 No se puede enviar sin completar el checklist</p>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Items del Checklist</label>
                                    <div className="space-y-2">
                                        {[
                                            "El problema es real",
                                            "Las entradas son claras",
                                            "Los procesos transforman las entradas",
                                            "Las salidas responden al problema",
                                            "El esquema se entiende"
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                                                <input type="checkbox" className="w-5 h-5" />
                                                <span className="text-sm font-medium text-slate-700">{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Section 10: Competencias */}
                        {activeSection === 10 && (
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">🧠 Competencias Técnicas</label>
                                        <div className="space-y-2">
                                            {[
                                                "Identificación de problemas desde un enfoque de sistemas",
                                                "Diseño básico de sistemas",
                                                "Representación visual de soluciones"
                                            ].map((comp, i) => (
                                                <input key={i} type="text" defaultValue={comp} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm" />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">💻 Competencias Digitales</label>
                                        <div className="space-y-2">
                                            {[
                                                "Organización de información",
                                                "Comunicación visual de ideas",
                                                "Uso básico de herramientas digitales"
                                            ].map((comp, i) => (
                                                <input key={i} type="text" defaultValue={comp} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm" />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">🌱 Competencias Transversales</label>
                                        <div className="space-y-2">
                                            {[
                                                "Pensamiento sistémico",
                                                "Autonomía",
                                                "Capacidad de explicación"
                                            ].map((comp, i) => (
                                                <input key={i} type="text" defaultValue={comp} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm" />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Section 11: Sección Motivacional */}
                        {activeSection === 11 && (
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Mensaje Motivacional (visible para el estudiante)</label>
                                    <textarea rows={3} defaultValue="Todo sistema digital que usas hoy comenzó como un esquema simple. Aprender a diagramar es el primer paso para crear soluciones reales." className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 resize-none"></textarea>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Pregunta Opcional de Reflexión</label>
                                    <input type="text" defaultValue="¿Qué otro problema te gustaría resolver con un sistema?" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4" />
                                </div>
                                <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                                    <p className="text-sm font-medium text-blue-700">📌 Esta pregunta no se evalúa, es solo para motivar la reflexión</p>
                                </div>
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
