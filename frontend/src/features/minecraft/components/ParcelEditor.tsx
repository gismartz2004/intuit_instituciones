import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";
import {
    BLOCK_COLORS,
    BLOCK_EMOJIS,
    BLOCK_LABELS,
    PARCEL_SIZE,
    type BlockType,
    type Parcel,
    type BlockInstruction,
} from "../types/minecraft.types";
import { Trash2, Play, RotateCcw, Plus, Code2, Layers, AlertCircle, CheckCircle, MoveUp, MoveDown, MoveLeft, MoveRight, Trees, Sparkles } from "lucide-react";
import { useParticles, ParticleEffectRenderer } from "./ParticleEffect";
import { AchievementNotification, ACHIEVEMENTS, type Achievement } from "./Achievements";
import { ParcelStats } from "./ParcelStats";

// FIXED: Proper JSX structure for entire component

// ─── Block Palette ────────────────────────────────────────────────────────────
const PLACEABLE_BLOCKS: BlockType[] = [
    "grass", "dirt", "stone", "wood", "leaves",
    "sand", "water", "brick", "gold", "diamond",
    "glass", "snow", "path", "lava", "tnt"
];

// ─── Instruction Block Templates ─────────────────────────────────────────────
const INSTRUCTION_TEMPLATES: BlockInstruction[] = [
    { id: "", type: "event_start", category: "event", label: "🟣 Al Iniciar", params: {}, children: [] },
    { id: "", type: "move_up", category: "movement", label: "🔼 Mover Arriba", params: {}, children: [] },
    { id: "", type: "move_down", category: "movement", label: "🔽 Mover Abajo", params: {}, children: [] },
    { id: "", type: "move_left", category: "movement", label: "◀️ Mover Izquierda", params: {}, children: [] },
    { id: "", type: "move_right", category: "movement", label: "▶️ Mover Derecha", params: {}, children: [] },
    { id: "", type: "fn_arbol", category: "functions", label: "🌳 Función: Arbol", params: {}, children: [] },
    { id: "", type: "control_repeat", category: "control", label: "🔁 Repetir N veces", params: { times: 3 }, children: [] },
    { id: "", type: "control_if", category: "control", label: "❓ Si...Entonces", params: { condition: "bloque=stone" }, children: [] },
    { id: "", type: "control_wait", category: "control", label: "⏳ Esperar", params: { ms: 200 }, children: [] },
    { id: "", type: "block_place", category: "blocks", label: "🟩 Colocar Bloque", params: { x: 0, y: 0, type: "grass" }, children: [] },
    { id: "", type: "block_destroy", category: "blocks", label: "💥 Destruir Bloque", params: { x: 0, y: 0 }, children: [] },
    { id: "", type: "block_fill", category: "blocks", label: "🎨 Rellenar Área", params: { x1: 0, y1: 0, x2: 3, y2: 3, type: "stone" }, children: [] },
    { id: "", type: "var_create", category: "variables", label: "📦 Crear Variable", params: { name: "x", value: 0 }, children: [] },
    { id: "", type: "var_change", category: "variables", label: "🔄 Cambiar Variable", params: { name: "x", delta: 1 }, children: [] },
    { id: "", type: "fn_define", category: "functions", label: "🔷 Definir Función", params: { name: "miFuncion" }, children: [] },
    { id: "", type: "fn_call", category: "functions", label: "🔵 Llamar Función", params: { name: "miFuncion" }, children: [] },
    { id: "", type: "fn_inherit", category: "functions", label: "🔗 Heredar Función", params: { from: "base", name: "ext" }, children: [] },
];

const CATEGORY_COLORS: Record<string, string> = {
    event: "bg-purple-600 border-purple-400",
    control: "bg-yellow-600 border-yellow-400",
    blocks: "bg-green-700 border-green-500",
    variables: "bg-orange-600 border-orange-400",
    functions: "bg-blue-600 border-blue-400",
    movement: "bg-teal-600 border-teal-400",
};

function uid() { return Math.random().toString(36).slice(2, 9); }

function emptyGrid(): BlockType[][] {
    return Array.from({ length: PARCEL_SIZE }, () =>
        Array.from({ length: PARCEL_SIZE }, () => "grass" as BlockType)
    );
}

