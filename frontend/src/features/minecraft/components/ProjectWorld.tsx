import { motion } from "framer-motion";
import { BookOpen, Trophy, Target, Calendar, CheckCircle, Users, Clock, Star } from "lucide-react";

interface ProjectWorldProps {
    project?: {
        id: string;
        title: string;
        description: string;
        objectives: string[];
        restrictions: string[];
        dueDate?: string;
        month?: number;
    };
    isAdmin?: boolean;
}

const MONTH_NAMES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

const DEFAULT_PROJECT = {
    id: "proj-1",
    title: "🏰 El Gran Castillo",
    description: "Usa loops y variables para construir un castillo con torres. Este es un reto de lógica y creatividad donde deberás programar el agente para que construya estructuras simétricas.",
    objectives: [
        "Construir 4 torres en las esquinas de la parcela usando Repetir",
        "Conectar las torres con muros de ladrillo usando Relleno de Área",
        "Crear una variable 'altura' y usarla en tu programa",
        "Definir al menos una función reutilizable (ej: construirTorre())",
    ],
    restrictions: [
        "No puedes colocar bloques de TNT",
        "Las torres deben tener al menos 4 bloques de altura",
        "Debes usar mínimo 3 instrucciones de tipo bucle",
    ],
    dueDate: "2026-03-15",
    month: 3,
};

export default function ProjectWorld({ project = DEFAULT_PROJECT, isAdmin = false }: ProjectWorldProps) {
    return (
        <div className="h-full overflow-y-auto bg-[#0f1117] p-6">
            <div className="max-w-3xl mx-auto space-y-6">

                {/* Hero */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="relative rounded-3xl overflow-hidden border border-amber-500/20 bg-gradient-to-br from-amber-900/30 to-orange-900/20 p-8"
                >
                    <div className="absolute inset-0 opacity-10"
                        style={{
                            backgroundImage: "radial-gradient(circle, rgba(255,200,0,0.3) 1px, transparent 1px)",
                            backgroundSize: "12px 12px",
                        }}
                    />
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="px-2.5 py-1 bg-amber-500/20 border border-amber-500/40 rounded-full text-xs font-black text-amber-300 uppercase tracking-wider">
                                🗓️ {project.month ? MONTH_NAMES[project.month - 1] : "Proyecto Activo"}
                            </span>
                            <span className="px-2.5 py-1 bg-green-500/20 border border-green-500/40 rounded-full text-xs font-bold text-green-300">
                                Mundo Proyecto
                            </span>
                        </div>
                        <h1 className="text-3xl font-black text-white mb-3">{project.title}</h1>
                        <p className="text-slate-300 leading-relaxed">{project.description}</p>
                        {project.dueDate && (
                            <div className="mt-4 flex items-center gap-2 text-amber-300/70 text-sm">
                                <Calendar className="w-4 h-4" />
                                <span>Entrega: {new Date(project.dueDate).toLocaleDateString("es-EC", { day: "numeric", month: "long", year: "numeric" })}</span>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Objectives */}
                <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="bg-[#161b27] rounded-2xl border border-white/5 p-5"
                >
                    <h2 className="text-sm font-black uppercase tracking-widest text-emerald-400 mb-4 flex items-center gap-2">
                        <Target className="w-4 h-4" /> Objetivos del Proyecto
                    </h2>
                    <div className="space-y-3">
                        {project.objectives.map((obj, i) => (
                            <div key={i} className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-xs font-black text-emerald-400">{i + 1}</span>
                                </div>
                                <p className="text-sm text-slate-300 leading-relaxed">{obj}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Restrictions */}
                <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.15 }}
                    className="bg-[#161b27] rounded-2xl border border-white/5 p-5"
                >
                    <h2 className="text-sm font-black uppercase tracking-widest text-red-400 mb-4 flex items-center gap-2">
                        <BookOpen className="w-4 h-4" /> Restricciones
                    </h2>
                    <div className="space-y-2">
                        {project.restrictions.map((r, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 bg-red-500/5 border border-red-500/10 rounded-xl">
                                <span className="text-red-400 text-lg">⛔</span>
                                <p className="text-sm text-slate-300">{r}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Progress & Delivery */}
                <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-2 gap-4"
                >
                    <div className="bg-[#161b27] rounded-2xl border border-white/5 p-5">
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2">
                            <Star className="w-3.5 h-3.5" /> Tu Progreso
                        </h3>
                        <div className="space-y-2">
                            {project.objectives.map((_, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded border border-white/20 flex items-center justify-center">
                                        {i < 1 && <CheckCircle className="w-3 h-3 text-emerald-400" />}
                                    </div>
                                    <div className="flex-1 h-1.5 rounded-full bg-white/5">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-400 transition-all"
                                            style={{ width: i < 1 ? "100%" : "0%" }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-slate-500 mt-3">1 / {project.objectives.length} objetivos</p>
                    </div>

                    <div className="bg-[#161b27] rounded-2xl border border-white/5 p-5 flex flex-col justify-between">
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5" /> Tiempo Restante
                            </h3>
                            {project.dueDate && (() => {
                                const days = Math.ceil((new Date(project.dueDate).getTime() - Date.now()) / 86400000);
                                return (
                                    <div>
                                        <p className="text-4xl font-black text-white">{Math.max(0, days)}</p>
                                        <p className="text-xs text-slate-500">días restantes</p>
                                    </div>
                                );
                            })()}
                        </div>
                        <button className="mt-4 w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-sm transition-all">
                            🚀 Entregar Proyecto
                        </button>
                    </div>
                </motion.div>

                {isAdmin && (
                    <motion.div
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.25 }}
                        className="bg-[#161b27] rounded-2xl border border-amber-500/20 p-5"
                    >
                        <h2 className="text-sm font-black uppercase tracking-widest text-amber-400 mb-4 flex items-center gap-2">
                            <Users className="w-4 h-4" /> Panel del Profesor — Entregas
                        </h2>
                        <p className="text-xs text-slate-400">
                            Aquí podrás ver las entregas de los estudiantes y calificarlas. (Integración con backend pendiente)
                        </p>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
