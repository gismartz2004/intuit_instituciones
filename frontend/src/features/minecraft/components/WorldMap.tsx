import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Lock, User, Plus, Crown, Star } from "lucide-react";
import type { World, Parcel, BiomeType } from "../types/minecraft.types";

// ─── Biome visual configs ──────────────────────────────────────────────────────
const BIOME_STYLES: Record<BiomeType, { bg: string; border: string; label: string; emoji: string }> = {
    forest: { bg: "from-green-700 to-emerald-900", border: "border-green-500/40", label: "Bosque", emoji: "🌲" },
    desert: { bg: "from-yellow-600 to-amber-800", border: "border-yellow-500/40", label: "Desierto", emoji: "🌵" },
    snow: { bg: "from-sky-600 to-blue-900", border: "border-sky-400/40", label: "Nieve", emoji: "❄️" },
    ocean: { bg: "from-blue-600 to-indigo-900", border: "border-blue-400/40", label: "Océano", emoji: "🌊" },
};

const BIOME_CYCLE: BiomeType[] = ["forest", "desert", "snow", "ocean"];

function generateDefaultWorld(rows = 4, cols = 6): World {
    const parcels: Parcel[] = [];
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            parcels.push({
                id: `p-${r}-${c}`,
                row: r,
                col: c,
                biome: BIOME_CYCLE[(r + c) % 4] as BiomeType,
                isLocked: false,
                grid: [],
                program: [],
            });
        }
    }
    return {
        id: "world-1",
        name: "Mundo Principal",
        description: "El mundo de aprendizaje de programación",
        rows,
        cols,
        parcels,
        createdBy: "professor",
    };
}

interface WorldMapProps {
    world?: World;
    onParcelClick: (parcel: Parcel) => void;
    /** If true show admin assignment UI */
    isAdmin?: boolean;
    students?: { id: string; name: string }[];
    onAssignParcel?: (parcelId: string, studentId: string | null) => void;
}

const MONTH_NAMES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