interface ParcelEditorProps {
    parcel: Parcel;
    readOnly?: boolean;
    onSave?: (parcel: Parcel) => void;
}

export default function ParcelEditor({ parcel, readOnly = false, onSave }: ParcelEditorProps) {
    const [grid, setGrid] = useState<BlockType[][]>(
        parcel.grid?.length ? parcel.grid : emptyGrid()
    );
    const [selectedBlock, setSelectedBlock] = useState<BlockType>("grass");
    const [program, setProgram] = useState<BlockInstruction[]>(parcel.program || []);
    const [isErasing, setIsErasing] = useState(false);
    const [isDrawing, setIsDrawing] = useState(false);
    const [activePanel, setActivePanel] = useState<"build" | "code">("build");
    const [runLog, setRunLog] = useState<string[]>([]);
    const [isRunning, setIsRunning] = useState(false);
    const [variables, setVariables] = useState<Record<string, number>>({});
    const [agentPos, setAgentPos] = useState(parcel.agentPos || { x: 0, y: PARCEL_SIZE - 1 });
    const [targetPos, setTargetPos] = useState(parcel.targetPos || { x: PARCEL_SIZE - 1, y: 0 });
    const [missionStatus, setMissionStatus] = useState<"idle" | "success" | "fail">("idle");
    
    // Stats & Gamification
    const [xp, setXp] = useState(0);
    const [level, setLevel] = useState(1);
    const [missionsCompleted, setMissionsCompleted] = useState(0);
    const [currentStreak, setCurrentStreak] = useState(0);
    const [bestTime, setBestTime] = useState<number | undefined>();
    const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
    const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);
    const [blocksPlaced, setBlocksPlaced] = useState(new Set<BlockType>());
    const { particles, addParticles, removeParticle } = useParticles();
    const [executionTime, setExecutionTime] = useState(0);

    // ── Grid Interactions ──────────────────────────────────────────────────────
    const paintCell = useCallback((row: number, col: number) => {
        if (readOnly) return;
        setGrid(prev => {
            const next = prev.map(r => [...r]);
            const blockToPlace = isErasing ? "air" : selectedBlock;
            
            // Solo actualizar si cambió
            if (next[row][col] === blockToPlace) return prev;
            
            next[row][col] = blockToPlace;
            
            // Agregar partículas visuales
            if (!isErasing && selectedBlock !== "air") {
                addParticles(col * 32 + 16, row * 32 + 16, BLOCK_EMOJIS[selectedBlock], 3);
                setBlocksPlaced(prev => new Set(prev).add(selectedBlock));
            }
            
            return next;
        });
    }, [isErasing, selectedBlock, readOnly, addParticles]);

    // ── Program Execution ──────────────────────────────────────────────────────
    const executeProgram = async () => {
        setIsRunning(true);
        setRunLog([]);
        const vars: Record<string, number> = {};
        let newGrid = grid.map(r => [...r]);
        const startTime = Date.now();

        const log = (msg: string) => setRunLog(prev => [...prev, msg]);
        let currentAgentPos = { ...agentPos };

        const execInstruction = async (instr: BlockInstruction) => {
            await new Promise(r => setTimeout(r, 400));

            switch (instr.type) {
                case "move_up":
                    if (currentAgentPos.y > 0) {
                        currentAgentPos.y -= 1;
                        setAgentPos({ ...currentAgentPos });
                        log(`🔼 Agente movido Arriba a (${currentAgentPos.x}, ${currentAgentPos.y})`);
                    } else log("⚠️ Agente chocó con el límite Superior");
                    break;
                case "move_down":
                    if (currentAgentPos.y < PARCEL_SIZE - 1) {
                        currentAgentPos.y += 1;
                        setAgentPos({ ...currentAgentPos });
                        log(`🔽 Agente movido Abajo a (${currentAgentPos.x}, ${currentAgentPos.y})`);
                    } else log("⚠️ Agente chocó con el límite Inferior");
                    break;
                case "move_left":
                    if (currentAgentPos.x > 0) {
                        currentAgentPos.x -= 1;
                        setAgentPos({ ...currentAgentPos });
                        log(`◀️ Agente movido Izquierda a (${currentAgentPos.x}, ${currentAgentPos.y})`);
                    } else log("⚠️ Agente chocó con el límite Izquierdo");
                    break;
                case "move_right":
                    if (currentAgentPos.x < PARCEL_SIZE - 1) {
                        currentAgentPos.x += 1;
                        setAgentPos({ ...currentAgentPos });
                        log(`▶️ Agente movido Derecha a (${currentAgentPos.x}, ${currentAgentPos.y})`);
                    } else log("⚠️ Agente chocó con el límite Derecho");
                    break;
                case "fn_arbol": {
                    const { x, y } = currentAgentPos;
                    // Draw a simple 3x3 tree around agent
                    for (let r = -2; r <= 0; r++) {
                        for (let c = -1; c <= 1; c++) {
                            const nr = y + r, nc = x + c;
                            if (nr >= 0 && nr < PARCEL_SIZE && nc >= 0 && nc < PARCEL_SIZE) {
                                if (r === 0 && c === 0) newGrid[nr][nc] = "wood";
                                else if (r < 0) newGrid[nr][nc] = "leaves";
                            }
                        }
                    }
                    setGrid(newGrid.map(r => [...r]));
                    log(`🌳 Función Arbol ejecutada en (${x}, ${y})`);
                    break;
                }
                case "block_place": {
                    const x = Number(instr.params.x), y = Number(instr.params.y);
                    const t = String(instr.params.type) as BlockType;
                    if (x >= 0 && x < PARCEL_SIZE && y >= 0 && y < PARCEL_SIZE) {
                        newGrid[y][x] = t;
                        setGrid(newGrid.map(r => [...r]));
                        log(`✅ Bloque ${t} colocado en (${x}, ${y})`);
                    } else log(`⚠️ Coordenadas fuera de límites: (${x}, ${y})`);
                    break;
                }
                case "block_destroy": {
                    const x = Number(instr.params.x), y = Number(instr.params.y);
                    if (x >= 0 && x < PARCEL_SIZE && y >= 0 && y < PARCEL_SIZE) {
                        newGrid[y][x] = "air";
                        setGrid(newGrid.map(r => [...r]));
                        log(`💥 Bloque destruido en (${x}, ${y})`);
                    }
                    break;
                }
                case "block_fill": {
                    const x1 = Number(instr.params.x1), y1 = Number(instr.params.y1);
                    const x2 = Number(instr.params.x2), y2 = Number(instr.params.y2);
                    const t = String(instr.params.type) as BlockType;
                    for (let r = Math.min(y1, y2); r <= Math.max(y1, y2) && r < PARCEL_SIZE; r++) {
                        for (let c = Math.min(x1, x2); c <= Math.max(x1, x2) && c < PARCEL_SIZE; c++) {
                            newGrid[r][c] = t;
                        }
                    }
                    setGrid(newGrid.map(r => [...r]));
                    log(`🎨 Área rellenada con ${t}`);
                    break;
                }
                case "var_create": {
                    vars[String(instr.params.name)] = Number(instr.params.value);
                    setVariables({ ...vars });
                    log(`📦 Variable "${instr.params.name}" = ${instr.params.value}`);
                    break;
                }
                case "var_change": {
                    const name = String(instr.params.name);
                    vars[name] = (vars[name] || 0) + Number(instr.params.delta);
                    setVariables({ ...vars });
                    log(`🔄 Variable "${name}" → ${vars[name]}`);
                    break;
                }
                case "control_repeat": {
                    const times = Number(instr.params.times);
                    log(`🔁 Iniciando bucle x${times}`);
                    for (let i = 0; i < times; i++) {
                        for (const child of instr.children || []) {
                            await execInstruction(child);
                        }
                    }
                    log(`🔁 Bucle completado`);
                    break;
                }
                case "fn_define":
                    log(`🔷 Función "${instr.params.name}" definida`);
                    break;
                case "fn_inherit":
                    log(`🔗 "${instr.params.name}" hereda de "${instr.params.from}"`);
                    break;
                default:
                    log(`▶️ ${instr.label}`);
            }
        };

        for (const instr of program) {
            await execInstruction(instr);
        }

        const endTime = Date.now();
        const executionTimeMs = endTime - startTime;
        setExecutionTime(executionTimeMs);

        if (currentAgentPos.x === targetPos.x && currentAgentPos.y === targetPos.y) {
            setMissionStatus("success");
            log("🏆 ¡OBJETIVO ALCANZADO! Reto superado.");
            
            // Efectos visuales celebración
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
            
            // XP y estadísticas
            const baseXP = 50;
            const speedBonus = executionTimeMs < 30000 ? 25 : 0;
            const totalXP = baseXP + speedBonus;
            setXp(prev => prev + totalXP);
            setMissionsCompleted(prev => prev + 1);
            setCurrentStreak(prev => prev + 1);
            
            // Actualizar mejor tiempo
            if (!bestTime || executionTimeMs < bestTime) {
                setBestTime(executionTimeMs);
            }
            
            // Validar logros
            checkAchievements();
            
            log(`✨ +${totalXP} XP ganados`);
            
            // Nivel up
            if (xp + totalXP >= level * 100) {
                setLevel(prev => prev + 1);
                confetti({ particleCount: 150, spread: 100 });
                log(`⭐ ¡NIVEL ${level + 1} ALCANZADO!`);
            }
        } else {
            log("🏁 Programa finalizado sin alcanzar el objetivo.");
            setCurrentStreak(0);
        }
        setIsRunning(false);
    };

    const checkAchievements = () => {
        const newUnlocked: Achievement[] = [];

        // First Block
        if (!unlockedAchievements.includes("first_block") && blocksPlaced.size > 0) {
            newUnlocked.push(ACHIEVEMENTS.find(a => a.id === "first_block")!);
        }

        // Speed Builder
        if (!unlockedAchievements.includes("speed_builder") && executionTime < 30000) {
            newUnlocked.push(ACHIEVEMENTS.find(a => a.id === "speed_builder")!);
        }

        // Artist
        if (!unlockedAchievements.includes("artist") && blocksPlaced.size >= 5) {
            newUnlocked.push(ACHIEVEMENTS.find(a => a.id === "artist")!);
        }

        // Perfect Score
        if (!unlockedAchievements.includes("perfect_score") && missionsCompleted === 0 && missionStatus === "success") {
            newUnlocked.push(ACHIEVEMENTS.find(a => a.id === "perfect_score")!);
        }

        // Ten Missions
        if (!unlockedAchievements.includes("ten_missions") && missionsCompleted >= 10) {
            newUnlocked.push(ACHIEVEMENTS.find(a => a.id === "ten_missions")!);
        }

        newUnlocked.forEach(achievement => {
            if (!unlockedAchievements.includes(achievement.id)) {
                setUnlockedAchievements(prev => [...prev, achievement.id]);
                setNewAchievement(achievement);
                setXp(prev => prev + achievement.points);
                
                // Celebración
                confetti({
                    particleCount: 80,
                    spread: 50,
                    origin: { x: 0.9, y: 0.1 }
                });
            }
        });
    };

    const addInstruction = (template: BlockInstruction) => {
        setProgram(prev => [...prev, { ...template, id: uid(), children: template.children ? [] : undefined }]);
    };

    const removeInstruction = (id: string) => {
        setProgram(prev => prev.filter(i => i.id !== id));
    };

    const updateParam = (id: string, key: string, value: string) => {
        setProgram(prev => prev.map(i => i.id === id ? { ...i, params: { ...i.params, [key]: value } } : i));
    };

    const resetGrid = () => {
        setGrid(emptyGrid());
        setRunLog([]);
        setVariables({});
        setAgentPos(parcel.agentPos || { x: 0, y: PARCEL_SIZE - 1 });
        setMissionStatus("idle");
        setBlocksPlaced(new Set());
        setExecutionTime(0);
    };

    return (
        <div className="flex h-full bg-[#0f1117] text-white overflow-hidden relative">
            <ParticleEffectRenderer particles={particles} removeParticle={removeParticle} />
            
            {/* Achievement Notification */}
            <AnimatePresence>
                {newAchievement && (
                    <AchievementNotification
                        achievement={newAchievement}
                        onDismiss={() => setNewAchievement(null)}
                    />
                )}
            </AnimatePresence>

            {/* Left: Grid */}
            <div className="flex-1 flex flex-col p-4 gap-3 overflow-hidden">
                <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setActivePanel("build")}
                            className={cn("px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all",
                                activePanel === "build" ? "bg-green-600 text-white" : "bg-white/5 text-slate-400 hover:bg-white/10")}
                        >
                            <Layers className="w-3.5 h-3.5" /> Construir
                        </button>
                        <button
                            onClick={() => setActivePanel("code")}
                            className={cn("px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all",
                                activePanel === "code" ? "bg-purple-600 text-white" : "bg-white/5 text-slate-400 hover:bg-white/10")}
                        >
                            <Code2 className="w-3.5 h-3.5" /> Programar
                        </button>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={resetGrid} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
                            <RotateCcw className="w-4 h-4 text-slate-400" />
                        </button>
                        {!readOnly && onSave && (
                            <button
                                onClick={() => onSave({ ...parcel, grid, program })}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold transition-all flex items-center gap-2"
                            >
                                <CheckCircle className="w-3.5 h-3.5" /> Guardar Parcela
                            </button>
                        )}
                    </div>
                </div>

                {/* Grid Canvas */}
                <div className="flex-1 flex items-center justify-center">
                    <div
                        className="grid gap-px bg-black/30 rounded-xl overflow-hidden border border-white/10 select-none"
                        style={{ gridTemplateColumns: `repeat(${PARCEL_SIZE}, 1fr)` }}
                        onMouseLeave={() => setIsDrawing(false)}
                    >
                        {grid.map((row, ri) =>
                            row.map((cell, ci) => (
                                <div
                                    key={`${ri}-${ci}`}
                                    onMouseDown={() => { setIsDrawing(true); paintCell(ri, ci); }}
                                    onMouseEnter={() => { if (isDrawing) paintCell(ri, ci); }}
                                    onMouseUp={() => setIsDrawing(false)}
                                    onContextMenu={(e) => { e.preventDefault(); setGrid(prev => { const n = prev.map(r => [...r]); n[ri][ci] = "air"; return n; }); }}
                                    title={`(${ci}, ${ri}) ${BLOCK_LABELS[cell]}`}
                                    className="w-8 h-8 relative cursor-crosshair transition-all duration-75 hover:brightness-125 flex items-center justify-center text-[10px]"
                                    style={{
                                        backgroundColor: cell === "air" ? "#1a1f2e" : BLOCK_COLORS[cell],
                                        border: cell === "air" ? "1px solid #2a2f3e" : "none",
                                    }}
                                >
                                    {/* Grid content */}
                                    {cell !== "air" && cell !== "grass" && cell !== "dirt" && cell !== "stone" && (
                                        <span className="pointer-events-none drop-shadow">{BLOCK_EMOJIS[cell]}</span>
                                    )}

                                    {/* Agent rendering */}
                                    {agentPos.x === ci && agentPos.y === ri && (
                                        <motion.div
                                            layoutId="agent"
                                            className="absolute inset-0 flex items-center justify-center text-xl z-30 pointer-events-none"
                                            initial={false}
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        >
                                            🤖
                                        </motion.div>
                                    )}

                                    {/* Target rendering */}
                                    {targetPos.x === ci && targetPos.y === ri && (
                                        <div className="absolute inset-0 flex items-center justify-center text-xl z-20 animate-pulse pointer-events-none">
                                            💎
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Status Banners */}
                <AnimatePresence>
                    {missionStatus === "success" && (
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="bg-emerald-500/20 border border-emerald-500/40 p-3 rounded-2xl flex items-center gap-3"
                        >
                            <CheckCircle className="w-5 h-5 text-emerald-400" />
                            <span className="text-emerald-400 font-bold text-sm">¡Excelente trabajo! Has construido y alcanzado el diamante.</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Variables Watch */}
                {Object.keys(variables).length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                        {Object.entries(variables).map(([name, val]) => (
                            <span key={name} className="px-2 py-1 bg-orange-500/20 border border-orange-500/40 rounded-lg text-xs font-mono text-orange-300">
                                {name} = {val}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Right: Toolbox & Stats */}
            <div className="w-80 bg-[#161b27] border-l border-white/5 flex flex-col overflow-hidden max-h-full">
                {/* Stats Section - Always Visible */}
                <div className="p-3 border-b border-white/5 overflow-y-auto max-h-[35%]">
                    <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-4 h-4 text-yellow-400" />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Tus Estadísticas</p>
                    </div>
                    <ParcelStats
                        xp={xp}
                        level={level}
                        missionsCompleted={missionsCompleted}
                        totalMissions={5}
                        bestTime={bestTime}
                        currentStreak={currentStreak}
                    />
                </div>

                {/* Tabs & Content */}
                <div className="flex-1 overflow-hidden flex flex-col">
                    {activePanel === "build" ? (
                        <>
                            {/* Block Palette */}
                            <div className="p-3 border-b border-white/5">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Bloques Disponibles</p>
                                <div className="grid grid-cols-4 gap-1.5">
                                    {PLACEABLE_BLOCKS.map(bt => (
                                        <button
                                            key={bt}
                                            onClick={() => { setSelectedBlock(bt); setIsErasing(false); }}
                                            title={BLOCK_LABELS[bt]}
                                            className={cn(
                                                "aspect-square rounded-lg flex items-center justify-center text-lg transition-all border-2",
                                                selectedBlock === bt && !isErasing
                                                    ? "border-white scale-110 shadow-lg shadow-white/20"
                                                    : "border-transparent hover:border-white/30"
                                            )}
                                            style={{ backgroundColor: BLOCK_COLORS[bt] }}
                                        >
                                            {BLOCK_EMOJIS[bt]}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="p-3 border-b border-white/5">
                                <button
                                    onClick={() => setIsErasing(!isErasing)}
                                    className={cn("w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all border",
                                        isErasing ? "bg-red-600 border-red-400 text-white" : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10")}
                                >
                                    <Trash2 className="w-3.5 h-3.5" /> {isErasing ? "Modo Borrar Activo" : "Borrar Bloque"}
                                </button>
                                <p className="text-[9px] text-slate-600 mt-2 text-center">Click izq: colocar · Click der: borrar · Arrastrar: pintar</p>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Instruction Palette */}
                            <div className="p-3 border-b border-white/5">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Instrucciones</p>
                                <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                                    {INSTRUCTION_TEMPLATES.map((tmpl, i) => (
                                        <button
                                            key={i}
                                            onClick={() => addInstruction(tmpl)}
                                            className={cn("w-full text-left px-3 py-2 rounded-xl text-xs font-bold border transition-all hover:brightness-110 active:scale-95",
                                                CATEGORY_COLORS[tmpl.category])}
                                        >
                                            {tmpl.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Program Sequence */}
                    {activePanel === "code" && (
                        <div className="flex-1 flex flex-col overflow-hidden">
                            <div className="px-3 py-2 flex justify-between items-center border-b border-white/5">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Mi Programa</p>
                                <button onClick={() => setProgram([])} className="p-1 rounded-lg hover:bg-white/10 transition-all">
                                    <Trash2 className="w-3.5 h-3.5 text-slate-500" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
                                {program.length === 0 && (
                                    <p className="text-center text-slate-600 text-xs mt-8 px-4">Añade instrucciones del panel de arriba para construir tu programa.</p>
                                )}
                                {program.map((instr) => (
                                    <motion.div
                                        key={instr.id}
                                        initial={{ x: -10, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        className={cn("p-2 rounded-xl border text-xs", CATEGORY_COLORS[instr.category])}
                                    >
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-bold">{instr.label}</span>
                                            <button onClick={() => removeInstruction(instr.id)} className="opacity-50 hover:opacity-100">
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                        {Object.entries(instr.params).map(([k, v]) => (
                                            <div key={k} className="flex items-center gap-1 mt-1">
                                                <span className="text-white/50 font-mono">{k}:</span>
                                                <input
                                                    value={String(v)}
                                                    onChange={e => updateParam(instr.id, k, e.target.value)}
                                                    className="flex-1 bg-black/30 border border-white/10 rounded px-1 py-0.5 text-[10px] font-mono text-white min-w-0"
                                                />
                                            </div>
                                        ))}
                                    </motion.div>
                                ))}
                            </div>
                            <div className="p-3 border-t border-white/5 space-y-2">
                                <button
                                    onClick={executeProgram}
                                    disabled={isRunning || program.length === 0}
                                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
                                >
                                    <Play className="w-4 h-4" />
                                    {isRunning ? "Ejecutando..." : "Ejecutar Programa"}
                                </button>
                                {runLog.length > 0 && (
                                    <div className="max-h-28 overflow-y-auto bg-black/40 rounded-xl p-2 space-y-0.5">
                                        {runLog.map((line, i) => (
                                            <p key={i} className="text-[10px] font-mono text-emerald-300">{line}</p>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
