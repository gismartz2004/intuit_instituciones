import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, User, Palette, ShoppingBag, X, Star, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModularAvatar } from "./ModularAvatar";
import { cn } from "@/lib/utils";

const HAIR_STYLES = [
    { id: "classic", name: "Clásico" },
    { id: "spiky", name: "Punk" },
    { id: "long", name: "Coleta" },
    { id: "modern", name: "Capa" },
];

const COLORS = [
    "#4A2B11", "#1E293B", "#D97706", "#9333EA", "#2563EB", "#059669", "#DC2626", "#F0ABFC"
];

const SKIN_TONES = [
    "#FFDBAC", "#F1C27D", "#E0AC69", "#8D5524", "#C68642"
];

const OUTFITS = [
    { id: "standard", name: "Básico", color: "bg-indigo-900", premium: false },
    { id: "scholar", name: "Académico", color: "bg-slate-800", premium: false },
    { id: "explorer", name: "Explorador", color: "bg-emerald-800", premium: true },
    { id: "cyber", name: "Cyber", color: "bg-fuchsia-900", premium: true },
];

interface AvatarCustomizerProps {
    onClose: () => void;
    onSave: (config: any) => void;
    initialConfig?: any;
}

export default function AvatarCustomizer({ onClose, onSave, initialConfig }: AvatarCustomizerProps) {
    const [activeTab, setActiveTab] = useState<"hair" | "skin" | "outfit">("hair");
    const [config, setConfig] = useState(initialConfig || {
        hairStyle: "classic",
        hairColor: "#4A2B11",
        skinColor: "#FFDBAC",
        outfitId: "standard"
    });

    const handleSave = () => {
        localStorage.setItem('student_avatar_config', JSON.stringify(config));
        onSave(config);
        onClose();
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-2xl flex items-center justify-center p-0 md:p-8"
        >
            <div className="bg-slate-900 w-full max-w-6xl h-full md:h-[85vh] md:rounded-[3rem] border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col md:flex-row relative">

                {/* Close Button Mobile */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 z-[110] w-12 h-12 bg-white/5 md:bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-center text-white transition-all transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Left: Preview Area */}
                <div className="w-full md:flex-1 relative bg-gradient-to-b from-indigo-950 via-slate-950 to-slate-950 flex flex-col items-center justify-center p-8 overflow-hidden min-h-[300px]">

                    <div className="absolute top-8 left-8 flex items-center gap-3">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-600/20 rounded-xl md:rounded-2xl flex items-center justify-center text-purple-400">
                            <User className="w-5 h-5 md:w-6 md:h-6" />
                        </div>
                        <div>
                            <h2 className="text-white font-black text-lg md:text-xl uppercase tracking-tighter">Armario</h2>
                            <p className="text-slate-500 text-[8px] md:text-[10px] font-bold uppercase tracking-widest">Estilo Intuit v2.1</p>
                        </div>
                    </div>

                    <motion.div
                        key={JSON.stringify(config)}
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        className="w-full max-w-[200px] md:max-w-xs aspect-square relative z-10"
                    >
                        <ModularAvatar
                            {...config}
                            className="w-full h-full"
                        />
                    </motion.div>

                    <div className="absolute inset-0 pointer-events-none opacity-20">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600 blur-[150px] rounded-full" />
                        <div className="absolute inset-0 border-[20px] border-white/[0.02] m-12 rounded-[3rem]" />
                    </div>

                    <Button
                        onClick={handleSave}
                        className="absolute bottom-8 right-8 hidden md:flex bg-yellow-400 hover:bg-yellow-500 text-slate-900 h-16 px-12 rounded-2xl font-black uppercase tracking-widest shadow-[0_0_30px_rgba(234,179,8,0.4)] transition-all hover:scale-105"
                    >
                        Confirmar Cambio
                    </Button>
                </div>

                {/* Right: Controls Area */}
                <div className="flex-1 md:w-[420px] bg-slate-950/50 backdrop-blur-3xl flex flex-col p-6 md:p-8 border-l border-white/5">

                    {/* Tabs */}
                    <div className="flex gap-1 mb-6 md:mb-8 p-1 bg-white/5 rounded-2xl shrink-0">
                        {["hair", "skin", "outfit"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={cn(
                                    "flex-1 h-12 rounded-xl flex items-center justify-center gap-2 font-bold text-[10px] md:text-xs uppercase tracking-widest transition-all",
                                    activeTab === tab ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'
                                )}
                            >
                                {tab === "hair" && <Palette className="w-4 h-4" />}
                                {tab === "skin" && <User className="w-4 h-4" />}
                                {tab === "outfit" && <ShoppingBag className="w-4 h-4" />}
                                <span className="hidden sm:inline">{tab === 'hair' ? 'Cabello' : tab === 'skin' ? 'Piel' : 'Ropa'}</span>
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 min-h-0">
                        <AnimatePresence mode="wait">
                            {activeTab === 'hair' && (
                                <motion.div
                                    key="hair"
                                    initial={{ x: 20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: -20, opacity: 0 }}
                                    className="space-y-8"
                                >
                                    <section>
                                        <label className="text-[10px] font-black uppercase text-slate-500 mb-4 block tracking-widest">Estilo de Peinado</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {HAIR_STYLES.map(style => (
                                                <button
                                                    key={style.id}
                                                    onClick={() => setConfig({ ...config, hairStyle: style.id })}
                                                    className={cn(
                                                        "h-14 rounded-2xl border-2 font-bold text-sm transition-all",
                                                        config.hairStyle === style.id ? "bg-white/10 border-purple-500 text-white" : "bg-white/5 border-transparent text-slate-500 hover:bg-white/10"
                                                    )}
                                                >
                                                    {style.name}
                                                </button>
                                            ))}
                                        </div>
                                    </section>

                                    <section>
                                        <label className="text-[10px] font-black uppercase text-slate-500 mb-4 block tracking-widest">Color del Cabello</label>
                                        <div className="flex flex-wrap gap-3">
                                            {COLORS.map(color => (
                                                <button
                                                    key={color}
                                                    onClick={() => setConfig({ ...config, hairColor: color })}
                                                    style={{ backgroundColor: color }}
                                                    className={cn(
                                                        "w-10 h-10 rounded-full border-4 transition-all flex items-center justify-center",
                                                        config.hairColor === color ? "border-white scale-110 shadow-lg" : "border-transparent"
                                                    )}
                                                >
                                                    {config.hairColor === color && <Check className="w-4 h-4 text-white drop-shadow-md" />}
                                                </button>
                                            ))}
                                        </div>
                                    </section>
                                </motion.div>
                            )}

                            {activeTab === 'skin' && (
                                <motion.div
                                    key="skin"
                                    initial={{ x: 20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    className="space-y-4"
                                >
                                    <label className="text-[10px] font-black uppercase text-slate-500 mb-4 block tracking-widest">Tono de Piel</label>
                                    <div className="grid grid-cols-3 gap-4">
                                        {SKIN_TONES.map(color => (
                                            <button
                                                key={color}
                                                onClick={() => setConfig({ ...config, skinColor: color })}
                                                style={{ backgroundColor: color }}
                                                className={cn(
                                                    "aspect-square rounded-2xl border-4 transition-all flex items-center justify-center",
                                                    config.skinColor === color ? "border-purple-500 ring-4 ring-purple-500/20 scale-105 shadow-xl" : "border-transparent"
                                                )}
                                            >
                                                {config.skinColor === color && <Check className="w-6 h-6 text-slate-900 opacity-30" />}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'outfit' && (
                                <motion.div
                                    key="outfit"
                                    initial={{ x: 20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    className="space-y-4"
                                >
                                    {OUTFITS.map(outfit => (
                                        <button
                                            key={outfit.id}
                                            onClick={() => setConfig({ ...config, outfitId: outfit.id })}
                                            className={cn(
                                                "w-full p-4 rounded-3xl border-2 flex items-center gap-4 transition-all group overflow-hidden relative",
                                                config.outfitId === outfit.id ? "bg-white/10 border-purple-500" : "bg-white/5 border-transparent opacity-60 hover:opacity-100"
                                            )}
                                        >
                                            <div className={cn("w-14 h-14 rounded-2xl shadow-xl", outfit.color)} />
                                            <div className="text-left flex-1">
                                                <h4 className="text-white font-black uppercase text-xs">{outfit.name}</h4>
                                                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Colección Intuit</p>
                                            </div>
                                            {outfit.premium ? (
                                                <div className="bg-yellow-400/10 px-3 py-1 rounded-full flex items-center gap-1.5 border border-yellow-400/20">
                                                    <Lock className="w-3 h-3 text-yellow-500" />
                                                    <span className="text-[8px] font-black text-yellow-500 uppercase tracking-widest">Legendario</span>
                                                </div>
                                            ) : (
                                                config.outfitId === outfit.id && <Check className="w-5 h-5 text-purple-500" />
                                            )}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Mobile Save Button */}
                    <Button
                        onClick={handleSave}
                        className="w-full mt-6 bg-yellow-400 hover:bg-yellow-500 text-slate-900 h-14 rounded-2xl font-black uppercase tracking-widest text-xs flex md:hidden shrink-0"
                    >
                        Confirmar Cambio
                    </Button>

                    {/* Tip Card */}
                    <div className="mt-8 p-6 bg-gradient-to-br from-slate-900 to-indigo-950 rounded-[2rem] border border-white/5 hidden md:block">
                        <div className="flex items-center gap-3">
                            <Star className="w-5 h-5 text-yellow-400" fill="currentColor" />
                            <h4 className="text-white font-bold text-xs uppercase tracking-widest">Estado Premium</h4>
                        </div>
                        <p className="text-slate-500 text-[10px] font-bold mt-2 leading-relaxed">
                            Las ropas de explorador y cyber se desbloquean al completar 10 niveles con 3 estrellas. ¡Sigue aprendiendo!
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
