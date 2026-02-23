import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft, Globe, Hammer, BookOpen, ChevronRight, User } from "lucide-react";
import WorldMap from "../components/WorldMap";
import ParcelEditor from "../components/ParcelEditor";
import ProjectWorld from "../components/ProjectWorld";
import type { Parcel } from "../types/minecraft.types";

type Mode = "world" | "parcel" | "project";

// DEMO students – would come from the real API in production
const DEMO_STUDENTS = [
    { id: "s1", name: "Gabriel Valarezo" },
    { id: "s2", name: "Mia González" },
    { id: "s3", name: "Thiago Aguayo" },
    { id: "s4", name: "Matías Guamán" },
    { id: "s5", name: "Elkin Beltrán" },
];

const MODE_CONFIG = [
    { id: "world", label: "🌍 Mundo", icon: Globe, color: "from-emerald-600 to-green-700" },
    { id: "project", label: "📋 Proyecto", icon: BookOpen, color: "from-amber-600 to-orange-700" },
] as const;

export default function MinecraftWorldPage() {
    const [mode, setMode] = useState<Mode>("world");
    const [activeParcel, setActiveParcel] = useState<Parcel | null>(null);

    // Read user from localStorage
    const user = (() => {
        try { return JSON.parse(localStorage.getItem("edu_user") || "null"); } catch { return null; }
    })();
    const isAdmin = user?.role === "professor" || user?.role === "admin" || user?.role === "superadmin";

    const openParcel = useCallback((parcel: Parcel) => {
        setActiveParcel(parcel);
        setMode("parcel");
    }, []);

    const backToWorld = () => {
        setActiveParcel(null);
        setMode("world");
    };

    return (
        <div className="flex flex-col h-screen bg-[#0f1117] text-white overflow-hidden">
            {/* ── Toolbar ───────────────────────────────────────────────────────── */}
            <div className="flex-shrink-0 h-14 bg-[#161b27] border-b border-white/5 flex items-center justify-between px-4 z-40">
                <div className="flex items-center gap-3">
                    {mode === "parcel" ? (
                        <button
                            onClick={backToWorld}
                            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-bold"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Volver al Mapa
                        </button>
                    ) : (
                        <Link href="/dashboard">
                            <button className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
                                <ArrowLeft className="w-4 h-4" />
                            </button>
                        </Link>
                    )}

                    <div className="h-5 w-px bg-white/10" />

                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center text-sm shadow-lg">
                            ⛏️
                        </div>
                        <div>
                            <p className="text-sm font-black tracking-tight">ARG Minecraft World</p>
                            {mode === "parcel" && activeParcel && (
                                <p className="text-[10px] text-slate-500">
                                    Parcela ({activeParcel.col}, {activeParcel.row})
                                    {activeParcel.studentName && ` · ${activeParcel.studentName}`}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Mode Switcher (hidden when in parcel) */}
                {mode !== "parcel" && (
                    <div className="flex items-center gap-1 bg-black/30 rounded-xl p-1">
                        {MODE_CONFIG.map(m => (
                            <button
                                key={m.id}
                                onClick={() => setMode(m.id as Mode)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${mode === m.id
                                        ? `bg-gradient-to-r ${m.color} text-white shadow-md`
                                        : "text-slate-400 hover:text-white"
                                    }`}
                            >
                                <m.icon className="w-3.5 h-3.5" />
                                {m.label}
                            </button>
                        ))}
                    </div>
                )}

                {/* User info */}
                {user && (
                    <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-1.5 border border-white/5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-xs font-bold text-slate-300">{user.name}</span>
                        {isAdmin && (
                            <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded-full font-black uppercase tracking-wider">
                                Profesor
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* ── Main Content ──────────────────────────────────────────────────── */}
            <div className="flex-1 overflow-hidden">
                <AnimatePresence mode="wait">
                    {mode === "world" && (
                        <motion.div
                            key="world"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="h-full"
                        >
                            <WorldMap
                                onParcelClick={openParcel}
                                isAdmin={isAdmin}
                                students={DEMO_STUDENTS}
                            />
                        </motion.div>
                    )}

                    {mode === "parcel" && activeParcel && (
                        <motion.div
                            key="parcel"
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -30 }}
                            className="h-full"
                        >
                            <ParcelEditor
                                parcel={activeParcel}
                                readOnly={!isAdmin && activeParcel.studentId !== user?.id}
                                onSave={(updated) => {
                                    console.log("Parcela guardada:", updated);
                                }}
                            />
                        </motion.div>
                    )}

                    {mode === "project" && (
                        <motion.div
                            key="project"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="h-full"
                        >
                            <ProjectWorld isAdmin={isAdmin} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