export default function WorldMap({
    world: propWorld,
    onParcelClick,
    isAdmin = false,
    students = [],
    onAssignParcel,
}: WorldMapProps) {
    const [world, setWorld] = useState<World>(propWorld ?? generateDefaultWorld());
    const [hoveredParcel, setHoveredParcel] = useState<string | null>(null);
    const [assigningParcel, setAssigningParcel] = useState<string | null>(null);
    const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);

    const assignStudent = (parcelId: string, studentId: string | null) => {
        const student = students.find(s => s.id === studentId);
        setWorld(prev => ({
            ...prev,
            parcels: prev.parcels.map(p =>
                p.id === parcelId
                    ? { ...p, studentId: studentId ?? undefined, studentName: student?.name, month: selectedMonth }
                    : p
            ),
        }));
        onAssignParcel?.(parcelId, studentId);
        setAssigningParcel(null);
    };

    const getPlanWidth = () => `grid-cols-${world.cols}`;

    return (
        <div className="relative w-full h-full flex flex-col bg-[#0f1117] overflow-hidden">
            {/* World Header */}
            <div className="flex-shrink-0 px-6 py-4 flex items-center justify-between border-b border-white/5 bg-[#161b27]">
                <div>
                    <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                        🌍 {world.name}
                    </h2>
                    <p className="text-slate-500 text-xs mt-0.5">{world.description}</p>
                </div>
                {isAdmin && (
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-1.5 border border-white/10">
                            <span className="text-xs text-slate-400 font-bold">Mes:</span>
                            <select
                                value={selectedMonth}
                                onChange={e => setSelectedMonth(Number(e.target.value))}
                                className="bg-transparent text-white text-xs font-bold outline-none cursor-pointer"
                            >
                                {MONTH_NAMES.map((m, i) => (
                                    <option key={i} value={i + 1} className="bg-slate-800">{m}</option>
                                ))}
                            </select>
                        </div>
                        <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-400">
                            <Crown className="w-3 h-3 inline mr-1 text-amber-400" />
                            Modo Profesor
                        </div>
                    </div>
                )}
            </div>

            {/* World Grid */}
            <div className="flex-1 overflow-auto p-6">
                <div
                    className="grid gap-3 mx-auto"
                    style={{ gridTemplateColumns: `repeat(${world.cols}, minmax(0, 1fr))`, maxWidth: world.cols * 160 }}
                >
                    {world.parcels.map(parcel => {
                        const biome = BIOME_STYLES[parcel.biome];
                        const isHovered = hoveredParcel === parcel.id;
                        const hasStudent = !!parcel.studentId;

                        return (
                            <motion.div
                                key={parcel.id}
                                whileHover={{ scale: 1.04, y: -4 }}
                                whileTap={{ scale: 0.97 }}
                                onHoverStart={() => setHoveredParcel(parcel.id)}
                                onHoverEnd={() => setHoveredParcel(null)}
                                className={cn(
                                    "relative cursor-pointer rounded-2xl overflow-hidden border-2 shadow-xl transition-all",
                                    biome.border,
                                    parcel.isLocked && "opacity-50 grayscale"
                                )}
                                style={{ aspectRatio: "4/3" }}
                                onClick={() => {
                                    if (isAdmin) setAssigningParcel(assigningParcel === parcel.id ? null : parcel.id);
                                    else if (!parcel.isLocked) onParcelClick(parcel);
                                }}
                            >
                                {/* Biome gradient background */}
                                <div className={cn("absolute inset-0 bg-gradient-to-br", biome.bg)} />

                                {/* Pixel-art noise overlay */}
                                <div className="absolute inset-0 opacity-20"
                                    style={{
                                        backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)",
                                        backgroundSize: "8px 8px",
                                    }}
                                />

                                {/* Content */}
                                <div className="relative z-10 p-2 h-full flex flex-col justify-between">
                                    <div className="flex justify-between items-start">
                                        <span className="text-xl">{biome.emoji}</span>
                                        {parcel.month && (
                                            <span className="text-[9px] bg-black/40 text-white/70 px-1.5 py-0.5 rounded-lg backdrop-blur font-bold">
                                                {MONTH_NAMES[parcel.month - 1]}
                                            </span>
                                        )}
                                        {parcel.isLocked && <Lock className="w-4 h-4 text-white/60" />}
                                    </div>

                                    {/* Pixel blocks decoration */}
                                    <div className="absolute bottom-8 right-2 opacity-30 flex gap-0.5">
                                        {[...Array(4)].map((_, i) => (
                                            <div key={i} className="w-2 h-2 rounded-sm bg-white/60" style={{ height: `${(i + 1) * 4}px` }} />
                                        ))}
                                    </div>

                                    <div>
                                        {hasStudent ? (
                                            <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur rounded-xl px-2 py-1">
                                                <User className="w-3 h-3 text-emerald-400" />
                                                <span className="text-[10px] font-bold text-white truncate">
                                                    {parcel.studentName}
                                                </span>
                                            </div>
                                        ) : (
                                            <div className={cn(
                                                "flex items-center gap-1 bg-black/30 backdrop-blur rounded-xl px-2 py-1 border border-dashed border-white/20",
                                                isAdmin && "border-amber-400/40"
                                            )}>
                                                {isAdmin
                                                    ? <><Plus className="w-3 h-3 text-amber-400" /><span className="text-[10px] text-amber-300 font-bold">Asignar</span></>
                                                    : <span className="text-[10px] text-white/40">Libre</span>
                                                }
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Preview overlay on hover (for students) */}
                                {isHovered && !isAdmin && !parcel.isLocked && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="absolute inset-0 bg-white/10 backdrop-blur-sm flex items-center justify-center z-20"
                                    >
                                        <span className="font-black text-white text-sm tracking-widest uppercase">
                                            {hasStudent ? "Abrir Parcela" : "Explorar"}
                                        </span>
                                    </motion.div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Assignment Popup */}
            <AnimatePresence>
                {assigningParcel && isAdmin && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 bg-[#1e2535] border border-white/10 rounded-2xl shadow-2xl p-4 w-72"
                    >
                        <p className="text-xs font-black uppercase text-slate-400 mb-3 tracking-widest">
                            Asignar Parcela — {MONTH_NAMES[selectedMonth - 1]}
                        </p>
                        <div className="space-y-1.5 max-h-48 overflow-y-auto">
                            <button
                                onClick={() => assignStudent(assigningParcel, null)}
                                className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/5 text-xs text-slate-400 transition-all"
                            >
                                🚫 Sin asignación (Libre)
                            </button>
                            {students.map(s => (
                                <button
                                    key={s.id}
                                    onClick={() => assignStudent(assigningParcel, s.id)}
                                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-indigo-500/20 text-xs text-white font-bold transition-all flex items-center gap-2"
                                >
                                    <User className="w-3.5 h-3.5 text-slate-400" /> {s.name}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setAssigningParcel(null)}
                            className="mt-3 w-full py-1.5 rounded-xl bg-white/5 text-xs text-slate-400 hover:bg-white/10 transition-all"
                        >
                            Cancelar
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
