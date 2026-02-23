import { motion } from "framer-motion";

interface ModularAvatarProps {
    hairStyle?: "classic" | "spiky" | "long" | "modern";
    hairColor?: string;
    skinColor?: string;
    outfitId?: "standard" | "scholar" | "explorer" | "cyber";
    className?: string;
    animate?: boolean;
}

export const ModularAvatar = ({
    hairStyle = "classic",
    hairColor = "#4A2B11",
    skinColor = "#FFDBAC",
    outfitId = "standard",
    className = "w-full h-full",
    animate = true
}: ModularAvatarProps) => {
    return (
        <div className={className}>
            <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl overflow-visible">
                <motion.g
                    animate={animate ? { y: [0, -4, 0] } : {}}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                >
                    {/* Shadow */}
                    <ellipse cx="100" cy="190" rx="35" ry="8" fill="black" opacity="0.15" />

                    {/* Body / Outfit */}
                    <path
                        d="M60 180 Q 100 185, 140 180 L 140 140 Q 100 130, 60 140 Z"
                        fill={
                            outfitId === "standard" ? "#312E81" :
                                outfitId === "scholar" ? "#1E293B" :
                                    outfitId === "explorer" ? "#065F46" :
                                        "#701A75"
                        }
                    />

                    {/* Details based on outfit */}
                    {outfitId === "scholar" && (
                        <path d="M80 140 L 100 155 L 120 140" fill="none" stroke="white" strokeWidth="2" opacity="0.5" />
                    )}
                    {outfitId === "cyber" && (
                        <path d="M60 150 L 140 150" stroke="#F0ABFC" strokeWidth="4" opacity="0.3" />
                    )}

                    {/* Neck */}
                    <rect x="90" y="130" width="20" height="20" fill={skinColor} />

                    {/* Head */}
                    <ellipse cx="100" cy="95" rx="45" ry="52" fill={skinColor} />

                    {/* Hair Styles */}
                    <g fill={hairColor}>
                        {hairStyle === "classic" && (
                            <path d="M55 90 C 50 40, 150 40, 145 90 L 145 70 Q 100 40, 55 70 Z" />
                        )}
                        {hairStyle === "spiky" && (
                            <path d="M55 85 L 60 40 L 80 65 L 100 30 L 120 65 L 140 40 L 145 85 Z" />
                        )}
                        {hairStyle === "long" && (
                            <path d="M52 80 C 40 100, 42 165, 65 170 L 100 165 L 135 170 C 158 165, 160 100, 148 80 C 145 35, 55 35, 52 80" />
                        )}
                        {hairStyle === "modern" && (
                            <path d="M50 90 C 50 30, 150 30, 150 90 L 150 110 Q 130 100, 110 115 Q 90 90, 50 110 Z" />
                        )}
                    </g>

                    {/* Eyes */}
                    <g fill="#1E293B">
                        <circle cx="85" cy="100" r="5" />
                        <circle cx="115" cy="100" r="5" />
                    </g>

                    {/* Eye Lids (Blinking) */}
                    <motion.ellipse
                        cx="85" cy="98" rx="7" ry="4" fill={skinColor}
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: [0, 1, 0] }}
                        transition={{ repeat: Infinity, duration: 4, times: [0, 0.05, 0.1], delay: 1 }}
                    />
                    <motion.ellipse
                        cx="115" cy="98" rx="7" ry="4" fill={skinColor}
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: [0, 1, 0] }}
                        transition={{ repeat: Infinity, duration: 4, times: [0, 0.05, 0.1], delay: 1 }}
                    />

                    {/* Mouth */}
                    <path d="M90 128 Q 100 135, 110 128" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" />
                </motion.g>
            </svg>
        </div>
    );
};
