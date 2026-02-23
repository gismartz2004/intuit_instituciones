import { motion, Variants } from "framer-motion";

interface LoginOwlProps {
    state: "idle" | "email" | "password" | "submitting" | "success" | "error";
    inputLength?: number;
}

export default function LoginOwl({ state, inputLength = 0 }: LoginOwlProps) {
    // Horizontal offset for eye tracking (email)
    const horizontalOffset = state === "email" ? Math.min(Math.max((inputLength / 15) * 6 - 3, -6), 6) : 0;

    // Animation variants
    const eyeVariants: Variants = {
        idle: { scaleY: 1, x: 0, y: 0 },
        email: { scaleY: 1, x: horizontalOffset, y: 3 },
        password: { scaleY: 0.1, x: 0, y: 0 },
        submitting: { rotate: 360 },
        success: { scaleY: 1, scale: 1.2, x: 0, y: 0 },
        error: { scaleY: 0.3, y: 2, rotate: [0, 15, -15, 0] }
    };

    return (
        <div className="relative w-48 h-48 mx-auto flex items-center justify-center pointer-events-none">
            <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
                {/* Shadow floor */}
                <ellipse cx="100" cy="185" rx="40" ry="10" fill="black" opacity="0.2" />

                <motion.g
                    animate={{ y: [0, -3, 0] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                >
                    {/* Main Body */}
                    <motion.path
                        d="M55 160 C 55 70, 145 70, 145 160 L 145 180 L 55 180 Z"
                        fill="#4C1D95"
                        animate={state === 'error' ? { x: [0, -3, 3, 0] } : {}}
                        transition={state === 'error' ? { repeat: Infinity, duration: 0.2 } : {}}
                    />

                    {/* Belly Patch */}
                    <path d="M70 160 C 70 100, 130 100, 130 160" fill="#7C3AED" opacity="0.4" />

                    {/* Head */}
                    <motion.ellipse
                        cx="100" cy="95" rx="58" ry="52"
                        fill="#5B21B6"
                        animate={state === 'submitting' ? { rotate: [0, 8, -8, 0] } : {}}
                        transition={{ repeat: Infinity, duration: 0.5 }}
                    />

                    {/* Ears */}
                    <path d="M50 65 L65 40 L85 70 Z" fill="#4C1D95" />
                    <path d="M150 65 L135 40 L115 70 Z" fill="#4C1D95" />

                    {/* Eyes Backing */}
                    <circle cx="72" cy="90" r="22" fill="white" />
                    <circle cx="128" cy="90" r="22" fill="white" />

                    {/* Pupils */}
                    <motion.circle
                        cx="72" cy="90" r="10"
                        fill="#1E1B4B"
                        variants={eyeVariants}
                        animate={state}
                        transition={state === 'submitting' ? { repeat: Infinity, duration: 2, ease: "linear" } : { duration: 0.3, type: "spring" }}
                    />
                    <motion.circle
                        cx="128" cy="90" r="10"
                        fill="#1E1B4B"
                        variants={eyeVariants}
                        animate={state}
                        transition={state === 'submitting' ? { repeat: Infinity, duration: 2, ease: "linear" } : { duration: 0.3, type: "spring" }}
                    />

                    {/* Beak */}
                    <path d="M95 105 Q 100 125 105 105 Z" fill="#F59E0B" />
                </motion.g>

                {/* Success Blush */}
                {state === 'success' && (
                    <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <circle cx="55" cy="110" r="6" fill="#F472B6" opacity="0.6" />
                        <circle cx="145" cy="110" r="6" fill="#F472B6" opacity="0.6" />
                    </motion.g>
                )}
            </svg>

            {/* Sparkles */}
            {state === 'success' && (
                <motion.div className="absolute inset-0">
                    {[...Array(6)].map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ scale: 0, x: 0, y: 0 }}
                            animate={{
                                scale: [0, 1, 0],
                                x: (Math.random() - 0.5) * 150,
                                y: (Math.random() - 0.5) * 150
                            }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                            className="absolute top-1/2 left-1/2 text-yellow-400 text-xl"
                        >
                            ✦
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </div>
    );
}
