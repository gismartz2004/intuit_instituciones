
import { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, Music } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function BackgroundMusic() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // URLs de música: local como primera opción, externa como fallback
    const LOCAL_MUSIC_URL = "/assets/audio/BackgroundMusic.mp3";
    const EXTERNAL_MUSIC_URL = "https://www.chosic.com/wp-content/uploads/2021/07/Rainy-Day-Games.mp3";

    useEffect(() => {
        // Inicializar el audio (intentar local primero)
        const audio = new Audio(LOCAL_MUSIC_URL);
        audio.loop = true;
        audio.volume = 0.3;

        // Manejo de errores: Si falla el local (404), intentar el externo
        audio.onerror = () => {
            if (audio.src.includes(LOCAL_MUSIC_URL)) {
                console.warn("Local music not found, falling back to external...");
                audio.src = EXTERNAL_MUSIC_URL;
                audio.load();
            }
        };

        audioRef.current = audio;

        return () => {
            audio.pause();
            audioRef.current = null;
        };
    }, []);

    const toggleMusic = () => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play().catch(err => {
                console.warn("Autoplay blocked or audio error:", err);
            });
        }
        setIsPlaying(!isPlaying);
    };

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex items-center gap-3">
            <AnimatePresence>
                {isPlaying && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="bg-slate-900/60 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/10 flex items-center gap-3 shadow-2xl"
                    >
                        <div className="flex gap-1 items-end h-3">
                            <motion.div
                                animate={{ height: [4, 12, 6, 10, 4] }}
                                transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                                className="w-1 bg-blue-400 rounded-full"
                            />
                            <motion.div
                                animate={{ height: [8, 4, 12, 6, 8] }}
                                transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                                className="w-1 bg-blue-400 rounded-full"
                            />
                            <motion.div
                                animate={{ height: [12, 6, 10, 4, 12] }}
                                transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
                                className="w-1 bg-blue-400 rounded-full"
                            />
                        </div>
                        <span className="text-[10px] font-bold text-blue-200 uppercase tracking-widest">Ambient Mode</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleMusic}
                className={
                    `w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all shadow-2xl
                    ${isPlaying ? 'bg-blue-600 border-white/20 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]' : 'bg-slate-900/40 backdrop-blur-md border-white/5 text-slate-400 hover:border-white/20'}
                    `
                }
            >
                {isPlaying ? <Music className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </motion.button>
        </div>
    );
}
